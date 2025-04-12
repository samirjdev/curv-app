import { verify } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import connectToDatabase from './mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function auth(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };
    
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
} 