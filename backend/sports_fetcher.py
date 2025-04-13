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
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor, as_completed
import socket

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.getenv('GEMINI_API_KEY')
if api_key:
    genai.configure(api_key=api_key)
    USE_GEMINI = True
else:
    USE_GEMINI = False
    print("Warning: GEMINI_API_KEY not found. Article analysis will be skipped.")

# Cache for API responses with TTL
api_cache = {}
CACHE_TTL = 3600  # 1 hour

# Timeout settings
FEED_TIMEOUT = 10  # seconds
socket.setdefaulttimeout(FEED_TIMEOUT)

def cache_result(ttl_seconds=CACHE_TTL):
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

async def fetch_feed(session, feed_url: str, date: str) -> List[Dict]:
    """Fetch a single RSS feed asynchronously"""
    try:
        async with session.get(feed_url, timeout=FEED_TIMEOUT) as response:
            content = await response.text()
            feed = feedparser.parse(content)
            articles = []
            
            for entry in feed.entries:
                date_field = entry.get('published', entry.get('updated', entry.get('pubDate')))
                if not date_field:
                    continue
                
                try:
                    article_date = parse(date_field).strftime('%Y-%m-%d')
                except:
                    continue
                
                if article_date == date:
                    articles.append({
                        'headline': entry.get('title', ''),
                        'published_date': article_date,
                        'text': entry.get('summary', ''),
                        'sources': [feed_url],
                        'url': entry.get('link', '')
                    })
            
            return articles
    except Exception as e:
        print(f"Error fetching from {feed_url}: {str(e)}")
        return []

async def fetch_all_feeds(date: str) -> List[Dict]:
    """Fetch all RSS feeds concurrently"""
    # Most reliable and fastest sports RSS feeds
    sports_rss_feeds = [
        # Major Sports News Sources (fastest and most reliable)
        'https://www.espn.com/espn/rss/news',
        'https://www.cbssports.com/rss/headlines',
        'https://www.skysports.com/rss',
        'https://www.bbc.co.uk/sport/rss.xml',
        
        # League-Specific Feeds (essential ones)
        'https://www.nfl.com/rss/rsslanding?requestType=homepage',
        'https://www.nba.com/rss/news',
        'https://www.mlb.com/rss/news',
        'https://www.nhl.com/rss/news',
        
        # Additional reliable sources
        'https://www.formula1.com/en/rss',
        'https://www.tennis.com/rss',
        'https://www.boxingnews24.com/feed/',
        'https://www.mmafighting.com/rss'
    ]
    
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_feed(session, feed_url, date) for feed_url in sports_rss_feeds]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_articles = []
        for articles in results:
            if isinstance(articles, list):  # Only add successful results
                all_articles.extend(articles)
        
        return all_articles

@cache_result(ttl_seconds=CACHE_TTL)
def analyze_article_with_gemini(article: Dict) -> Dict:
    """Use Gemini to analyze a single article"""
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
        Analyze this sports article and provide a brief summary:
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
                'summary': "Failed to parse analysis",
                'key_points': [],
                'related_topics': []
            }
            
    except Exception as e:
        print(f"Error analyzing article with Gemini: {str(e)}")
        article['gemini_analysis'] = {
            'summary': "Analysis failed",
            'key_points': [],
            'related_topics': []
        }
    
    return article

def is_article_interesting(article: Dict) -> bool:
    """Filter out uninteresting articles based on headline"""
    headline = article['headline'].lower()
    
    # Keywords that indicate an article is NOT interesting
    uninteresting_keywords = [
        'best', 'review', 'ranked', 'guide', 'how to', 'top', 'vs',
        'deal', 'sale', 'discount', 'price', 'buy', 'shop', 'save',
        'offer', 'subscription', 'free', '$', '£', '€',
        'movie', 'show', 'series', 'episode', 'season', 'stream'
    ]
    
    return not any(keyword in headline for keyword in uninteresting_keywords)

async def get_daily_sports_articles() -> List[Dict]:
    """Get sports articles from yesterday"""
    start_time = time.time()
    
    # Get yesterday's date
    date = get_yesterdays_date()
    
    # Fetch articles from RSS feeds concurrently
    articles = await fetch_all_feeds(date)
    
    # Filter interesting articles
    interesting_articles = [article for article in articles if is_article_interesting(article)]
    
    # Analyze articles with Gemini if configured
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(analyze_article_with_gemini, article) 
                  for article in interesting_articles]
        analyzed_articles = [future.result() for future in as_completed(futures)]
    
    # Print execution time
    execution_time = time.time() - start_time
    print(f"\nFound {len(analyzed_articles)} sports articles from {date}")
    print(f"Execution time: {execution_time:.2f} seconds\n")
    
    # Print articles
    for article in analyzed_articles:
        print("Article:")
        print(f"Topic: sports 🏆")
        print(f"Headline: {article['headline']}")
        print(f"Date: {article['published_date']}")
        print(f"Sources: {', '.join(article['sources'])}")
        print("-" * 80 + "\n")
    
    return analyzed_articles

if __name__ == "__main__":
    asyncio.run(get_daily_sports_articles()) 