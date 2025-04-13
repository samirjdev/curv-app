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
    Fetch tech articles from RSS feeds for a specific date
    Returns a list of articles in the specified format
    """
    # RSS feed URLs for tech topic
    tech_rss_feeds = [
        # Tech News Sources
        'https://www.theverge.com/rss/index.xml',
        'https://www.wired.com/feed/rss',
        'https://www.engadget.com/rss.xml',
        'https://www.techcrunch.com/feed/',
        'https://www.zdnet.com/news/rss.xml',
        'https://www.cnet.com/rss/all/',
        'https://www.techradar.com/rss',
        'https://www.digitaltrends.com/feed/',
        'https://www.techmeme.com/feed',
        'https://www.technologyreview.com/feed/',
        
        # Tech Companies
        'https://www.apple.com/newsroom/rss-feed.rss',
        'https://www.microsoft.com/en-us/rss/news/',
        'https://www.google.com/feed/',
        'https://www.amazon.com/rss/',
        'https://www.facebook.com/feed/',
        'https://www.twitter.com/feed/',
        'https://www.instagram.com/feed/',
        'https://www.linkedin.com/feed/',
        'https://www.youtube.com/feed/',
        'https://www.netflix.com/feed/',
        
        # Tech Blogs and Publications
        'https://www.ars Technica.com/feed/',
        'https://www.geekwire.com/feed/',
        'https://www.venturebeat.com/feed/',
        'https://www.protocol.com/feed/',
        'https://www.theinformation.com/feed/',
        'https://www.recode.net/rss/index.xml',
        'https://www.techdirt.com/feed/',
        'https://www.slashdot.org/rss/',
        'https://www.techspot.com/backend.xml',
        'https://www.tomshardware.com/feeds/all',
        
        # Tech Research and Development
        'https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml',
        'https://www.sciencedaily.com/rss/computers_math/computer_science.xml',
        'https://www.sciencedaily.com/rss/computers_math/robotics.xml',
        'https://www.sciencedaily.com/rss/computers_math/quantum_computing.xml',
        'https://www.sciencedaily.com/rss/computers_math/cybersecurity.xml',
        
        # Tech Industry News
        'https://www.bloomberg.com/technology/rss',
        'https://www.reuters.com/technology/rss',
        'https://www.ft.com/technology/rss',
        'https://www.wsj.com/tech/rss',
        'https://www.cnbc.com/id/54900347/device/rss/rss.html'
    ]
    
    articles = []
    
    for feed_url in tech_rss_feeds:
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
                        'topic': 'tech'
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
        Analyze this tech article:
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
        # Technology
        'technology', 'tech', 'digital', 'electronic', 'computer',
        'software', 'hardware', 'device', 'gadget', 'app',
        
        # Tech Companies
        'apple', 'google', 'microsoft', 'amazon', 'facebook',
        'twitter', 'instagram', 'linkedin', 'youtube', 'netflix',
        
        # Tech Products
        'iphone', 'ipad', 'macbook', 'android', 'windows',
        'chrome', 'firefox', 'safari', 'edge', 'opera',
        
        # Tech Trends
        'trend', 'innovation', 'development', 'advancement', 'improvement',
        'breakthrough', 'discovery', 'invention', 'creation', 'design',
        
        # Tech Fields
        'ai', 'artificial intelligence', 'ml', 'machine learning',
        'vr', 'virtual reality', 'ar', 'augmented reality',
        'iot', 'internet of things', 'blockchain', 'cryptocurrency',
        'cybersecurity', 'privacy', 'data', 'analytics', 'cloud',
        
        # Tech Events
        'conference', 'convention', 'expo', 'summit', 'forum',
        'symposium', 'workshop', 'meeting', 'presentation', 'demo',
        
        # Tech Research
        'research', 'study', 'experiment', 'investigation', 'analysis',
        'discovery', 'breakthrough', 'finding', 'development', 'progress',
        
        # Tech Industry
        'industry', 'market', 'business', 'startup', 'venture',
        'investment', 'funding', 'acquisition', 'merger', 'partnership',
        
        # Tech Policy
        'policy', 'regulation', 'law', 'legislation', 'compliance',
        'standard', 'protocol', 'guideline', 'framework', 'rule',
        
        # Tech Education
        'education', 'training', 'learning', 'course', 'program',
        'certification', 'degree', 'school', 'university', 'institute'
    ]
    
    # Check if any interesting keywords are in the headline
    for keyword in interesting_keywords:
        if keyword in headline:
            return True
    
    # Additional check for tech-related terms that might not be in the interesting keywords
    tech_terms = [
        'tech', 'technology', 'digital', 'electronic', 'computer',
        'software', 'hardware', 'device', 'gadget', 'app',
        'internet', 'web', 'online', 'network', 'system',
        'data', 'information', 'communication', 'telecommunication', 'broadcast',
        'mobile', 'wireless', 'satellite', 'fiber', 'cable',
        'server', 'cloud', 'database', 'storage', 'memory'
    ]
    
    if any(term in headline for term in tech_terms):
        # Make sure it's not a review or promotional content
        if not any(word in headline for word in ['review', 'best', 'top', 'guide', 'how to']):
            return True
    
    return False

def get_daily_tech_articles() -> List[Dict]:
    """
    Main function to get daily tech articles
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
                "topic": "tech",
                "headline": article['headline'],
                "date": article['published_date'],
                "comments": [],
                "emoji": "💻",
                "ratings": [],
                "sources": article['sources'],
                "text": article['text']
            }
            
            formatted_articles.append(formatted_article)
    
    return formatted_articles

# Example usage
if __name__ == "__main__":
    # Test the function with tech topic
    articles = get_daily_tech_articles()
    
    # Print results
    print(f"\nFound {len(articles)} tech articles from {get_yesterdays_date()}")
    for article in articles:
        print("\nArticle:")
        print(f"Topic: {article['topic']} {article['emoji']}")
        print(f"Headline: {article['headline']}")
        print(f"Date: {article['date']}")
        print(f"Sources: {', '.join(article['sources'])}")
        print("-" * 80) 