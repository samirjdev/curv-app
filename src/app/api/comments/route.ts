import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get comments for an article
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

    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get article with comments and usernames
    const article = await Article.findById(articleId)
      .populate({
        path: 'comments.user',
        model: User,
        select: 'username'
      });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Transform comments to include only username
    const comments = article.comments.map((comment: any) => ({
      username: comment.user.username,
      text: comment.text,
      createdAt: comment.createdAt
    }));

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Add a comment to an article
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

    const { articleId, text } = await req.json();

    if (!articleId || !text?.trim()) {
      return NextResponse.json(
        { error: 'Article ID and comment text are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user for username
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Add comment to article
    const article = await Article.findById(articleId);
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const comment = {
      user: decoded.userId,
      text: text.trim(),
      createdAt: new Date()
    };

    article.comments.push(comment);
    await article.save();

    // Return the comment with username for immediate display
    return NextResponse.json({
      comment: {
        username: user.username,
        text: comment.text,
        createdAt: comment.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 