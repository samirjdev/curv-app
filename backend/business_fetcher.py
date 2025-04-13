import os
import json
from datetime import datetime, timedelta
import feedparser
from dotenv import load_dotenv
import google.generativeai as genai
from typing import List, Dict, Any
import dateutil.parser

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def get_yesterdays_date() -> str:
    """Get yesterday's date in YYYY-MM-DD format"""
    yesterday = datetime.now() - timedelta(days=1)
    return yesterday.strftime('%Y-%m-%d')

def parse_date(date_str: str) -> str:
    """Parse various date formats and return YYYY-MM-DD"""
    try:
        # Try parsing with dateutil
        parsed_date = dateutil.parser.parse(date_str)
        return parsed_date.strftime('%Y-%m-%d')
    except Exception as e:
        print(f"Error parsing date {date_str}: {str(e)}")
        return None

def fetch_articles_from_rss(date: str) -> List[Dict]:
    """
    Fetch business articles from RSS feeds for a specific date
    Returns a list of articles in the specified format
    """
    # RSS feed URLs for business topic
    business_rss_feeds = [
        'https://feeds.feedburner.com/entrepreneur/latest',
        'https://feeds.feedburner.com/venturebeat/SZYF',
        'https://feeds.feedburner.com/TechCrunch/startups',
        'https://feeds.feedburner.com/TechCrunch/venture',
        'https://feeds.feedburner.com/TechCrunch/funding',
        'https://feeds.feedburner.com/TechCrunch/ipo',
        'https://feeds.feedburner.com/TechCrunch/mergers',
        'https://feeds.feedburner.com/TechCrunch/acquisitions',
        'https://feeds.feedburner.com/TechCrunch/stock',
        'https://feeds.feedburner.com/TechCrunch/market',
        'https://www.bloomberg.com/feed/rss',
        'https://www.cnbc.com/id/19746125/site/rss/',
        'https://www.forbes.com/feed/',
        'https://finance.yahoo.com/news/rss/',
        'https://www.marketwatch.com/rss/',
        'https://www.reuters.com/business/rss/',
        'https://hbr.org/resources/rss',
        'https://www.mckinsey.com/feeds/latest.xml',
        'https://www.inc.com/rss.xml',
        'https://www.fastcompany.com/rss/',
        'https://www.economist.com/sections/business/rss.xml',
        'https://www.ft.com/rss/business',
        'https://www.retaildive.com/rss/',
        'https://www.healthcaredive.com/rss/',
        'https://www.supplychaindive.com/rss/'
    ]
    
    articles = []
    
    for feed_url in business_rss_feeds:
        try:
            feed = feedparser.parse(feed_url)
            
            for entry in feed.entries:
                # Try to get the date from different possible fields
                date_field = entry.get('published', entry.get('updated', entry.get('pubDate')))
                if not date_field:
                    continue
                
                article_date = parse_date(date_field)
                if not article_date:
                    continue
                
                if article_date == date:
                    article = {
                        'headline': entry.title,
                        'text': entry.get('summary', entry.get('description', '')),
                        'sources': [feed_url],
                        'url': entry.get('link', ''),
                        'published_date': article_date,
                        'topic': 'business'
                    }
                    articles.append(article)
        except Exception as e:
            print(f"Error fetching from {feed_url}: {str(e)}")
    
    return articles

