import asyncio
from politics_fetcher import get_daily_politics_articles
from business_fetcher import get_daily_business_articles
from science_fetcher import get_daily_science_articles
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

async def run_all_fetchers():
    """Run all fetchers and print their results"""
    try:
        # Run politics fetcher
        logging.info("Running politics fetcher...")
        politics_articles = await get_daily_politics_articles()
        logging.info(f"Found {len(politics_articles)} politics articles")
        
        # Run business fetcher
        logging.info("Running business fetcher...")
        business_articles = await get_daily_business_articles()
        logging.info(f"Found {len(business_articles)} business articles")
        
        # Run science fetcher
        logging.info("Running science fetcher...")
        science_articles = await get_daily_science_articles()
        logging.info(f"Found {len(science_articles)} science articles")
        
        # Print summary
        logging.info("\nSummary:")
        logging.info(f"Total politics articles: {len(politics_articles)}")
        logging.info(f"Total business articles: {len(business_articles)}")
        logging.info(f"Total science articles: {len(science_articles)}")
        
        return {
            "politics": politics_articles,
            "business": business_articles,
            "science": science_articles
        }
        
    except Exception as e:
        logging.error(f"Error running fetchers: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(run_all_fetchers()) 