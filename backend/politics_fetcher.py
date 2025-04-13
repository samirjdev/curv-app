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
import logging
import re
import html
import ssl

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.getenv('GEMINI_API_KEY')
if api_key:
    genai.configure(api_key=api_key)
    USE_GEMINI = True
    logging.info("Gemini API configured successfully")
else:
    USE_GEMINI = False
    logging.warning("GEMINI_API_KEY not found. Article analysis will be skipped.")

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
        # Add headers to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        # Create SSL context that doesn't verify certificates
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        async with session.get(feed_url, timeout=FEED_TIMEOUT, headers=headers, ssl=ssl_context) as response:
            if response.status != 200:
                logging.warning(f"Feed {feed_url} returned status {response.status}")
                return []
                
            content = await response.text()
            feed = feedparser.parse(content)
            articles = []
            
            # Configure timezone info for common timezones
            tzinfos = {
                "EDT": -14400,  # Eastern Daylight Time
                "EST": -18000,  # Eastern Standard Time
                "BST": 3600,    # British Summer Time
                "GMT": 0,       # Greenwich Mean Time
                "UTC": 0,       # Coordinated Universal Time
                "PDT": -25200,  # Pacific Daylight Time
                "PST": -28800   # Pacific Standard Time
            }
            
            for entry in feed.entries:
                date_field = entry.get('published', entry.get('updated', entry.get('pubDate')))
                if not date_field:
                    continue
                
                try:
                    article_date = parse(date_field, tzinfos=tzinfos).strftime('%Y-%m-%d')
                except Exception as e:
                    logging.debug(f"Error parsing date {date_field}: {str(e)}")
                    continue
                
                if article_date == date:
                    # Clean and decode HTML entities
                    title = html.unescape(entry.get('title', '')).strip()
                    summary = html.unescape(entry.get('summary', '')).strip()
                    link = entry.get('link', '').strip()
                    
                    articles.append({
                        'headline': title,
                        'published_date': article_date,
                        'text': summary,
                        'sources': [feed_url],
                        'url': link
                    })
            
            logging.info(f"Found {len(articles)} articles from {feed_url}")
            return articles
            
    except Exception as e:
        logging.error(f"Error fetching from {feed_url}: {str(e)}")
        return []

async def fetch_all_feeds(date: str) -> List[Dict]:
    """Fetch all RSS feeds concurrently"""
    # Most reliable and fastest politics RSS feeds
    politics_rss_feeds = [
        # Major News Sources
        'https://www.bbc.com/news/politics/rss.xml',
        'https://www.theguardian.com/politics/rss',
        'https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/section/politics/rss.xml',
        'https://www.aljazeera.com/xml/rss/all.xml',
        
        # US Politics
        'https://www.npr.org/rss/rss.php?id=1014',  # NPR Politics
        'https://www.politico.com/rss/politicopicks.xml',
        'https://www.axios.com/feed/politics',
        
        # International Politics
        'https://www.dw.com/rss/politics/s-1017',
        'https://www.france24.com/en/politics/rss',
        'https://www.euronews.com/rss?format=mrss&level=vertical&name=politics'
    ]
    
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_feed(session, feed_url, date) for feed_url in politics_rss_feeds]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_articles = []
        seen_headlines = set()  # Track unique headlines
        
        for articles in results:
            if isinstance(articles, list):  # Only add successful results
                for article in articles:
                    headline = article['headline']
                    if headline and headline not in seen_headlines:
                        seen_headlines.add(headline)
                        all_articles.append(article)
        
        return all_articles

def is_article_interesting(article: Dict) -> bool:
    """Filter out uninteresting articles based on headline and content"""
    headline = article['headline'].lower()
    text = article.get('text', '').lower()
    
    # Immediate disqualifiers
    if not headline or len(headline) < 10:
        return False
    
    # Keywords that indicate an article is NOT interesting
    uninteresting_patterns = [
        # Opinion and analysis
        r'opinion\b', r'analysis\b', r'commentary\b', r'editorial\b',
        r'viewpoint\b', r'perspective\b', r'column\b',
        
        # Polls and surveys
        r'poll\b', r'survey\b', r'rating\b', r'approval\b',
        r'popularity\b', r'ranking\b',
        
        # Entertainment
        r'movie\b', r'show\b', r'series\b', r'episode\b',
        r'stream\b', r'netflix\b', r'disney\+',
        
        # Promotional
        r'sponsored\b', r'advertisement\b', r'promoted\b'
    ]
    
    # Check against patterns
    for pattern in uninteresting_patterns:
        if re.search(pattern, headline) or re.search(pattern, text):
            return False
    
    # Keywords that indicate an article IS interesting
    interesting_patterns = [
        # Policy and legislation
        r'policy\b', r'bill\b', r'law\b', r'legislation\b',
        r'act\b', r'regulation\b', r'rule\b',
        
        # Elections and governance
        r'election\b', r'vote\b', r'campaign\b', r'candidate\b',
        r'government\b', r'administration\b', r'congress\b',
        
        # International relations
        r'diplomacy\b', r'treaty\b', r'agreement\b', r'alliance\b',
        r'negotiation\b', r'summit\b', r'meeting\b',
        
        # Political events
        r'scandal\b', r'investigation\b', r'hearing\b', r'trial\b',
        r'protest\b', r'demonstration\b', r'rally\b'
    ]
    
    # Check if any interesting patterns are present
    return any(re.search(pattern, headline) or re.search(pattern, text)
              for pattern in interesting_patterns)

