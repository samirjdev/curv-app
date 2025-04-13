import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { topic, date } = await request.json();

    const prompt = `You are an AI news analyst specializing in trend analysis and headline generation.
    
Topic: ${topic}
Date: ${date}

Please provide:
1. A concise, engaging headline about the current trends in this topic (max 15 words)
2. A detailed analysis of the current trends, developments, and state of this topic (200-300 words)

Format your response as a JSON object with two fields:
- headline: The headline text
- analysis: The detailed analysis text

Make sure the content is informative, engaging, and reads like a professional news article.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response text
    const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
    
    try {
      // Try to parse the cleaned response as JSON
      const parsed = JSON.parse(cleanedText);
      return NextResponse.json(parsed);
    } catch {
      // If parsing fails, try to extract headline and analysis using a simple format
      const lines = text.split('\n');
      let headline = '';
      let analysis = '';
      
      // Find the headline and analysis in the text
      let isInAnalysis = false;
      for (const line of lines) {
        if (line.toLowerCase().includes('headline:')) {
          headline = line.replace(/headline:?/i, '').trim();
        } else if (line.toLowerCase().includes('analysis:')) {
          isInAnalysis = true;
        } else if (isInAnalysis) {
          analysis += line + '\n';
        }
      }

      return NextResponse.json({
        headline: headline || 'Trending Update',
        analysis: analysis.trim() || text
      });
    }
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 