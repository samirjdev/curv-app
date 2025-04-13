import os
import json
import feedparser
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dotenv import load_dotenv
import google.generativeai as genai
from dateutil.parser import parse
import hashlib
import time
import functools

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.getenv('GOOGLE_API_KEY')
if api_key:
    genai.configure(api_key=api_key)
    USE_GEMINI = True
else:
    USE_GEMINI = False
    print("Warning: GOOGLE_API_KEY not found. Article analysis will be skipped.")

# Cache for API responses
api_cache = {}

# Cache for RSS feed results
feed_cache = {}

def cache_result(ttl_seconds=3600):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            current_time = time.time()
            
            if cache_key in api_cache:
                result, timestamp = api_cache[cache_key]
                if current_time - timestamp < ttl_seconds:
                    return result
            
            result = func(*args, **kwargs)
            api_cache[cache_key] = (result, current_time)
            return result
        return wrapper
    return decorator

def get_yesterdays_date() -> str:
    """Get yesterday's date in YYYY-MM-DD format"""
    yesterday = datetime.now() - timedelta(days=1)
    return yesterday.strftime('%Y-%m-%d')

def parse_date(date_str: str) -> str:
    """Parse various date formats and return YYYY-MM-DD"""
    try:
        parsed_date = parse(date_str)
        return parsed_date.strftime('%Y-%m-%d')
    except Exception as e:
        print(f"Error parsing date {date_str}: {str(e)}")
        return get_yesterdays_date()

@cache_result(ttl_seconds=3600)
def fetch_articles_from_rss(target_date: str) -> List[Dict]:
    """
    Fetch political news articles from RSS feeds for a specific date
    Returns a list of articles in the specified format
    """
    articles = []
    
    # Comprehensive list of political news RSS feeds
    rss_feeds = [
        # Major News Organizations
        'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
        'https://feeds.washingtonpost.com/rss/politics',
        'https://www.politico.com/rss/politics.xml',
        'https://www.theguardian.com/politics/rss',
        'https://www.bbc.co.uk/news/politics/rss.xml',
        'https://www.reuters.com/politics/rss',
        
        # Political News Websites
        'https://thehill.com/rss/feed',
        'https://www.realclearpolitics.com/index.xml',
        'https://www.vox.com/rss/politics/index.xml',
        'https://www.axios.com/feeds/feed.rss',
        
        # International Politics
        'https://www.aljazeera.com/xml/rss/all.xml',
        'https://www.economist.com/politics/rss.xml',
        'https://foreignpolicy.com/feed/',
        'https://www.cfr.org/rss.xml'
    ]
    
    for feed_url in rss_feeds:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries:
                article_date = parse_date(entry.get('published', ''))
                if article_date == target_date:
                    articles.append({
                        'headline': entry.get('title', ''),
                        'published_date': article_date,
                        'text': entry.get('summary', ''),
                        'sources': [feed_url]
                    })
        except Exception as e:
            print(f"Error fetching from {feed_url}: {str(e)}")
    
    return articles

@cache_result(ttl_seconds=3600)
def analyze_article_with_gemini(article: Dict) -> Dict:
    """
    Use Gemini to analyze a single article
    """
    # Skip analysis if Gemini is not configured
    if not USE_GEMINI:
        article['gemini_analysis'] = {
            'summary': "Analysis skipped - API key not configured",
            'key_points': [],
            'related_topics': []
        }
        return article
        
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        prompt = f"""
        Analyze this political news article and provide a brief summary:
        Headline: {article['headline']}
        Text: {article['text']}
        
        Please provide:
        1. A concise, objective summary
        2. Key points
        3. Related topics or context
        
        Format the response as JSON with these fields:
        - summary
        - key_points (as a list)
        - related_topics (as a list)
        """
        
        response = model.generate_content(prompt)
        
        try:
            response_text = response.text
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            analysis = json.loads(json_str)
            article['gemini_analysis'] = analysis
            
        except json.JSONDecodeError:
            article['gemini_analysis'] = {
                'summary': response_text[:200] + '...',
                'key_points': [],
                'related_topics': []
            }
            
    except Exception as e:
        if "API key expired" in str(e) or "API_KEY_INVALID" in str(e):
            print(f"API key error: {str(e)}")
            article['gemini_analysis'] = {
                'summary': "API key error - analysis not available",
                'key_points': [],
                'related_topics': []
            }
        else:
            print(f"Error analyzing article with Gemini: {str(e)}")
            article['gemini_analysis'] = {
                'summary': "Error analyzing article",
                'key_points': [],
                'related_topics': []
            }
    
    return article

