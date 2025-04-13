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
    Fetch science articles from RSS feeds for a specific date
    Returns a list of articles in the specified format
    """
    # RSS feed URLs for science topic
    science_rss_feeds = [
        'https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml',
        'https://www.sciencedaily.com/rss/space_time/quantum_physics.xml',
        'https://www.sciencedaily.com/rss/computers_math/quantum_computing.xml',
        'https://www.sciencedaily.com/rss/matter_energy/nanotechnology.xml',
        'https://www.sciencedaily.com/rss/computers_math/robotics.xml',
        'https://www.sciencedaily.com/rss/computers_math/computer_science.xml',
        'https://www.sciencedaily.com/rss/computers_math/quantum_mechanics.xml',
        'https://www.sciencedaily.com/rss/computers_math/quantum_entanglement.xml',
        'https://www.sciencedaily.com/rss/computers_math/quantum_cryptography.xml',
        'https://www.sciencedaily.com/rss/computers_math/quantum_teleportation.xml',
        'https://www.nature.com/articles.rss',
        'https://www.sciencemag.org/rss/current.xml',
        'https://www.scientificamerican.com/page/rss/',
        'https://physicstoday.org/rss/',
        'https://arxiv.org/rss/physics',
        'https://www.maa.org/mathematics-magazine/rss',
        'https://journals.plos.org/plosbiology/rss.php',
        'https://www.cell.com/cell/rss/current',
        'https://eos.org/rss/',
        'https://pubs.acs.org/page/esest/subscription/rss/',
        'https://pubs.acs.org/page/esthag/subscription/rss/',
        'https://www.chemistryworld.com/rss/',
        'https://technews.acm.org/feed/',
        'https://spectrum.ieee.org/rss/',
        'https://www.jwatch.org/rss/',
        'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30096-2/rss/',
        'https://www.cell.com/neuron/rss/current',
        'https://www.sciencedaily.com/rss/neuroscience.xml'
    ]
    
    articles = []
    
    for feed_url in science_rss_feeds:
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
                        'topic': 'science'
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
        Analyze this science article:
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
        '$', '£', '€',
        
        # Products and accessories
        'gifts', 'toys', 'accessories', 'mattress', 'sunglasses', 'gadgets',
        'gear', 'device', 'phone', 'laptop', 'tablet', 'watch', 'headphone',
        'speaker', 'camera', 'tv', 'monitor', 'keyboard', 'mouse',
        
        # Content types to exclude
        'sex', 'explicit', 'adult', 'dating', 'relationship',
        'recipe', 'food', 'cooking', 'fitness',
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
        # Scientific Research
        'research', 'study', 'discovery', 'breakthrough', 'finding',
        'experiment', 'observation', 'analysis', 'investigation',
        'published', 'journal', 'paper', 'report', 'data',
        
        # Scientific Fields
        'physics', 'quantum', 'chemistry', 'biology', 'astronomy',
        'astrophysics', 'cosmology', 'genetics', 'neuroscience',
        'mathematics', 'geology', 'ecology', 'evolution', 'climate',
        'environmental', 'oceanography', 'paleontology', 'archaeology',
        
        # Scientific Concepts
        'theory', 'hypothesis', 'model', 'equation', 'formula',
        'principle', 'law', 'mechanism', 'process', 'system',
        'particle', 'molecule', 'atom', 'cell', 'gene', 'species',
        'galaxy', 'planet', 'star', 'black hole', 'dark matter',
        
        # Scientific Methods
        'experiment', 'method', 'technique', 'procedure', 'protocol',
        'analysis', 'measurement', 'observation', 'simulation',
        'laboratory', 'field study', 'clinical trial', 'survey',
        
        # Scientific Institutions
        'university', 'institute', 'laboratory', 'observatory',
        'research center', 'academy', 'society', 'association',
        
        # Scientific Equipment
        'telescope', 'microscope', 'accelerator', 'detector',
        'spectrometer', 'sensor', 'instrument', 'device',
        
        # Scientific Phenomena
        'gravity', 'radiation', 'energy', 'force', 'field',
        'wave', 'particle', 'matter', 'antimatter', 'plasma',
        
        # Scientific Impact
        'impact', 'implication', 'application', 'development',
        'advancement', 'progress', 'innovation', 'revolution',
        
        # Scientific Collaboration
        'collaboration', 'partnership', 'international', 'global',
        'team', 'researchers', 'scientists', 'experts'
    ]
    
    # Check if any interesting keywords are in the headline
    for keyword in interesting_keywords:
        if keyword in headline:
            return True
    
    # Additional check for science-related terms that might not be in the interesting keywords
    science_terms = [
        'science', 'scientific', 'research', 'study', 'discovery',
        'breakthrough', 'finding', 'experiment', 'observation',
        'analysis', 'investigation', 'theory', 'hypothesis', 'model',
        'equation', 'formula', 'principle', 'law', 'mechanism',
        'process', 'system', 'data', 'evidence', 'result',
        'conclusion', 'finding', 'observation', 'measurement',
        'laboratory', 'field study', 'clinical trial', 'survey'
    ]
    
    if any(term in headline for term in science_terms):
        # Make sure it's not a review or promotional content
        if not any(word in headline for word in ['review', 'best', 'top', 'guide', 'how to']):
            return True
    
    return False

def get_daily_science_articles() -> List[Dict]:
    """
    Main function to get daily science articles
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
                "topic": "science",
                "headline": article['headline'],
                "date": article['published_date'],
                "comments": [],
                "emoji": "🔬",
                "ratings": [],
                "sources": article['sources'],
                "text": article['text']
            }
            
            formatted_articles.append(formatted_article)
    
    return formatted_articles

# Example usage
if __name__ == "__main__":
    # Test the function with science topic
    articles = get_daily_science_articles()
    
    # Print results
    print(f"\nFound {len(articles)} science articles from {get_yesterdays_date()}")
    for article in articles:
        print("\nArticle:")
        print(f"Topic: {article['topic']} {article['emoji']}")
        print(f"Headline: {article['headline']}")
        print(f"Date: {article['date']}")
        print(f"Sources: {', '.join(article['sources'])}")
        print("-" * 80) 