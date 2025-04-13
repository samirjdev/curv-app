import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { articleId, headline, text, question } = await request.json();

    const prompt = `You are an AI assistant helping users understand news articles. 
    Please answer the user's question based on the following article:

    Headline: ${headline}
    Content: ${text}

    User's question: ${question}

    Please provide a clear, concise, and accurate answer based on the article content.
    If the question cannot be answered from the article, say so politely.
    Keep your response focused and relevant to the question asked.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 