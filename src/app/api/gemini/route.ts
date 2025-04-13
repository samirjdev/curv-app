import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the article with comments
    const article = await Article.findById(articleId)
      .populate({
        path: 'comments.user',
        select: 'username'
      });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Prepare the prompt for Gemini
    const prompt = `Please analyze the following article and its comments to provide a concise summary of people's opinions on the topic.

Article Headline: ${article.headline}
Article Content: ${article.text}

Comments:
${article.comments.map((comment: any) => 
  `${comment.user.username}: ${comment.text}`
).join('\n')}

Please provide a brief summary (2-3 sentences) of the overall sentiment and key points discussed in the comments.`;

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 