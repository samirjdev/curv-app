import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import PinnedArticle from '@/models/PinnedArticle';
import Article from '@/models/Article';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get all pinned articles for a user
export async function GET(req: Request) {
  try {
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all pinned articles for the user with article details
    const pinnedArticles = await PinnedArticle.find({ userId: decoded.userId })
      .sort({ pinnedAt: -1 }) // Sort by most recently pinned
      .populate({
        path: 'articleId',
        model: Article,
        select: 'headline text sources topic date emoji'
      });

    // Transform the data to match our frontend needs
    const articles = pinnedArticles.map(pin => ({
      id: pin.articleId._id,
      headline: pin.articleId.headline,
      text: pin.articleId.text,
      sources: pin.articleId.sources,
      topic: pin.articleId.topic,
      date: pin.articleId.date,
      emoji: pin.articleId.emoji,
      pinnedAt: pin.pinnedAt
    }));

    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Error fetching pinned articles:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Pin an article
export async function POST(req: Request) {
  try {
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Create or update pinned article
    await PinnedArticle.findOneAndUpdate(
      { userId: decoded.userId, articleId },
      { userId: decoded.userId, articleId },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { message: 'Article pinned successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error pinning article:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Unpin an article
export async function DELETE(req: Request) {
  try {
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Delete the pinned article
    await PinnedArticle.findOneAndDelete({
      userId: decoded.userId,
      articleId
    });

    return NextResponse.json(
      { message: 'Article unpinned successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error unpinning article:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 