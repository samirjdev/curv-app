import os
import json
import feedparser
from datetime import datetime, timedelta
from typing import List, Dict
from dotenv import load_dotenv
import google.generativeai as genai
from dateutil.parser import parse
import hashlib
import time
import functools

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

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
        # Try parsing with dateutil
        parsed_date = parse(date_str)
        return parsed_date.strftime('%Y-%m-%d')
    except Exception as e:
        print(f"Error parsing date {date_str}: {str(e)}")
        return get_yesterdays_date()

@cache_result(ttl_seconds=3600)
def fetch_articles_from_rss(target_date: str) -> List[Dict]:
    """
    Fetch entertainment articles from RSS feeds for a specific date
    Returns a list of articles in the specified format
    """
    articles = []
    
    # Use a subset of the most reliable RSS feeds
    rss_feeds = [
        'https://www.hollywoodreporter.com/feed',
        'https://variety.com/feed/',
        'https://deadline.com/feed/',
        'https://www.rollingstone.com/feed/',
        'https://www.billboard.com/feed/',
        'https://www.polygon.com/rss/index.xml',
        'https://www.ign.com/feeds/news',
        'https://www.engadget.com/rss.xml',
        'https://www.theverge.com/rss/index.xml',
        'https://www.wired.com/feed/rss'
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
    try:
        # Use the correct model name for Gemini
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Create a prompt for Gemini
        prompt = f"""
        Analyze this entertainment article and provide a brief summary:
        Headline: {article['headline']}
        Text: {article['text']}
        """
        
        response = model.generate_content(prompt)
        
        # Try to parse the JSON response
        try:
            # Extract JSON from the response
            response_text = response.text
            # Find JSON content between triple backticks if present
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            analysis = json.loads(json_str)
            
            # Add the analysis to the article
            article['gemini_analysis'] = analysis
            
        except json.JSONDecodeError:
            # If JSON parsing fails, store the raw text
            article['gemini_analysis'] = {
                'summary': response_text[:200] + '...',
                'key_points': [],
                'related_topics': []
            }
            
    except Exception as e:
        # Handle API key errors gracefully
        if "API key expired" in str(e) or "API_KEY_INVALID" in str(e):
            print(f"API key error: {str(e)}")
            # Add a placeholder analysis
            article['gemini_analysis'] = {
                'summary': "API key error - analysis not available",
                'key_points': [],
                'related_topics': []
            }
        else:
            print(f"Error analyzing article with Gemini: {str(e)}")
            # Add a placeholder analysis
            article['gemini_analysis'] = {
                'summary': "Error analyzing article",
                'key_points': [],
                'related_topics': []
            }
    
    return article

def is_article_interesting(headline: str) -> bool:
    """
    Determine if an article is interesting based on its headline.
    Returns True if the article is interesting, False otherwise.
    """
    # Use sets for faster lookups
    uninteresting_keywords = {'review', 'best', 'top', 'guide', 'how to', 'deal', 'sale', 'offer', 'discount', 'promotion'}
    
    # Check uninteresting keywords first (faster rejection)
    if any(keyword in headline.lower() for keyword in uninteresting_keywords):
        return False
    
    # Use a more focused set of interesting keywords
    interesting_keywords = {
        'movie', 'film', 'cinema', 'tv', 'television', 'series',
        'music', 'song', 'album', 'artist', 'band', 'singer',
        'game', 'gaming', 'console', 'playstation', 'xbox', 'nintendo',
        'award', 'ceremony', 'red carpet', 'nomination', 'winner',
        'celebrity', 'star', 'actor', 'actress', 'director', 'producer'
    }
    
    return any(keyword in headline.lower() for keyword in interesting_keywords)

def get_daily_entertainment_articles() -> List[Dict]:
    """
    Main function to get daily entertainment articles
    """
    # Get yesterday's date
    yesterday = get_yesterdays_date()
    
    # Fetch articles from RSS feeds
    articles = fetch_articles_from_rss(yesterday)
    
    # Filter and analyze interesting articles
    formatted_articles = []
    for article in articles:
        if is_article_interesting(article['headline']):
            # Analyze the article with Gemini
            analyzed_article = analyze_article_with_gemini(article)
            
            # Generate a deterministic ID using MD5
            id_string = f"{article['headline']}{article['published_date']}"
            article_id = hashlib.md5(id_string.encode()).hexdigest()
            
            # Ensure gemini_analysis is present
            if 'gemini_analysis' not in analyzed_article:
                analyzed_article['gemini_analysis'] = {
                    'summary': "Analysis not available",
                    'key_points': [],
                    'related_topics': []
                }
            
            formatted_article = {
                "_id": {"$oid": article_id},
                "topic": "entertainment",
                "headline": article['headline'],
                "date": article['published_date'],
                "comments": [],
                "emoji": "🎬",
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
    articles = get_daily_entertainment_articles()
    end_time = time.time()
    
    print(f"\nFound {len(articles)} entertainment articles from {get_yesterdays_date()}")
    print(f"Execution time: {end_time - start_time:.2f} seconds")
    
    for article in articles:
        print("\nArticle:")
        print(f"Topic: {article['topic']} {article['emoji']}")
        print(f"Headline: {article['headline']}")
        print(f"Date: {article['date']}")
        print(f"Sources: {', '.join(article['sources'])}")
        print("-" * 80) 