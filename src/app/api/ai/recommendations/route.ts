import { financialRecommendationFlow } from '@/ai/flows';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Call the flow directly
    const result = await financialRecommendationFlow(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
