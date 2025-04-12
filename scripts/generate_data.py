import os
import json
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
# MONGODB_URI = os.getenv('MONGODB_URI')
# client = MongoClient(MONGODB_URI)
# db = client['test']
# articles_collection = db.articles

# print('Connected to MongoDB database:', db.name)
# print('Collections in database:', db.list_collection_names())

# Base data structure for topics
TOPICS_DATA = {
    'sports': {
        'emoji': '⚽',
        'articles': []
    },
    'tech': {
        'emoji': '💻',
        'articles': []
    },
    'business': {
        'emoji': '💼',
        'articles': []
    },
    'entertainment': {
        'emoji': '🎬',
        'articles': []
    },
    'science': {
        'emoji': '🔬',
        'articles': []
    },
    'politics': {
        'emoji': '🏛️',
        'articles': []
    }
}

def ensure_data_directories():
    """Create the necessary directory structure for data storage"""
    # Get the root directory (one level up from scripts)
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(root_dir, 'data')
    
    # Remove old data files if they exist
    if os.path.exists(data_dir):
        import shutil
        shutil.rmtree(data_dir)
    
    # Create base data directory
    os.makedirs(data_dir, exist_ok=True)
    
    # Create topic directories
    for topic in TOPICS_DATA.keys():
        topic_dir = os.path.join(data_dir, topic)
        os.makedirs(topic_dir, exist_ok=True)
        
        # Create daily subdirectories for April 6-13, 2024
        start_date = datetime(2024, 4, 6)
        end_date = datetime(2024, 4, 13)
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            os.makedirs(os.path.join(topic_dir, date_str), exist_ok=True)
            current_date += timedelta(days=1)

def generate_sample_articles(topic):
    """Generate sample articles for a given topic"""
    if topic == 'sports':
        return [
            {
                'headline': 'Major League Baseball Opening Day Breaks Records',
                'text': 'The opening day of the MLB season saw record-breaking attendance across stadiums nationwide, with fans eager to return to live sports after the offseason.',
                'sources': ['ESPN', 'Sports Illustrated']
            },
            {
                'headline': 'NBA Playoff Race Heats Up',
                'text': 'With just a few games remaining in the regular season, several teams are battling for the final playoff spots in what has been one of the most competitive seasons in recent memory.',
                'sources': ['NBA.com', 'The Athletic']
            },
            {
                'headline': 'New Soccer Transfer Record Set',
                'text': 'A rising soccer star has broken the transfer record, moving to a top European club for an unprecedented fee that sets a new standard in the sport.',
                'sources': ['Sky Sports', 'BBC Sport']
            }
        ]
    elif topic == 'tech':
        return [
            {
                'headline': 'Revolutionary AI Model Breaks Records',
                'text': 'A new artificial intelligence model has achieved unprecedented performance in natural language processing tasks, potentially revolutionizing how we interact with technology.',
                'sources': ['TechCrunch', 'Wired']
            },
            {
                'headline': 'Quantum Computing Breakthrough',
                'text': 'Scientists announce a major breakthrough in quantum computing stability, bringing practical quantum computers one step closer to reality.',
                'sources': ['MIT Technology Review', 'Nature']
            },
            {
                'headline': 'New Battery Technology Promises Longer Life',
                'text': 'Researchers develop a new type of battery technology that could significantly increase the lifespan and charging speed of electronic devices.',
                'sources': ['IEEE Spectrum', 'Scientific American']
            }
        ]
    elif topic == 'business':
        return [
            {
                'headline': 'Global Markets Reach New Highs',
                'text': 'Major stock indices around the world have reached record levels as investor confidence grows amid positive economic indicators.',
                'sources': ['Financial Times', 'Wall Street Journal']
            },
            {
                'headline': 'Tech Giant Announces Major Acquisition',
                'text': 'A leading technology company has announced plans to acquire a major competitor in a deal worth billions of dollars.',
                'sources': ['Bloomberg', 'Reuters']
            }
        ]
    elif topic == 'entertainment':
        return [
            {
                'headline': 'Blockbuster Movie Breaks Box Office Records',
                'text': 'The latest superhero movie has shattered box office records in its opening weekend, becoming the highest-grossing film of the year.',
                'sources': ['Variety', 'Hollywood Reporter']
            },
            {
                'headline': 'Music Streaming Service Hits New Milestone',
                'text': 'A popular music streaming platform has reached 100 million paid subscribers worldwide.',
                'sources': ['Billboard', 'Rolling Stone']
            }
        ]
    elif topic == 'science':
        return [
            {
                'headline': 'Astronomers Discover New Exoplanet',
                'text': 'Scientists have identified a potentially habitable exoplanet in a nearby star system.',
                'sources': ['Science', 'Nature Astronomy']
            },
            {
                'headline': 'Climate Change Research Shows Accelerating Effects',
                'text': 'New data reveals that climate change impacts are occurring faster than previously predicted.',
                'sources': ['Nature Climate Change', 'Science Advances']
            }
        ]
    elif topic == 'politics':
        return [
            {
                'headline': 'Major Policy Reform Announced',
                'text': 'The government has unveiled a comprehensive plan to address key social and economic issues.',
                'sources': ['The New York Times', 'Washington Post']
            },
            {
                'headline': 'International Summit Addresses Global Challenges',
                'text': 'World leaders gather to discuss solutions to pressing global issues.',
                'sources': ['BBC News', 'CNN']
            }
        ]
    return []

def save_topic_data(topic, date_str, articles):
    """Save topic data to a JSON file"""
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(root_dir, 'data', topic, date_str, 'articles.json')
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump({
            'topic': topic,
            'emoji': TOPICS_DATA[topic]['emoji'],
            'date': date_str,
            'articles': articles
        }, f, indent=2, ensure_ascii=False)

def load_topic_data(topic, date_str):
    """Load topic data from a JSON file"""
    try:
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(root_dir, 'data', topic, date_str, 'articles.json')
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: No data found for {topic} on {date_str}")
        return None

def generate_daily_data(date_str):
    """Generate and store daily articles for all topics"""
    for topic in TOPICS_DATA.keys():
        # Generate sample articles for this topic
        articles = generate_sample_articles(topic)
        
        # Save to JSON file
        save_topic_data(topic, date_str, articles)
        
        # Store in MongoDB
        for article in articles:
            article_doc = {
                'date': date_str,
                'topic': topic,
                'emoji': TOPICS_DATA[topic]['emoji'],
                'headline': article['headline'],
                'text': article['text'],
                'sources': article['sources'],
                'comments': [],
                'ratings': []
            }
            
            articles_collection.update_one(
                {
                    'date': date_str,
                    'topic': topic,
                    'headline': article['headline']
                },
                {'$set': article_doc},
                upsert=True
        )

def main():
    # Create directory structure
    ensure_data_directories()
    
    # Generate data for April 6-13, 2024
    start_date = datetime(2024, 4, 6)
    end_date = datetime(2024, 4, 13)
    current_date = start_date
    
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        print(f'Generating data for {date_str}...')
        generate_daily_data(date_str)
        current_date += timedelta(days=1)
    
    print('Data generation complete!')

if __name__ == '__main__':
    main() 