@cache_result(ttl_seconds=CACHE_TTL)
def analyze_article_with_gemini(articles: List[Dict]) -> List[Dict]:
    """Use Gemini to analyze and rank articles"""
    if not USE_GEMINI:
        # Sort by headline length as a basic heuristic
        articles.sort(key=lambda x: len(x['headline']), reverse=True)
        return articles[:5]
    
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Extract headlines for analysis
        headlines = [article['headline'] for article in articles]
        
        prompt = f"""
        Analyze these political headlines and select the 5 most important/impactful stories based on:
        1. Policy impact and significance
        2. National/international importance
        3. Breaking news value
        4. Long-term implications

        Headlines:
        {json.dumps(headlines, indent=2)}

        Return ONLY a JSON array with the indices of the top 5 headlines (0-based indexing).
        Format: [0, 1, 2, 3, 4]
        """
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up response text
        if "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        response_text = response_text.strip()
        if response_text.startswith('json'):
            response_text = response_text[4:].strip()
        
        try:
            top_indices = json.loads(response_text)
            if not isinstance(top_indices, list):
                raise ValueError("Response is not a list")
            
            # Validate indices
            valid_indices = [i for i in top_indices if isinstance(i, int) and 0 <= i < len(articles)]
            valid_indices = valid_indices[:5]  # Take only first 5 valid indices
            
            if not valid_indices:
                print("No valid indices returned by Gemini")
                # Sort by headline length as a fallback
                articles.sort(key=lambda x: len(x['headline']), reverse=True)
                return articles[:5]
            
            return [articles[i] for i in valid_indices]
            
        except Exception as e:
            print(f"Error parsing Gemini response: {str(e)}")
            # Sort by headline length as a fallback
            articles.sort(key=lambda x: len(x['headline']), reverse=True)
            return articles[:5]
            
    except Exception as e:
        print(f"Error using Gemini API: {str(e)}")
        # Sort by headline length as a fallback
        articles.sort(key=lambda x: len(x['headline']), reverse=True)
        return articles[:5]

async def get_daily_politics_articles() -> List[Dict]:
    """Get politics articles from yesterday"""
    start_time = time.time()
    
    # Get yesterday's date
    date = get_yesterdays_date()
    logging.info(f"Fetching articles for {date}")
    
    # Fetch articles from RSS feeds concurrently
    articles = await fetch_all_feeds(date)
    logging.info(f"Found {len(articles)} total articles")
    
    # Filter out duplicates and uninteresting articles
    seen_headlines = set()
    interesting_articles = []
    for article in articles:
        headline = article['headline']
        if headline not in seen_headlines and is_article_interesting(article):
            seen_headlines.add(headline)
            interesting_articles.append(article)
    
    logging.info(f"Filtered to {len(interesting_articles)} interesting articles")
    
    # Analyze all articles with Gemini at once
    analyzed_articles = analyze_article_with_gemini(interesting_articles)
    logging.info(f"Selected top {len(analyzed_articles)} articles")
    
    # Format the articles
    formatted_articles = []
    for article in analyzed_articles:
        formatted_article = {
            "_id": {"$oid": hashlib.md5((article['headline'] + article['published_date']).encode()).hexdigest()},
            "topic": "politics",
            "headline": article['headline'],
            "date": article['published_date'],
            "comments": [],
            "emoji": "🏛️",
            "ratings": [],
            "sources": article['sources'],
            "text": article['text']
        }
        formatted_articles.append(formatted_article)
    
    # Print execution time
    execution_time = time.time() - start_time
    logging.info(f"Total execution time: {execution_time:.2f} seconds")
    
    return formatted_articles

if __name__ == "__main__":
    # Test the function with politics topic
    articles = asyncio.run(get_daily_politics_articles())
    
    # Print results
    print(f"\nFound {len(articles)} politics articles from {get_yesterdays_date()}\n")
    for article in articles:
        print("Article:")
        print(f"Topic: {article['topic']} {article['emoji']}")
        # Ensure headline fits within 80 characters
        headline = article['headline']
        if len(headline) > 77:  # 80 - 3 for "..."
            headline = headline[:74] + "..."
        print(f"Headline: {headline}")
        print(f"Date: {article['date']}")
        print(f"Sources: {', '.join(article['sources'])}")
        print("-" * 80 + "\n") 