def analyze_article_with_gemini(article: Dict) -> Dict:
    """
    Use Gemini to analyze a single article
    """
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    try:
        # Create a prompt for Gemini
        prompt = f"""
        Analyze this business article:
        Headline: {article['headline']}
        Content: {article['text']}
        
        Please provide:
        1. A concise summary
        2. Key points
        3. Related sources or topics
        
        Format the response as JSON with these fields:
        - summary
        - key_points (as a list)
        - related_topics (as a list)
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
            article['gemini_analysis'] = response.text
            
    except Exception as e:
        print(f"Error analyzing article with Gemini: {str(e)}")
        article['gemini_analysis'] = None
    
    return article

def is_article_interesting(article: Dict) -> bool:
    """
    Determine if an article is interesting based on its headline.
    Returns True if the article is interesting, False otherwise.
    """
    headline = article['headline'].lower()
    
    # Keywords that indicate an article is NOT interesting
    uninteresting_keywords = [
        # Reviews and lists
        'best', 'review', 'tested', 'ranked', 'guide', 'how to', 'top', 'vs',
        
        # Deals and commerce
        'deal', 'sale', 'discount', 'price', 'cost', 'buy', 'shop', 'save',
        'offer', 'subscription', 'free', 'cheap', 'expensive', 'worth it',
        'black friday', 'cyber monday', 'prime day', '$', '£', '€',
        
        # Products and accessories
        'gifts', 'toys', 'accessories', 'mattress', 'sunglasses', 'gadgets',
        'gear', 'device', 'phone', 'laptop', 'tablet', 'watch', 'headphone',
        'speaker', 'camera', 'tv', 'monitor', 'keyboard', 'mouse',
        
        # Content types to exclude
        'sex', 'explicit', 'adult', 'dating', 'relationship',
        'recipe', 'food', 'cooking', 'health', 'fitness',
        'pet', 'dog', 'cat', 'animal', 'pets',
        
        # Political/Government
        'trump', 'biden', 'political', 'election', 'government',
        'congress', 'senate', 'house', 'democrat', 'republican',
        
        # Entertainment
        'movie', 'show', 'series', 'episode', 'season', 'stream',
        'netflix', 'disney', 'hulu', 'prime video', 'apple tv',
        
        # Generic marketing terms
        'everything you need', 'what you need', 'must have',
        'should buy', 'should know', 'need to know'
    ]
    
    # Check if any uninteresting keywords are in the headline
    for keyword in uninteresting_keywords:
        if keyword in headline:
            return False
            
    # Check for promotional patterns
    promotional_patterns = [
        'get', 'save', 'off', 'deal', 'today only', 'limited time',
        'exclusive', 'special offer', 'promotion'
    ]
    if any(pattern in headline for pattern in promotional_patterns):
        return False
    
    # Keywords that indicate an article IS interesting
    interesting_keywords = [
        # Business Operations
        'startup', 'venture', 'funding', 'investment', 'ipo',
        'merger', 'acquisition', 'partnership', 'collaboration',
        
        # Market Analysis
        'market', 'industry', 'sector', 'trend', 'analysis',
        'forecast', 'outlook', 'prediction', 'projection',
        
        # Business Strategy
        'strategy', 'business model', 'innovation', 'disruption',
        'transformation', 'restructuring', 'rebranding',
        
        # Financial Terms
        'revenue', 'profit', 'growth', 'valuation', 'funding',
        'investment', 'financing', 'capital', 'equity'
    ]
    
    # Check if any interesting keywords are in the headline
    for keyword in interesting_keywords:
        if keyword in headline:
            return True
    
    return False

def get_daily_business_articles() -> List[Dict]:
    """
    Main function to get daily business articles
    """
    # Get yesterday's date
    yesterday = get_yesterdays_date()
    
    # Fetch articles from RSS feeds
    articles = fetch_articles_from_rss(yesterday)
    
    # Filter and analyze interesting articles
    formatted_articles = []
    for article in articles:
        if is_article_interesting(article):
            analyzed_article = analyze_article_with_gemini(article)
            
            # Format the article according to the specified JSON structure
            formatted_article = {
                "_id": {"$oid": f"{hash(article['headline'] + article['published_date'])}"},
                "topic": "business",
                "headline": article['headline'],
                "date": article['published_date'],
                "comments": [],
                "emoji": "💼",
                "ratings": [],
                "sources": article['sources'],
                "text": article['text']
            }
            
            formatted_articles.append(formatted_article)
    
    return formatted_articles

# Example usage
if __name__ == "__main__":
    # Test the function with business topic
    articles = get_daily_business_articles()
    
    # Print results
    print(f"\nFound {len(articles)} business articles from {get_yesterdays_date()}")
    for article in articles:
        print("\nArticle:")
        print(f"Topic: {article['topic']} {article['emoji']}")
        print(f"Headline: {article['headline']}")
        print(f"Date: {article['date']}")
        print(f"Sources: {', '.join(article['sources'])}")
        print("-" * 80) 