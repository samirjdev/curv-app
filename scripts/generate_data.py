import json
import random
from datetime import datetime, timedelta
import os

# Topics with their emojis
TOPICS = {
    'sports': '⚽',
    'tech': '💻',
    'politics': '🏛️',
    'movies': '🎬',
    'gaming': '🎮',
    'random': '🎲'
}

# Sample headlines for each topic
HEADLINES = {
    'sports': [
        "Major Upset in Championship Finals",
        "Record-Breaking Performance in Tournament",
        "New Star Player Signs Historic Deal",
        "Unexpected Victory Shocks Fans",
        "Team Makes Dramatic Comeback"
    ],
    'tech': [
        "Revolutionary AI Breakthrough Announced",
        "New Quantum Computing Milestone",
        "Tech Giant Reveals Next-Gen Device",
        "Startup Disrupts Industry with Innovation",
        "Major Security Update Released"
    ],
    'politics': [
        "Historic Bill Passes in Parliament",
        "International Summit Yields Results",
        "New Policy Reform Announced",
        "Landmark Decision Changes Landscape",
        "Global Agreement Reached"
    ],
    'movies': [
        "Blockbuster Breaks Box Office Records",
        "Acclaimed Director Announces New Project",
        "Surprise Hit Takes Critics by Storm",
        "Award Season Favorites Revealed",
        "Classic Film Gets Modern Remake"
    ],
    'gaming': [
        "Anticipated Game Finally Launches",
        "Esports Tournament Sets Viewership Record",
        "Revolutionary Gaming Tech Unveiled",
        "Classic Series Gets Modern Reboot",
        "Indie Game Becomes Surprise Hit"
    ],
    'random': [
        "You Won't Believe What Happened Today",
        "Strange Discovery Puzzles Experts",
        "Unexpected Trend Takes Internet by Storm",
        "Mystery Finally Solved After Years",
        "Bizarre Coincidence Captures Attention"
    ]
}

def generate_lorem_ipsum(length=3):
    lorem = """
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    """.strip().split('.')
    return '. '.join(random.sample(lorem, length)) + '.'

def generate_sources():
    sources = [
        "Reuters",
        "Associated Press",
        "Bloomberg",
        "The Guardian",
        "BBC",
        "CNN",
        "MSNBC",
        "Fox News",
        "The New York Times",
        "The Washington Post"
    ]
    return random.sample(sources, random.randint(1, 3))

def generate_data():
    # Create data directory if it doesn't exist
    os.makedirs('public/data', exist_ok=True)
    
    # Generate data for the past 10 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=9)
    current_date = start_date

    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        daily_data = {}

        for topic, emoji in TOPICS.items():
            headlines = []
            for _ in range(random.randint(3, 5)):  # 3-5 headlines per topic per day
                headline_data = {
                    'headline': random.choice(HEADLINES[topic]),
                    'text': generate_lorem_ipsum(),
                    'sources': generate_sources()
                }
                headlines.append(headline_data)

            daily_data[topic] = {
                'emoji': emoji,
                'headlines': headlines
            }

        # Save daily data to JSON file
        filename = f'public/data/{date_str}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(daily_data, f, ensure_ascii=False, indent=2)

        current_date += timedelta(days=1)

if __name__ == '__main__':
    generate_data() 