import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { NextRequest } from 'next/server';

const MONGODB_URI = process.env.MONGODB_URI!;
const client = new MongoClient(MONGODB_URI);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const topic = searchParams.get('topic');

    await client.connect();
    const db = client.db('test');
    const ratingsCollection = db.collection('topic_ratings');

    const rating = await ratingsCollection.findOne({
      date,
      topic,
    });

    return NextResponse.json({
      likes: rating?.likes || 0,
      dislikes: rating?.dislikes || 0,
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, topic, vote } = await request.json();

    await client.connect();
    const db = client.db('test');
    const ratingsCollection = db.collection('topic_ratings');

    // Simple increment of likes or dislikes
    const update = {
      $inc: {
        likes: vote === 'like' ? 1 : 0,
        dislikes: vote === 'dislike' ? 1 : 0,
      }
    };

    await ratingsCollection.updateOne(
      { date, topic },
      update,
      { upsert: true }
    );

    // Fetch updated rating
    const updatedRating = await ratingsCollection.findOne({
      date,
      topic,
    });

    return NextResponse.json({
      likes: updatedRating?.likes || 0,
      dislikes: updatedRating?.dislikes || 0,
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close();
  }
} 