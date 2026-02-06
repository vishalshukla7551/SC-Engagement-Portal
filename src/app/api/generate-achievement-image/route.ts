import { NextRequest, NextResponse } from 'next/server';

// Types for the image generation request
interface ImageGenerationRequest {
  userName: string;
  currentPoints: number;
  unitsSold: number;
  longestStreak: number;
  regionData?: {
    region: string;
    rank: number | string;
    topPercent: number;
  };
  rankTitle?: string;
  globalRank?: number | string;
  globalStats?: {
    rank: string | number;
    total: number;
    percent: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Starting achievement image generation...');
    const data: ImageGenerationRequest = await request.json();
    console.log('📊 Received data:', { 
      userName: data.userName, 
      currentPoints: data.currentPoints 
    });
    
    // For now, return a simple response that the frontend can handle
    // The actual image generation will be done client-side using html-to-image
    return NextResponse.json({
      success: true,
      message: 'Image generation request received',
      data: data
    });
    
  } catch (error) {
    console.error('❌ Image generation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process image generation request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}