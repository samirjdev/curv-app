import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Article from '@/models/Article';
import { auth } from '@/lib/auth';

// Update the MongoDB connection to use 'test' database
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await auth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const topic = searchParams.get('topic');

    if (!date || !topic) {
      return NextResponse.json({ error: 'Date and topic are required' }, { status: 400 });
    }

    await connectToDatabase();

    const articles = await Article.find({ 
      date,
      topic
    });

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: 'No articles found' }, { status: 404 });
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 