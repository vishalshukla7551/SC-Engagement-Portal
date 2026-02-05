import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for video generation progress
// In production, you'd want to use Redis or a database
const progressStore = new Map<string, {
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress: number;
  message: string;
  videoUrl?: string;
  error?: string;
}>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  
  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'Job ID is required' },
      { status: 400 }
    );
  }
  
  const progress = progressStore.get(jobId);
  
  if (!progress) {
    return NextResponse.json(
      { success: false, error: 'Job not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: progress
  });
}

export async function POST(request: NextRequest) {
  const { jobId, status, progress, message, videoUrl, error } = await request.json();
  
  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'Job ID is required' },
      { status: 400 }
    );
  }
  
  const currentProgress = progressStore.get(jobId) || {
    status: 'pending',
    progress: 0,
    message: 'Initializing...'
  };
  
  progressStore.set(jobId, {
    ...currentProgress,
    ...(status && { status }),
    ...(progress !== undefined && { progress }),
    ...(message && { message }),
    ...(videoUrl && { videoUrl }),
    ...(error && { error })
  });
  
  return NextResponse.json({ success: true });
}

// Clean up old progress entries (call this periodically)
export function cleanupOldProgress() {
  // Remove entries older than 1 hour
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  for (const [jobId, progress] of progressStore.entries()) {
    // You'd need to add timestamp to progress object in real implementation
    // For now, just keep the last 100 entries
    if (progressStore.size > 100) {
      progressStore.delete(jobId);
      break;
    }
  }
}