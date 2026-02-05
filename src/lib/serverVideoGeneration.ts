// Server-side video generation utility for Yoddha Winnings
export interface VideoGenerationData {
  userName: string;
  currentPoints: number;
  unitsSold: number;
  longestStreak: number;
  regionData?: {
    region: string;
    rank: number | string;
    topPercent: number;
  };
  leaderboardData?: any[];
  rankTitle?: string;
  hallOfFameData?: any[];
  globalRank?: number | string;
  globalStats?: {
    rank: string | number;
    total: number;
    percent: number;
  };
}

export interface ProgressCallback {
  (progress: number, message: string): void;
}

export class ServerVideoGenerator {
  private static instance: ServerVideoGenerator;
  
  public static getInstance(): ServerVideoGenerator {
    if (!ServerVideoGenerator.instance) {
      ServerVideoGenerator.instance = new ServerVideoGenerator();
    }
    return ServerVideoGenerator.instance;
  }

  // Check if device should use server-side generation
  public shouldUseServerSide(): boolean {
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    const hasVideoEncoder = 'VideoEncoder' in window;
    
    return isMobile || isSmallScreen || !hasVideoEncoder;
  }

  // Generate video on server-side with progress tracking
  public async generateVideo(
    data: VideoGenerationData,
    progressCallback?: ProgressCallback
  ): Promise<File> {
    try {
      progressCallback?.(5, 'Starting server-side video generation...');

      // Start server-side video generation
      const response = await fetch('/api/generate-yoddha-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          async: true // Use async mode for progress tracking
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Server-side generation failed');
      }

      const jobId = result.jobId;
      progressCallback?.(15, 'Video generation started, tracking progress...');

      // Poll for progress
      let completed = false;
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes timeout

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        attempts++;

        try {
          const progressResponse = await fetch(`/api/generate-yoddha-video?jobId=${jobId}`);
          
          if (progressResponse.ok) {
            const contentType = progressResponse.headers.get('content-type');
            
            if (contentType && contentType.includes('video/mp4')) {
              // Video is ready, download it
              const videoBlob = await progressResponse.blob();
              const videoFile = new File([videoBlob], `Yoddha_2026_Recap.mp4`, { type: 'video/mp4' });
              
              progressCallback?.(100, 'Video generation completed!');
              return videoFile;
            } else {
              // Still processing, get progress
              const progressData = await progressResponse.json();
              
              if (progressData.success && progressData.data) {
                const { status, progress, message, error } = progressData.data;
                
                progressCallback?.(Math.min(progress || 0, 95), message || 'Processing...');
                
                if (status === 'error') {
                  throw new Error(error || 'Server-side generation failed');
                }
                
                if (status === 'completed') {
                  completed = true;
                }
              }
            }
          } else {
            console.warn('Progress check failed:', progressResponse.status);
          }
        } catch (progressError) {
          console.warn('Progress check error:', progressError);
        }
      }

      if (!completed) {
        throw new Error('Video generation timed out. Please try again.');
      }

      throw new Error('Unexpected completion state');

    } catch (error) {
      console.error('Server-side video generation failed:', error);
      throw error;
    }
  }

  // Fallback to synchronous generation for smaller videos
  public async generateVideoSync(data: VideoGenerationData): Promise<File> {
    try {
      const response = await fetch('/api/generate-yoddha-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          async: false // Synchronous mode
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const videoBlob = await response.blob();
      return new File([videoBlob], `Yoddha_2026_Recap.mp4`, { type: 'video/mp4' });

    } catch (error) {
      console.error('Synchronous server-side video generation failed:', error);
      throw error;
    }
  }

  // Download the generated video file
  public downloadVideo(videoFile: File): void {
    const url = URL.createObjectURL(videoFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = videoFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}