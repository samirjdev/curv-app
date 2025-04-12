import json
import os
from datetime import datetime, timedelta
import random

# Define topics with their emojis
TOPICS = {
    "sports": "⚽",
    "technology": "💻",
    "business": "💼",
    "entertainment": "🎬",
    "science": "🔬",
    "health": "🏥",
    "politics": "🏛️",
    "gaming": "🎮"
}

# Sample headlines for each topic
HEADLINES = {
    "sports": [
        "Major League Baseball Opening Day Breaks Attendance Records",
        "NBA Playoff Race Heats Up in Final Regular Season Games",
        "Olympic Committee Announces New Host City for 2032 Games",
        "Soccer Star Sets New Goal-Scoring Record in European League",
        "Tennis Pro Makes Historic Comeback After Injury"
    ],
    "technology": [
        "New AI Model Breaks Performance Records in Language Tasks",
        "Tech Giant Unveils Revolutionary Quantum Computing Breakthrough",
        "Major Software Update Brings Enhanced Security Features",
        "Startup Develops Breakthrough in Battery Technology",
        "Virtual Reality Platform Announces Major Expansion"
    ],
    "business": [
        "Global Markets Reach New All-Time High",
        "Major Merger Creates New Industry Leader",
        "Startup Secures Record-Breaking Funding Round",
        "New Economic Report Shows Strong Growth Indicators",
        "Major Retailer Announces Nationwide Expansion"
    ],
    "entertainment": [
        "Blockbuster Movie Breaks Opening Weekend Records",
        "Streaming Service Announces Major Content Partnership",
        "Music Festival Lineup Revealed, Features Major Headliners",
        "Award Show Celebrates Record-Breaking Viewership",
        "New TV Series Breaks Streaming Records"
    ],
    "science": [
        "Researchers Discover New Species in Deep Ocean Exploration",
        "Breakthrough in Renewable Energy Storage Announced",
        "Space Mission Returns with Unprecedented Data",
        "New Study Reveals Insights into Human Brain Function",
        "Climate Research Shows Promising New Solutions"
    ],
    "health": [
        "New Medical Treatment Shows Promise in Clinical Trials",
        "Public Health Initiative Reduces Disease Rates",
        "Breakthrough in Vaccine Development Announced",
        "Mental Health Awareness Campaign Reaches Millions",
        "New Study Reveals Benefits of Exercise on Longevity"
    ],
    "politics": [
        "International Summit Addresses Global Climate Crisis",
        "New Legislation Aims to Reform Healthcare System",
        "Diplomatic Breakthrough in International Relations",
        "Major Policy Initiative Announced to Address Housing Crisis",
        "Government Announces New Infrastructure Investment Plan"
    ],
    "gaming": [
        "Major Game Studio Announces Next-Gen Console Exclusive",
        "Esports Tournament Breaks Viewership Records",
        "Virtual Reality Game Wins Multiple Industry Awards",
        "Indie Game Developer Secures Major Publishing Deal",
        "Gaming Platform Announces Cross-Platform Play Support"
    ]
}

