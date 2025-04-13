from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import asyncio
from run_all_fetchers import run_all_fetchers
import os

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/articles", response_class=HTMLResponse)
async def get_articles(request: Request):
    # Run all fetchers
    articles = await run_all_fetchers()
    
    # Format articles for display
    formatted_articles = {}
    for topic, topic_articles in articles.items():
        formatted_articles[topic] = []
        for article in topic_articles:
            formatted_articles[topic].append({
                "headline": article["headline"],
                "date": article["date"],
                "sources": article["sources"],
                "text": article["text"],
                "emoji": article["emoji"]
            })
    
    return templates.TemplateResponse(
        "articles.html",
        {
            "request": request,
            "articles": formatted_articles
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 