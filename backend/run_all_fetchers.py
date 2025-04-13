import asyncio
import json
from datetime import datetime
import logging
import os
from dotenv import load_dotenv
from politics_fetcher import get_daily_politics_articles
from business_fetcher import get_daily_business_articles
from science_fetcher import get_daily_science_articles
from tech_fetcher import get_daily_tech_articles
from sports_fetcher import get_daily_sports_articles
from entertainment_fetcher import get_daily_entertainment_articles

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load environment variables
load_dotenv()

# Check for GEMINI_API_KEY
if not os.getenv('GEMINI_API_KEY'):
    logging.warning("GEMINI_API_KEY not found. Articles will be ranked using basic heuristics.")

async def run_fetcher(fetcher_func, topic):
    """Run a single fetcher with error handling"""
    try:
        articles = await fetcher_func()
        logging.info(f"Successfully fetched {len(articles)} {topic} articles")
        return articles
    except Exception as e:
        logging.error(f"Error fetching {topic} articles: {str(e)}")
        return []

async def run_all_fetchers():
    """Run all fetchers and save their output to JSON files"""
    try:
        # Create tasks for each fetcher
        tasks = [
            run_fetcher(get_daily_politics_articles, "politics"),
            run_fetcher(get_daily_business_articles, "business"),
            run_fetcher(get_daily_science_articles, "science"),
            run_fetcher(get_daily_tech_articles, "tech"),
            run_fetcher(get_daily_sports_articles, "sports"),
            run_fetcher(get_daily_entertainment_articles, "entertainment")
        ]
        
        # Run all fetchers concurrently
        results = await asyncio.gather(*tasks)
        
        # Create a dictionary to store all articles by topic
        all_articles = {
            "politics": results[0],
            "business": results[1],
            "science": results[2],
            "tech": results[3],
            "sports": results[4],
            "entertainment": results[5]
        }
        
        # Generate timestamp for filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create output directory if it doesn't exist
        os.makedirs('output', exist_ok=True)
        
        # Save all articles to a single JSON file
        output_file = f"output/articles_{timestamp}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_articles, f, ensure_ascii=False, indent=2)
        
        # Print summary
        logging.info("\nSummary:")
        total_articles = 0
        for topic, articles in all_articles.items():
            article_count = len(articles)
            total_articles += article_count
            logging.info(f"Total {topic} articles: {article_count}")
        
        logging.info(f"\nTotal articles across all topics: {total_articles}")
        logging.info(f"Articles saved to {output_file}")
        
        return all_articles
        
    except Exception as e:
        logging.error(f"Error running fetchers: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(run_all_fetchers()) 