# Sample content for headlines
CONTENT = {
    "sports": [
        "The opening day of the MLB season saw record-breaking attendance across stadiums nationwide, with fans eager to return to live sports after the offseason.",
        "With just a few games remaining in the regular season, several teams are battling for the final playoff spots in what has been one of the most competitive seasons in recent memory.",
        "The International Olympic Committee has selected a new host city for the 2032 Summer Games, marking a significant milestone in Olympic history.",
        "A rising soccer star has broken the single-season goal-scoring record in one of Europe's top leagues, cementing their place in the sport's history.",
        "After a career-threatening injury, a tennis professional has made an incredible comeback, winning their first major tournament since returning to competition."
    ],
    "technology": [
        "A new artificial intelligence model has achieved unprecedented performance in natural language processing tasks, potentially revolutionizing how we interact with technology.",
        "A leading tech company has announced a major breakthrough in quantum computing, bringing us closer to practical applications of this revolutionary technology.",
        "The latest software update from a major tech company includes significant security enhancements and new features designed to protect user data.",
        "A startup company has developed a revolutionary new battery technology that could dramatically increase the range of electric vehicles.",
        "A major virtual reality platform has announced plans to expand its services, bringing immersive experiences to more users worldwide."
    ],
    "business": [
        "Global financial markets have reached new record highs, driven by strong economic indicators and positive corporate earnings reports.",
        "Two major companies in the industry have announced a merger that will create the largest player in the sector, potentially reshaping the market landscape.",
        "A promising startup has secured the largest funding round in its industry's history, signaling strong investor confidence in its business model.",
        "The latest economic report shows strong growth across multiple sectors, with unemployment reaching its lowest level in decades.",
        "A major retail chain has announced plans to open hundreds of new locations nationwide, creating thousands of new jobs in the process."
    ],
    "entertainment": [
        "The latest blockbuster movie has shattered box office records during its opening weekend, becoming the highest-grossing film of the year.",
        "A leading streaming service has announced a major content partnership that will bring exclusive programming to its platform.",
        "The lineup for this year's major music festival has been revealed, featuring some of the biggest names in the industry as headliners.",
        "The annual award show celebrated its most-watched broadcast in history, with millions tuning in to see their favorite stars.",
        "A new television series has broken streaming records, becoming the most-watched show in the platform's history."
    ],
    "science": [
        "Scientists have discovered a new species during a deep-sea exploration mission, providing new insights into marine biodiversity.",
        "Researchers have announced a major breakthrough in renewable energy storage technology that could revolutionize the clean energy sector.",
        "A recent space mission has returned with unprecedented data that could change our understanding of the universe.",
        "A new study has revealed groundbreaking insights into how the human brain processes information and forms memories.",
        "Latest climate research has identified promising new solutions that could help mitigate the effects of global warming."
    ],
    "health": [
        "Clinical trials for a new medical treatment have shown promising results, potentially offering hope for patients with previously untreatable conditions.",
        "A public health initiative has successfully reduced disease rates in targeted communities, demonstrating the effectiveness of preventive healthcare measures.",
        "Scientists have announced a breakthrough in vaccine development that could protect against multiple strains of a dangerous virus.",
        "A mental health awareness campaign has reached millions of people, helping to reduce stigma and increase access to care.",
        "A comprehensive new study has revealed significant benefits of regular exercise on longevity and overall health."
    ],
    "politics": [
        "World leaders gathered at an international summit to address the global climate crisis, announcing new commitments to reduce carbon emissions.",
        "New legislation has been introduced that aims to reform the healthcare system, potentially expanding access to millions of citizens.",
        "A diplomatic breakthrough has been achieved in international relations, easing tensions between major world powers.",
        "The government has announced a major policy initiative to address the housing crisis, including new funding for affordable housing projects.",
        "A new infrastructure investment plan has been unveiled, promising to modernize transportation systems and create thousands of jobs."
    ],
    "gaming": [
        "A leading game studio has announced an exclusive title for next-generation consoles, featuring groundbreaking graphics and innovative gameplay mechanics.",
        "The latest esports tournament has broken all previous viewership records, with millions of fans tuning in to watch the world's best players compete.",
        "A new virtual reality game has won multiple industry awards for its immersive experience and innovative use of VR technology.",
        "An independent game developer has secured a major publishing deal that will bring their unique vision to a global audience.",
        "A popular gaming platform has announced support for cross-platform play, allowing players on different systems to compete and cooperate in the same games."
    ]
}

# Sample sources
SOURCES = [
    "Reuters",
    "Associated Press",
    "Bloomberg",
    "The New York Times",
    "The Wall Street Journal",
    "BBC News",
    "CNN",
    "NPR",
    "The Guardian",
    "The Washington Post"
]

def generate_daily_data(date):
    daily_data = {}
    for topic in TOPICS:
        # Select 3 random headlines for each topic
        selected_headlines = random.sample(HEADLINES[topic], 3)
        headlines = []
        for headline in selected_headlines:
            headlines.append({
                "headline": headline,
                "text": random.choice(CONTENT[topic]),
                "sources": random.sample(SOURCES, random.randint(1, 3))
            })
        
        daily_data[topic] = {
            "emoji": TOPICS[topic],
            "headlines": headlines
        }
    return daily_data

def main():
    # Create data directory if it doesn't exist
    os.makedirs("public/data", exist_ok=True)
    
    # Generate data for the week of April 7-13, 2024
    start_date = datetime(2024, 4, 7)
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        date_str = current_date.strftime("%Y-%m-%d")
        daily_data = generate_daily_data(current_date)
        
        # Save to JSON file
        with open(f"public/data/{date_str}.json", "w") as f:
            json.dump(daily_data, f, indent=2)
    
    print("Data generation complete! Check the public/data directory.")

if __name__ == "__main__":
    main() 