def is_article_interesting(headline: str) -> bool:
    """
    Determine if a political article is interesting based on its headline.
    Returns True if the article is interesting, False otherwise.
    """
    # Keywords to filter out
    uninteresting_keywords = {
        'opinion', 'commentary', 'letter to the editor', 'sponsored',
        'advertisement', 'promoted', 'podcast', 'newsletter', 'subscribe'
    }
    
    # Check uninteresting keywords first (faster rejection)
    if any(keyword in headline.lower() for keyword in uninteresting_keywords):
        return False
    
    # Keywords for interesting political articles
    interesting_keywords = {
        # Government and Politics
        'congress', 'senate', 'house', 'parliament', 'legislation', 'bill',
        'policy', 'government', 'administration', 'election', 'campaign',
        'vote', 'ballot', 'democracy', 'democratic', 'republican',
        
        # Political Figures and Institutions
        'president', 'minister', 'senator', 'representative', 'governor',
        'cabinet', 'supreme court', 'justice department', 'state department',
        
        # Political Issues
        'reform', 'regulation', 'law', 'amendment', 'resolution',
        'diplomacy', 'foreign policy', 'domestic policy', 'national security',
        'immigration', 'trade', 'economy', 'climate', 'healthcare',
        
        # International Politics
        'international', 'global', 'treaty', 'summit', 'alliance',
        'diplomatic', 'sanctions', 'united nations', 'eu', 'nato',
        
        # Political Events
        'debate', 'hearing', 'investigation', 'impeachment', 'resignation',
        'appointment', 'nomination', 'agreement', 'deal', 'crisis'
    }
    
    return any(keyword in headline.lower() for keyword in interesting_keywords)

def get_daily_politics_articles(skip_analysis: bool = False) -> List[Dict]:
    """
    Main function to get daily political news articles
    
    Args:
        skip_analysis: If True, skip Gemini analysis to improve performance
    """
    yesterday = get_yesterdays_date()
    articles = fetch_articles_from_rss(yesterday)
    
    formatted_articles = []
    for article in articles:
        if is_article_interesting(article['headline']):
            # Skip analysis if requested or if Gemini is not configured
            if skip_analysis or not USE_GEMINI:
                analyzed_article = article
                analyzed_article['gemini_analysis'] = {
                    'summary': "Analysis skipped for performance",
                    'key_points': [],
                    'related_topics': []
                }
            else:
                analyzed_article = analyze_article_with_gemini(article)
            
            id_string = f"{article['headline']}{article['published_date']}"
            article_id = hashlib.md5(id_string.encode()).hexdigest()
            
            if 'gemini_analysis' not in analyzed_article:
                analyzed_article['gemini_analysis'] = {
                    'summary': "Analysis not available",
                    'key_points': [],
                    'related_topics': []
                }
            
            formatted_article = {
                "_id": {"$oid": article_id},
                "topic": "politics",
                "headline": article['headline'],
                "date": article['published_date'],
                "comments": [],
                "emoji": "🏛️",
                "ratings": [],
                "sources": article['sources'],
                "text": article['text'],
                "gemini_analysis": analyzed_article['gemini_analysis']
            }
            
            formatted_articles.append(formatted_article)
    
    return formatted_articles

# Example usage
if __name__ == "__main__":
    start_time = time.time()
    # Use skip_analysis=True to improve performance
    articles = get_daily_politics_articles(skip_analysis=True)
    end_time = time.time()
    
    print(f"\nFound {len(articles)} political articles from {get_yesterdays_date()}")
    print(f"Execution time: {end_time - start_time:.2f} seconds")
    
    for article in articles:
        print("\nArticle:")
        print(f"Topic: {article['topic']} {article['emoji']}")
        print(f"Headline: {article['headline']}")
        print(f"Date: {article['date']}")
        print(f"Sources: {', '.join(article['sources'])}")
        print("-" * 80) 