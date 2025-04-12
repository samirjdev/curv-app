import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  console.log('Signup request received');
  
  try {
    const body = await req.json();
    console.log('Request body:', { ...body, password: '[REDACTED]' });
    
    const { email, password, name } = body;

    if (!email || !password || !name) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to database...');
    try {
      await connectDB();
      console.log('Database connection successful');
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    console.log('Creating new user...');
    try {
      const user = await User.create({
        email,
        password,
        name,
      });
      console.log('User created successfully');

      return NextResponse.json(
        { message: 'User created successfully', user: { id: user._id, email: user.email, name: user.name } },
        { status: 201 }
      );
    } catch (createError: any) {
      console.error('User creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    // If the error is not a JSON parsing error, return a more specific message
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format. Please check your input.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during signup' },
      { status: 500 }
    );
  }
} 