import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { createBrowser } from './puppeteer-config';

// Types for the video generation request
interface VideoGenerationRequest {
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
  async?: boolean; // If true, return job ID for progress tracking
}

// Progress tracking
const progressStore = new Map<string, {
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress: number;
  message: string;
  videoPath?: string;
  error?: string;
}>();

// Update progress
async function updateProgress(jobId: string, progress: number, message: string, status?: string) {
  const current = progressStore.get(jobId) || { status: 'pending', progress: 0, message: '' };
  progressStore.set(jobId, {
    ...current,
    progress,
    message,
    ...(status && { status: status as any })
  });
}

// Slide definitions matching frontend exactly (optimized durations for faster generation)
const SLIDES = [
  { type: 'intro', duration: 3000, variant: 'default' },
  { type: 'stats', duration: 4000, variant: 'radar' },
  { type: 'rank', duration: 4000, variant: 'laser' },
  { type: 'leaderboard', duration: 3000, variant: 'battalion' },
  { type: 'badges', duration: 4000, variant: 'regal' },
  { type: 'hall-of-fame', duration: 3000, variant: 'spotlight' },
  { type: 'outro', duration: 5000, variant: 'cobra' }
];

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Starting video generation request...');
    const data: VideoGenerationRequest = await request.json();
    console.log('📊 Received data:', { 
      userName: data.userName, 
      currentPoints: data.currentPoints,
      async: data.async 
    });
    
    // If async mode, start generation in background and return job ID
    if (data.async) {
      const jobId = randomUUID();
      console.log(`🆔 Generated job ID: ${jobId}`);
      
      // Initialize progress
      progressStore.set(jobId, {
        status: 'pending',
        progress: 0,
        message: 'Starting video generation...'
      });
      
      // Start generation in background
      generateVideoAsync(jobId, data).catch(error => {
        console.error('❌ Async video generation failed:', error);
        progressStore.set(jobId, {
          status: 'error',
          progress: 0,
          message: 'Video generation failed',
          error: error.message
        });
      });
      
      return NextResponse.json({
        success: true,
        jobId,
        message: 'Video generation started. Use the job ID to check progress.'
      });
    }
    
    // Synchronous generation (for smaller videos or testing)
    console.log('🔄 Starting synchronous video generation...');
    const videoBuffer = await generateVideo(data);
    
    return new NextResponse(videoBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="yoddha_winnings_${data.userName.replace(/\s+/g, '_')}.mp4"`,
        'Content-Length': videoBuffer.length.toString()
      }
    });
    
  } catch (error) {
    console.error('❌ Video generation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate video',
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Get progress for async generation
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
  
  // If completed, return the video file
  if (progress.status === 'completed' && progress.videoPath) {
    try {
      const videoBuffer = await fs.readFile(progress.videoPath);
      
      // Clean up the file after sending
      fs.unlink(progress.videoPath).catch(() => {});
      progressStore.delete(jobId);
      
      return new NextResponse(videoBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="yoddha_winnings_video.mp4"`,
          'Content-Length': videoBuffer.length.toString()
        }
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Video file not found' },
        { status: 404 }
      );
    }
  }
  
  return NextResponse.json({
    success: true,
    data: progress
  });
}

// Async video generation
async function generateVideoAsync(jobId: string, data: VideoGenerationRequest) {
  try {
    console.log(`🎬 Starting async video generation for job ${jobId}`);
    await updateProgress(jobId, 5, 'Initializing browser...', 'generating');
    
    const videoBuffer = await generateVideo(data, (progress, message) => {
      console.log(`📊 Job ${jobId}: ${progress}% - ${message}`);
      updateProgress(jobId, progress, message);
    });
    
    console.log(`💾 Video generated for job ${jobId}, saving to file...`);
    
    // Save video to temporary file
    const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'yoddha-completed-'));
    const videoPath = path.join(tempDir, 'video.mp4');
    await fs.writeFile(videoPath, videoBuffer);
    
    console.log(`✅ Video saved for job ${jobId} at ${videoPath}`);
    
    progressStore.set(jobId, {
      status: 'completed',
      progress: 100,
      message: 'Video generation completed!',
      videoPath
    });
    
  } catch (error) {
    console.error(`❌ Async video generation failed for job ${jobId}:`, error);
    progressStore.set(jobId, {
      status: 'error',
      progress: 0,
      message: 'Video generation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Main video generation function with timeout protection
async function generateVideo(
  data: VideoGenerationRequest, 
  progressCallback?: (progress: number, message: string) => void
): Promise<Buffer> {
  let browser: any = null;
  let tempDir: string = '';
  
  // Set overall timeout for video generation (10 minutes max)
  const overallTimeout = setTimeout(() => {
    throw new Error('Video generation timed out after 10 minutes');
  }, 10 * 60 * 1000);
  
  try {
    progressCallback?.(10, 'Creating temporary directory...');
    
    // Create temporary directory for frames
    tempDir = await fs.mkdtemp(path.join(tmpdir(), 'yoddha-video-'));
    const framesDir = path.join(tempDir, 'frames');
    await fs.mkdir(framesDir, { recursive: true });
    
    progressCallback?.(15, 'Launching browser...');
    
    // Launch Puppeteer with serverless-optimized configuration
    browser = await createBrowser();
    
    const page = await browser.newPage();
    
    // Set viewport for 9:16 vertical format (720x1280)
    await page.setViewport({ 
      width: 720, 
      height: 1280, 
      deviceScaleFactor: 1 // Reduced from 2 for faster rendering
    });
    
    let frameIndex = 0;
    const totalSlides = SLIDES.length;
    
    progressCallback?.(20, 'Loading audio file...');
    
    // Load and process audio (with timeout)
    let audioBuffer: Buffer | null = null;
    try {
      const audioPath = path.join(process.cwd(), 'public', 'audio track', 'iam attaching lyrics for the song, the t.mp3');
      audioBuffer = await Promise.race([
        fs.readFile(audioPath),
        new Promise<Buffer>((_, reject) => 
          setTimeout(() => reject(new Error('Audio loading timeout')), 10000)
        )
      ]);
    } catch (audioError) {
      console.warn('Could not load audio file:', audioError);
      // Continue without audio
    }
    
    progressCallback?.(25, 'Generating slide frames...');
    
    // Generate frames for each slide
    for (let slideIdx = 0; slideIdx < SLIDES.length; slideIdx++) {
      const slide = SLIDES[slideIdx];
      
      progressCallback?.(
        25 + (slideIdx / totalSlides) * 50, 
        `Generating frames for slide: ${slide.type}`
      );
      
      // Generate HTML content for this slide
      const htmlContent = generateSlideHTML(slide, data);
      
      // Set the HTML content with timeout
      await Promise.race([
        page.setContent(htmlContent, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 // Reduced timeout
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Slide ${slide.type} loading timeout`)), 20000)
        )
      ]);
      
      // Wait for fonts and animations to load (reduced time)
      await new Promise(resolve => setTimeout(resolve, 300)); // Reduced from 500ms
      
      // Capture frames for this slide with Ken Burns effect (reduced frames for faster generation)
      const targetFPS = 15; // Reduced from 30 for faster generation
      const actualFramesForSlide = Math.floor((slide.duration / 1000) * targetFPS);
      
      for (let i = 0; i < actualFramesForSlide; i++) {
        const framePath = path.join(framesDir, `frame_${frameIndex.toString().padStart(6, '0')}.png`);
        
        // Add subtle Ken Burns effect for cinematic feel
        const progress = i / actualFramesForSlide;
        const scale = 1.0 + (progress * 0.01); // Minimal effect
        const translateX = (progress - 0.5) * 2; // Minimal movement
        
        await page.evaluate((scale: number, translateX: number) => {
          document.body.style.transform = `scale(${scale}) translateX(${translateX}px)`;
        }, scale, translateX);
        
        await page.screenshot({
          path: framePath,
          type: 'png',
          fullPage: false,
          clip: { x: 0, y: 0, width: 720, height: 1280 }
        });
        
        frameIndex++;
        
        // No delay between frames for maximum speed
      }
    }
    
    await browser.close();
    browser = null;
    
    progressCallback?.(75, 'Encoding video with FFmpeg...');
    
    // Generate video from frames using FFmpeg
    const videoPath = path.join(tempDir, 'yoddha_video.mp4');
    
    await new Promise<void>((resolve, reject) => {
      // Set timeout for FFmpeg process
      const ffmpegTimeout = setTimeout(() => {
        reject(new Error('FFmpeg encoding timed out after 5 minutes'));
      }, 5 * 60 * 1000); // 5 minute timeout
      
      let ffmpegCommand = ffmpeg()
        .input(path.join(framesDir, 'frame_%06d.png'))
        .inputFPS(15) // Match reduced FPS
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-crf 28', // Increased CRF for smaller file size and faster encoding
          '-preset ultrafast', // Fastest encoding preset
          '-movflags +faststart',
          '-vf scale=720:1280' // Ensure 9:16 aspect ratio
        ]);
      
      // Add audio if available
      if (audioBuffer) {
        const audioPath = path.join(tempDir, 'audio.mp3');
        fs.writeFile(audioPath, audioBuffer).then(() => {
          ffmpegCommand = ffmpegCommand
            .input(audioPath)
            .outputOptions([
              '-c:a aac',
              '-b:a 96k', // Reduced audio bitrate
              '-shortest' // Match video duration
            ]);
          
          executeFFmpeg();
        }).catch(reject);
      } else {
        executeFFmpeg();
      }
      
      function executeFFmpeg() {
        ffmpegCommand
          .output(videoPath)
          .on('progress', (progress) => {
            const percent = Math.min(75 + (progress.percent || 0) * 0.2, 95);
            progressCallback?.(percent, `Encoding video: ${Math.round(progress.percent || 0)}%`);
          })
          .on('end', () => {
            clearTimeout(ffmpegTimeout);
            progressCallback?.(95, 'Video encoding completed');
            resolve();
          })
          .on('error', (err) => {
            clearTimeout(ffmpegTimeout);
            reject(err);
          })
          .run();
      }
    });
    
    progressCallback?.(98, 'Reading video file...');
    
    // Read the generated video file
    const videoBuffer = await fs.readFile(videoPath);
    
    progressCallback?.(100, 'Video generation completed!');
    
    // Clear the overall timeout
    clearTimeout(overallTimeout);
    
    // Clean up temporary files
    await fs.rm(tempDir, { recursive: true, force: true });
    
    return videoBuffer;
    
  } catch (error) {
    console.error('❌ Video generation error:', error);
    
    // Enhanced error logging for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      environment: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      platform: process.platform,
      arch: process.arch
    };
    
    console.error('🔍 Detailed error information:', errorDetails);
    
    // Clear the overall timeout
    clearTimeout(overallTimeout);
    
    // Clean up on error
    if (browser) {
      await browser.close().catch((closeError: Error) => {
        console.error('Error closing browser:', closeError);
      });
    }
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch((cleanupError: Error) => {
        console.error('Error cleaning up temp directory:', cleanupError);
      });
    }
    
    // Provide user-friendly error message based on error type
    let userMessage = 'Video generation failed';
    if (error instanceof Error) {
      if (error.message.includes('Chrome') || error.message.includes('browser')) {
        userMessage = 'Video generation service temporarily unavailable';
      } else if (error.message.includes('timeout')) {
        userMessage = 'Video generation timed out - please try again';
      } else if (error.message.includes('memory')) {
        userMessage = 'Video generation failed due to resource constraints';
      }
    }
    
    throw new Error(`${userMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate PatrioticBackground HTML for different variants
function generatePatrioticBackground(variant: string): string {
  const baseBackground = `
    <div class="patriotic-bg">
      <!-- Common camouflage texture overlay -->
      <div class="camouflage-texture"></div>
  `;
  
  switch (variant) {
    case 'default':
      return baseBackground + `
        <div class="tricolor-glow"></div>
        <div class="tricolor-glow-reverse"></div>
        <div class="ashoka-chakra">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5">
            <circle cx="12" cy="12" r="10" stroke-width="1" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            ${[...Array(24)].map((_, i) => 
              `<line x1="12" y1="12" x2="12" y2="2" transform="rotate(${i * 15} 12 12)" stroke-linecap="round" />`
            ).join('')}
          </svg>
        </div>
      </div>`;
      
    case 'radar':
      return baseBackground + `
        <!-- Grid Lines -->
        <div class="radar-grid"></div>
        <!-- Radar Sweep -->
        <div class="radar-sweep"></div>
        <!-- Radar Blips -->
        <div class="radar-blip blip-1"></div>
        <div class="radar-blip blip-2"></div>
      </div>`;
      
    case 'spotlight':
      return baseBackground + `
        <div class="spotlight-gradient"></div>
        <div class="spotlight-beam"></div>
        <div class="spotlight-vignette"></div>
        <!-- Moving Beams -->
        <div class="moving-beam beam-1"></div>
        <div class="moving-beam beam-2"></div>
      </div>`;
      
    case 'regal':
      return baseBackground + `
        <!-- Gold Vignette -->
        <div class="regal-vignette"></div>
        <div class="regal-pattern"></div>
        <!-- Slow pulse -->
        <div class="regal-pulse"></div>
      </div>`;
      
    case 'rising':
      return baseBackground + `
        <!-- Rising particles -->
        ${[...Array(20)].map((_, i) => 
          `<div class="rising-particle particle-${i}"></div>`
        ).join('')}
      </div>`;
      
    case 'cobra':
      return baseBackground + `
        <div class="cobra-gradient"></div>
        <div class="cobra-hex-pattern"></div>
        <!-- Glitch effect -->
        <div class="cobra-glitch"></div>
      </div>`;
      
    case 'battalion':
      return baseBackground + `
        <div class="battalion-tint"></div>
        <!-- Topographic Lines -->
        <div class="topographic-lines"></div>
        <!-- Crosshairs -->
        <div class="crosshairs-grid"></div>
        <!-- Rotating Map Target -->
        <div class="map-target">
          <div class="target-corners"></div>
          <div class="target-circle"></div>
        </div>
      </div>`;
      
    case 'honor':
      return baseBackground + `
        <!-- Flowing Tricolor Bands -->
        <div class="tricolor-bands"></div>
        <!-- Texture Overlay -->
        <div class="honor-texture"></div>
        <!-- Central Glow -->
        <div class="honor-glow"></div>
      </div>`;
      
    case 'elite':
      return baseBackground + `
        <!-- Intense Dark Base -->
        <div class="elite-dark"></div>
        <!-- Tricolor Lasers/Beams -->
        <div class="elite-laser laser-saffron"></div>
        <div class="elite-laser laser-white"></div>
        <div class="elite-laser laser-green"></div>
        <!-- Explosive Burst Effect -->
        <div class="elite-burst"></div>
      </div>`;
      
    case 'laser':
      return baseBackground + `
        <div class="laser-dark"></div>
        <!-- Vertical Laser Beams -->
        ${[...Array(6)].map((_, i) => 
          `<div class="laser-beam beam-${i} ${i % 3 === 0 ? 'beam-saffron' : i % 3 === 1 ? 'beam-white' : 'beam-green'}"></div>`
        ).join('')}
        <!-- Floating Particles -->
        ${[...Array(20)].map((_, i) => 
          `<div class="laser-particle particle-${i}"></div>`
        ).join('')}
      </div>`;
      
    default:
      return baseBackground + '</div>';
  }
}

// Generate HTML content for each slide that matches the frontend design exactly
function generateSlideHTML(slide: any, data: VideoGenerationRequest): string {
  const baseStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        width: 720px;
        height: 1280px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #001233;
        color: white;
        overflow: hidden;
        position: relative;
      }
      
      /* Patriotic Background Base Styles */
      .patriotic-bg {
        position: absolute;
        inset: 0;
        overflow: hidden;
        background: #001233;
      }
      
      .camouflage-texture {
        position: absolute;
        inset: 0;
        opacity: 0.1;
        mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
        animation: texture-move 60s linear infinite;
      }
      
      /* Default Variant Styles */
      .tricolor-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(from 0deg, transparent 0deg, #FF9933 120deg, transparent 180deg);
        opacity: 0.3;
        filter: blur(100px);
        animation: spin-slow 60s linear infinite;
      }
      
      .tricolor-glow-reverse {
        position: absolute;
        bottom: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(from 180deg, transparent 0deg, #138808 120deg, transparent 180deg);
        opacity: 0.3;
        filter: blur(100px);
        animation: spin-slow 60s linear infinite reverse;
      }
      
      .ashoka-chakra {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60vh;
        height: 60vh;
        opacity: 0.05;
        pointer-events: none;
        animation: spin-slow 120s linear infinite;
      }
      
      .ashoka-chakra svg {
        width: 100%;
        height: 100%;
        color: white;
      }
      
      /* Radar Variant Styles */
      .radar-grid {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 50px 50px;
      }
      
      .radar-sweep {
        position: absolute;
        inset: 0;
        background: conic-gradient(from 0deg, transparent 0deg, rgba(0,255,0,0.1) 60deg, rgba(0,255,0,0) 80deg);
        animation: spin-fast 4s linear infinite;
        opacity: 0.5;
      }
      
      .radar-blip {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        animation: blip-pulse 2s infinite;
      }
      
      .blip-1 {
        top: 33%;
        left: 25%;
        background: #0f0;
        box-shadow: 0 0 10px #0f0;
      }
      
      .blip-2 {
        bottom: 33%;
        right: 25%;
        background: #f00;
        box-shadow: 0 0 10px #f00;
        animation-delay: 1s;
      }
      
      /* Spotlight Variant Styles */
      .spotlight-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, black, transparent, black);
        opacity: 0.8;
      }
      
      .spotlight-beam {
        position: absolute;
        top: -20%;
        left: 50%;
        transform: translateX(-50%);
        width: 80vh;
        height: 80vh;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        filter: blur(60px);
        pointer-events: none;
      }
      
      .spotlight-vignette {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(to top, #001233, transparent);
      }
      
      .moving-beam {
        position: absolute;
        top: -50%;
        left: 50%;
        width: 200px;
        height: 150vh;
        background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
        filter: blur(20px);
        transform-origin: top;
        transform: translateX(-50%);
      }
      
      .beam-1 {
        animation: beam-sway-1 10s ease-in-out infinite;
      }
      
      .beam-2 {
        animation: beam-sway-2 12s ease-in-out infinite;
        animation-delay: -3s;
      }
      
      /* Laser Variant Styles */
      .laser-dark {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
      }
      
      .laser-beam {
        position: absolute;
        bottom: 0;
        width: 2px;
        filter: blur(1px);
        animation: laser-rise 3s ease-out infinite;
      }
      
      .beam-0 { left: 15%; animation-delay: 0s; }
      .beam-1 { left: 29%; animation-delay: 0.5s; }
      .beam-2 { left: 43%; animation-delay: 1s; }
      .beam-3 { left: 57%; animation-delay: 1.5s; }
      .beam-4 { left: 71%; animation-delay: 2s; }
      .beam-5 { left: 85%; animation-delay: 2.5s; }
      
      .beam-saffron { background: #FF9933; }
      .beam-white { background: #FFFFFF; }
      .beam-green { background: #138808; }
      
      .laser-particle {
        position: absolute;
        bottom: 0;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        opacity: 0;
        animation: particle-rise 4s linear infinite;
      }
      
      /* Battalion Variant Styles */
      .battalion-tint {
        position: absolute;
        inset: 0;
        background: #001800;
        opacity: 0.9;
        mix-blend-mode: multiply;
      }
      
      .topographic-lines {
        position: absolute;
        inset: 0;
        opacity: 0.2;
        background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 C 20 20 40 10 50 30 C 60 50 80 40 100 60' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3Cpath d='M0 20 C 30 30 50 20 60 40 C 70 60 90 50 100 80' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E");
        background-size: 300px 300px;
      }
      
      .crosshairs-grid {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
        background-size: 100px 100px;
      }
      
      .map-target {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 60vh;
        height: 60vh;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.3;
        animation: spin-slow 60s linear infinite;
      }
      
      .target-corners {
        position: absolute;
        inset: 0;
      }
      
      .target-corners::before,
      .target-corners::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        border: 2px solid white;
      }
      
      .target-corners::before {
        top: 0;
        left: 0;
        border-right: none;
        border-bottom: none;
      }
      
      .target-corners::after {
        bottom: 0;
        right: 0;
        border-left: none;
        border-top: none;
      }
      
      .target-circle {
        position: absolute;
        top: 5%;
        left: 5%;
        width: 90%;
        height: 90%;
        border: 1px dashed rgba(255,255,255,0.2);
        border-radius: 50%;
      }
      
      /* Elite Variant Styles */
      .elite-dark {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
      }
      
      .elite-laser {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200vw;
        height: 2px;
        opacity: 0.5;
        transform-origin: left;
      }
      
      .laser-saffron {
        background: linear-gradient(90deg, transparent, #FF9933);
        animation: spin-slow 10s linear infinite;
      }
      
      .laser-white {
        background: linear-gradient(90deg, transparent, #FFFFFF);
        animation: spin-slow 12s linear infinite;
      }
      
      .laser-green {
        background: linear-gradient(90deg, transparent, #138808);
        animation: spin-slow 14s linear infinite;
      }
      
      .elite-burst {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 60vh;
        height: 60vh;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
        animation: pulse 2s infinite;
      }
      
      /* Cobra Variant Styles */
      .cobra-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom right, #1a1a1a, #001233);
      }
      
      .cobra-hex-pattern {
        position: absolute;
        inset: 0;
        opacity: 0.3;
        background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0 L50 12.5 L50 37.5 L25 50 L0 37.5 L0 12.5 Z' fill='none' stroke='%23FFFFFF' stroke-opacity='0.1' /%3E%3C/svg%3E");
        background-size: 50px 50px;
      }
      
      .cobra-glitch {
        position: absolute;
        inset: 0;
        background: white;
        mix-blend-mode: overlay;
        opacity: 0;
        animation: glitch-flash 0.2s infinite;
        animation-delay: 5s;
      }
      
      /* Regal Variant Styles */
      .regal-vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%);
      }
      
      .regal-pattern {
        position: absolute;
        inset: 0;
        opacity: 0.2;
        background-image: repeating-linear-gradient(45deg, #FFD700 0, #FFD700 1px, transparent 0, transparent 50%);
        background-size: 20px 20px;
      }
      
      .regal-pulse {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top right, rgba(255,153,51,0.2), transparent, rgba(19,136,8,0.2));
        animation: pulse-slow 4s infinite;
      }
      
      /* Rising Variant Styles */
      .rising-particle {
        position: absolute;
        width: 1px;
        height: 20px;
        background: linear-gradient(to top, transparent, #FF9933, transparent);
        animation: rise-up 5s linear infinite;
      }
      
      /* Honor Variant Styles */
      .tricolor-bands {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        opacity: 0.3;
        filter: blur(80px);
        background: linear-gradient(180deg, #FF9933 30%, #FFFFFF 50%, #138808 70%);
        animation: bands-flow 15s ease-in-out infinite;
        transform: rotate(45deg);
      }
      
      .honor-texture {
        position: absolute;
        inset: 0;
        opacity: 0.2;
        background-image: radial-gradient(#FFD700 1px, transparent 1px);
        background-size: 40px 40px;
      }
      
      .honor-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50vh;
        height: 50vh;
        background: linear-gradient(to right, rgba(255,153,51,0.2), rgba(19,136,8,0.2));
        filter: blur(100px);
        border-radius: 50%;
      }
      
      /* Slide Container */
      .slide-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 60px 40px;
        z-index: 10;
      }
      
      /* Animations */
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes spin-fast {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      @keyframes pulse-slow {
        0%, 100% { opacity: 0.1; }
        50% { opacity: 0.3; }
      }
      
      @keyframes blip-pulse {
        0%, 100% { opacity: 0; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.5); }
      }
      
      @keyframes beam-sway-1 {
        0%, 100% { transform: translateX(-50%) rotate(-20deg); }
        50% { transform: translateX(-50%) rotate(20deg); }
      }
      
      @keyframes beam-sway-2 {
        0%, 100% { transform: translateX(-50%) rotate(15deg); }
        50% { transform: translateX(-50%) rotate(-15deg); }
      }
      
      @keyframes laser-rise {
        0% { height: 0%; opacity: 0; }
        50% { opacity: 0.4; }
        100% { height: 120%; opacity: 0; }
      }
      
      @keyframes particle-rise {
        0% { transform: translateY(0); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translateY(-800px); opacity: 0; }
      }
      
      @keyframes glitch-flash {
        0%, 90% { opacity: 0; }
        95% { opacity: 0.2; }
        100% { opacity: 0; }
      }
      
      @keyframes rise-up {
        0% { bottom: -20px; opacity: 0; }
        10% { opacity: 1; }
        100% { bottom: 100vh; opacity: 0; }
      }
      
      @keyframes bands-flow {
        0%, 100% { transform: rotate(45deg) translateY(-20%); }
        50% { transform: rotate(45deg) translateY(0%); }
      }
      
      @keyframes texture-move {
        0% { background-position: 0% 0%; }
        100% { background-position: 100% 100%; }
      }
      
      /* Intro Slide Specific Styles */
      .intro-header {
        background: #FF9933;
        color: black;
        width: 100%;
        max-width: 600px;
        padding: 20px;
        transform: rotate(-2deg) scale(1.1);
        margin-bottom: 40px;
        border-top: 4px solid white;
        border-bottom: 4px solid white;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        position: relative;
        z-index: 10;
      }
      
      .intro-header-text {
        font-size: 1.5rem;
        font-weight: bold;
        letter-spacing: 0.5em;
        text-transform: uppercase;
        animation: pulse 2s infinite;
      }
      
      .main-title {
        font-weight: 900;
        line-height: 0.85;
        letter-spacing: -2px;
        margin-bottom: 30px;
        position: relative;
        pointer-events: none;
        user-select: none;
      }
      
      .yoddha-text {
        font-size: 12rem;
        color: transparent;
        background: linear-gradient(to bottom, white, #9ca3af);
        -webkit-background-clip: text;
        background-clip: text;
        position: relative;
        z-index: 30;
        -webkit-text-stroke: 2px rgba(255,255,255,0.2);
        filter: drop-shadow(0 4px 0 #000);
      }
      
      .wrapped-text {
        font-size: 12rem;
        color: #FF9933;
        position: relative;
        z-index: 20;
        margin-top: -3rem;
        mix-blend-mode: normal;
        transform: skewX(12deg);
        text-shadow: 4px 4px 0px #000;
      }
      
      .success-badge {
        background: #138808;
        color: white;
        display: inline-block;
        padding: 12px 40px;
        font-weight: bold;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        transform: rotate(2deg);
        border: 2px solid rgba(255,255,255,0.5);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        font-size: 1.1rem;
      }
      
      /* Stats Slide Specific Styles */
      .stats-container {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 153, 51, 0.3);
        padding: 40px;
        border-radius: 24px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 30px rgba(255, 153, 51, 0.2);
        max-width: 500px;
        width: 100%;
      }
      
      .scanning-line {
        position: absolute;
        left: 0;
        width: 100%;
        height: 2px;
        background: #138808;
        box-shadow: 0 0 10px #138808;
        animation: scan 3s linear infinite;
      }
      
      @keyframes scan {
        0% { top: 0%; opacity: 0; }
        50% { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
      
      .tech-grid {
        position: absolute;
        inset: 0;
        opacity: 0.1;
        background-image: 
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
        background-size: 20px 20px;
      }
      
      .stats-header {
        color: #FF9933;
        font-size: 1rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.3em;
        margin-bottom: 40px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .status-lights {
        display: flex;
        gap: 6px;
      }
      
      .status-light {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      
      .status-light.red { background: #ef4444; animation: pulse 2s infinite; }
      .status-light.yellow { background: #eab308; }
      .status-light.green { background: #22c55e; }
      
      .main-stat {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        margin-bottom: 30px;
        position: relative;
        overflow: hidden;
      }
      
      .main-stat-label {
        font-size: 0.9rem;
        font-weight: bold;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .main-stat-value {
        font-size: 4rem;
        font-weight: 900;
        background: linear-gradient(to right, white, #ffd700, white);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
      }
      
      .sub-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      
      .sub-stat {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .sub-stat-label {
        font-size: 0.75rem;
        font-weight: bold;
        color: #9ca3af;
        text-transform: uppercase;
        margin-bottom: 12px;
        text-align: center;
        white-space: nowrap;
      }
      
      .sub-stat-value {
        font-size: 2.5rem;
        font-weight: 900;
        color: white;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      
      .sub-stat-value.green {
        color: #138808;
      }
      
      /* Rank Slide Specific Styles */
      .rank-card {
        background: linear-gradient(to bottom right, #000040, black);
        border: 2px solid #FFD700;
        border-radius: 24px;
        padding: 40px;
        box-shadow: 0 20px 60px -15px rgba(0,0,0,0.9);
        max-width: 500px;
        width: 100%;
        text-align: center;
      }
      
      .rank-crown {
        width: 96px;
        height: 96px;
        margin: 0 auto 30px;
        background: linear-gradient(to top right, #FFD700, #B8860B);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
        color: black;
      }
      
      .rank-percentage {
        font-size: 4rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: -2px;
        margin-bottom: 20px;
        color: #138808;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        line-height: 0.9;
      }
      
      .rank-sub-text {
        font-size: 1rem;
        font-weight: bold;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        margin-bottom: 15px;
      }
      
      .rank-main-text {
        font-size: 3.5rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: -1px;
        margin-bottom: 30px;
        color: #FF9933;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        line-height: 0.9;
      }
      
      .rank-title-text {
        font-size: 1.5rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        margin-bottom: 30px;
        color: white;
        border-bottom: 1px solid rgba(255,255,255,0.2);
        padding-bottom: 20px;
      }
      
      .rank-description {
        font-size: 1rem;
        color: #9ca3af;
        font-weight: 500;
        line-height: 1.6;
      }
      
      .rank-description .highlight {
        color: #FF9933;
        font-weight: bold;
      }
      
      /* Leaderboard Slide Specific Styles */
      .leaderboard-card {
        background: white;
        color: black;
        padding: 40px;
        border-radius: 4px;
        box-shadow: 10px 10px 0px #FF9933;
        border: 4px solid black;
        max-width: 500px;
        width: 100%;
        text-align: center;
        transform: rotate(1deg);
        position: relative;
      }
      
      .leaderboard-header {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        background: #000080;
        color: white;
        padding: 8px 20px;
        font-weight: bold;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        border: 2px solid white;
      }
      
      .region-text {
        font-size: 1.5rem;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 20px;
        opacity: 0.5;
        letter-spacing: 0.2em;
      }
      
      .rank-number {
        font-size: 6rem;
        font-weight: 900;
        line-height: 1;
        margin-bottom: 20px;
        letter-spacing: -3px;
        color: #001233;
      }
      
      .progress-bar {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 20px;
      }
      
      .progress-fill {
        width: 95%;
        height: 100%;
        background: linear-gradient(to right, #FF9933, white, #138808);
      }
      
      /* Badges Slide Specific Styles */
      .badges-header {
        text-align: center;
        margin-bottom: 40px;
        z-index: 20;
        position: relative;
      }
      
      .badges-title {
        color: #FFD700;
        font-size: 2.5rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        margin-bottom: 10px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      }
      
      .badges-subtitle {
        color: rgba(255,255,255,0.5);
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.3em;
        border-bottom: 1px solid rgba(255,215,0,0.3);
        padding-bottom: 10px;
        display: inline-block;
      }
      
      .id-card {
        width: 350px;
        height: 500px;
        border-radius: 12px;
        background: #0a0a0a;
        border: 1px solid #FFD700;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 20px 60px -15px rgba(0,0,0,0.9);
      }
      
      .id-header {
        width: 100%;
        height: 120px;
        background: linear-gradient(to right, #FF9933, white, #138808);
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 10px;
      }
      
      .avatar-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 3px solid #FFD700;
        background: #1a1a1a;
        margin-top: -60px;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        position: relative;
        overflow: visible;
      }
      
      .avatar-initials {
        font-size: 2.5rem;
        font-weight: 900;
        color: white;
        letter-spacing: -1px;
        position: relative;
        z-index: 10;
      }
      
      .rank-badge {
        position: absolute;
        bottom: -10px;
        right: -10px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(to bottom right, #FF9933, #FFD700);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 4px solid black;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 20;
      }
      
      .rank-icon {
        font-size: 1.2rem;
      }
      
      .card-content {
        flex: 1;
        width: 100%;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .card-rank-title {
        font-size: 1.8rem;
        font-weight: 900;
        color: white;
        text-transform: uppercase;
        line-height: 1;
        margin-bottom: 8px;
        letter-spacing: -1px;
      }
      
      .card-rank-label {
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: #FFD700;
        margin-bottom: 30px;
      }
      
      .card-stats {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-top: auto;
      }
      
      .card-stat {
        background: #121212;
        border-radius: 6px;
        padding: 15px;
        border: 1px solid rgba(255,255,255,0.05);
      }
      
      .card-stat-label {
        font-size: 0.7rem;
        color: #6b7280;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      
      .card-stat-value {
        font-size: 1.3rem;
        font-weight: 900;
        color: white;
      }
      
      /* Hall of Fame Slide Specific Styles */
      .hall-header {
        text-align: center;
        margin-bottom: 40px;
        position: relative;
        z-index: 20;
      }
      
      .hall-title {
        display: inline-block;
        background: #138808;
        color: white;
        padding: 15px 30px;
        transform: rotate(-1deg);
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 1.5rem;
        border: 2px solid #FF9933;
        box-shadow: 4px 4px 0px #000;
      }
      
      .leaderboard-container {
        width: 100%;
        max-width: 500px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        position: relative;
        z-index: 20;
      }
      
      .leaderboard-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05);
        transition: all 0.3s ease;
      }
      
      .leaderboard-row.user-row {
        background: linear-gradient(to right, rgba(26,26,26,1), black);
        color: #FFD700;
        border: 1px solid #FFD700;
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(255,215,0,0.2);
        z-index: 20;
        position: relative;
      }
      
      .row-left {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      
      .row-rank {
        font-weight: 900;
        font-size: 1.5rem;
        width: 50px;
        color: #9ca3af;
      }
      
      .user-row .row-rank {
        color: #FF9933;
      }
      
      .row-info {
        display: flex;
        flex-direction: column;
      }
      
      .row-name {
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 1rem;
      }
      
      .row-title {
        font-size: 0.7rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: rgba(255,255,255,0.4);
        margin-top: 2px;
      }
      
      .user-row .row-title {
        color: #FFD700;
      }
      
      .row-points {
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: 1rem;
      }
      
      /* Outro Slide Specific Styles */
      .outro-content {
        text-align: center;
        position: relative;
        z-index: 20;
      }
      
      .outro-title {
        font-size: 4rem;
        font-weight: 900;
        text-transform: uppercase;
        color: white;
        text-shadow: 0 4px 8px rgba(0,0,0,0.5);
        letter-spacing: -2px;
        margin-bottom: 15px;
        line-height: 0.9;
      }
      
      .outro-highlight {
        color: #FF9933;
      }
      
      .outro-subtitle {
        color: rgba(255,255,255,0.6);
        font-weight: bold;
        letter-spacing: 0.2em;
        margin-bottom: 50px;
        text-transform: uppercase;
        font-size: 1rem;
      }
      
      .outro-buttons {
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .outro-button {
        width: 100%;
        padding: 20px;
        font-weight: 900;
        text-transform: uppercase;
        border-radius: 12px;
        font-size: 1rem;
        letter-spacing: 0.05em;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      
      .outro-button.primary {
        background: #138808;
        color: white;
      }
      
      .outro-button.secondary {
        background: #FF9933;
        color: black;
      }
      
      .outro-button.tertiary {
        background: transparent;
        color: white;
        border: 2px solid rgba(255,255,255,0.3);
      }
    </style>
  `;
  
  let slideContent = '';
  
  switch (slide.type) {
    case 'intro':
      slideContent = `
        ${generatePatrioticBackground(slide.variant)}
        
        <div class="slide-container">
          <div class="intro-header">
            <div class="intro-header-text">Jai Hind</div>
          </div>

          <h1 class="main-title">
            <div class="yoddha-text">YODDHA</div>
            <div class="wrapped-text">WRAPPED</div>
          </h1>
          
          <div class="success-badge">
            Operation 2026 Successful
          </div>
        </div>
      `;
      break;
      
    case 'stats':
      slideContent = `
        ${generatePatrioticBackground(slide.variant)}
        
        <div class="slide-container">
          <div class="stats-container">
            <div class="scanning-line"></div>
            <div class="tech-grid"></div>
            
            <div class="stats-header">
              <span>Your story in numbers</span>
              <div class="status-lights">
                <div class="status-light red"></div>
                <div class="status-light yellow"></div>
                <div class="status-light green"></div>
              </div>
            </div>

            <div class="main-stat">
              <div class="main-stat-label">
                Total Points
                <span style="font-size: 20px;">⚡</span>
              </div>
              <div class="main-stat-value">
                ${data.currentPoints.toLocaleString()}
              </div>
            </div>

            <div class="sub-stats">
              <div class="sub-stat">
                <div class="sub-stat-label">Units Sold</div>
                <div class="sub-stat-value">${data.unitsSold}</div>
              </div>
              <div class="sub-stat">
                <div class="sub-stat-label">Longest Streak</div>
                <div class="sub-stat-value green">
                  ${data.longestStreak} <span style="font-size: 1.5rem;">⚡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'rank': {
      // Implement exact frontend rank logic
      const displayRank = data.rankTitle || 'Salesveer';
      let mainDisplayStr = '';
      let topSubStr = '';
      let bottomDescStr = '';
      let isPercentage = false;
      let percentageVal = 0;

      const rLower = displayRank.toLowerCase();

      if (data.currentPoints === 0) {
        mainDisplayStr = 'Better Luck next time';
        topSubStr = '';
        bottomDescStr = 'You missed the chance to win INR 5000 voucher';
      } else if (rLower.includes('chief marshal')) {
        isPercentage = true;
        percentageVal = 5;
      } else if (rLower.includes('commander')) {
        isPercentage = true;
        percentageVal = 20;
      } else if (rLower.includes('major')) {
        isPercentage = true;
        percentageVal = 35;
      } else if (rLower.includes('captain')) {
        isPercentage = true;
        percentageVal = 50;
      } else if (rLower.includes('lieutenant')) {
        topSubStr = 'You performed well!';
        mainDisplayStr = 'KEEP GOING!';
        bottomDescStr = 'Push more to rise the ranks next time.';
      } else {
        mainDisplayStr = 'GREAT START';
        topSubStr = 'Welcome to the battlefield';
        bottomDescStr = 'Push more to rise the ranks next time in Upcoming contests.';
      }

      slideContent = `
        ${generatePatrioticBackground(slide.variant)}
        
        <div class="slide-container">
          <div class="rank-card">
            <div class="rank-crown">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm2 16h16"/>
              </svg>
            </div>

            ${isPercentage ? `
              <h2 class="rank-percentage">
                TOP<br/>${percentageVal}%
              </h2>
            ` : `
              ${topSubStr ? `<div class="rank-sub-text">${topSubStr}</div>` : ''}
              <h2 class="rank-main-text">
                ${mainDisplayStr}
              </h2>
            `}

            <h1 class="rank-title-text">
              ${displayRank}
            </h1>

            <p class="rank-description">
              ${isPercentage ? 
                `You have outperformed <span class="highlight">${100 - percentageVal}%</span> of the entire sales force. Your strategic execution was exemplary.` :
                bottomDescStr
              }
            </p>
          </div>
        </div>
      `;
      break;
    }

    case 'leaderboard':
      slideContent = `
        ${generatePatrioticBackground(slide.variant)}
        
        <div class="slide-container">
          <div class="leaderboard-card">
            <div class="leaderboard-header">Battalion Rank</div>
            <div class="region-text">${data.regionData?.region || 'North'} Region</div>
            <div class="rank-number">
              ${typeof data.regionData?.rank === 'number' ? `#${data.regionData.rank}` : '#NA'}
            </div>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
          </div>
        </div>
      `;
      break;

    case 'badges': {
      // Implement badges slide with ID card style
      const currentRank = data.rankTitle || 'Salesveer';
      const rankConfig: Record<string, { gradient: string; icon: string; label: string }> = {
        'Salesveer': { gradient: 'from-slate-600 to-slate-800', icon: '🎯', label: 'Starter' },
        'Sales Lieutenant': { gradient: 'from-orange-600 to-orange-800', icon: '🏅', label: 'Bronze' },
        'Sales Captain': { gradient: 'from-gray-400 to-gray-600', icon: '🛡️', label: 'Silver' },
        'Sales Major': { gradient: 'from-yellow-500 to-yellow-700', icon: '👑', label: 'Gold' },
        'Sales Commander': { gradient: 'from-blue-600 to-blue-800', icon: '⚡', label: 'Platinum' },
        'Sales Chief Marshal': { gradient: 'from-red-800 to-black', icon: '⭐', label: 'Crimson' },
        'Sales General': { gradient: 'from-purple-500 to-cyan-500', icon: '✨', label: 'Master' }
      };
      
      const currentRankConfig = rankConfig[currentRank] || rankConfig['Salesveer'];
      
      slideContent = `
        ${generatePatrioticBackground(slide.variant)}
        
        <div class="slide-container">
          <div class="badges-header">
            <h2 class="badges-title">My Rank</h2>
            <p class="badges-subtitle">Official Identification</p>
          </div>

          <div class="id-card">
            <!-- Tricolor Header -->
            <div class="id-header"></div>
            
            <!-- Avatar Circle -->
            <div class="avatar-circle">
              <div class="avatar-initials">
                ${(data.userName || 'User').split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div class="rank-badge">
                <span class="rank-icon">${currentRankConfig.icon}</span>
              </div>
            </div>

            <!-- Card Content -->
            <div class="card-content">
              <h1 class="card-rank-title">${currentRank}</h1>
              <div class="card-rank-label">${currentRankConfig.label} Tier</div>

              <!-- Stats Grid -->
              <div class="card-stats">
                <div class="card-stat">
                  <div class="card-stat-label">Points</div>
                  <div class="card-stat-value">
                    ${data.currentPoints >= 1000 ? (data.currentPoints / 1000).toFixed(1) + 'k' : data.currentPoints}
                  </div>
                </div>
                <div class="card-stat">
                  <div class="card-stat-label">Rank</div>
                  <div class="card-stat-value">#${data.globalRank || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
    }

    case 'hall-of-fame': {
      // Create hall of fame data similar to frontend
      const hallOfFameData = data.hallOfFameData && data.hallOfFameData.length > 0 ? data.hallOfFameData : [
        { rank: 1, name: "Vikram Malhotra", points: "12.8k" },
        { rank: 2, name: "Aditi Sharma", points: "12.6k" },
        { rank: 3, name: data.userName || "User", points: "12.5k", isUser: true },
        { rank: 4, name: "Rohan Gupta", points: "12.2k" },
        { rank: 5, name: "Sneha Patel", points: "11.9k" },
      ];

      const leaderboardRows = hallOfFameData.map(peer => `
        <div class="leaderboard-row ${peer.isUser ? 'user-row' : ''}">
          <div class="row-left">
            <div class="row-rank">#${peer.rank}</div>
            <div class="row-info">
              <div class="row-name">${peer.name}</div>
              ${peer.rankTitle ? `<div class="row-title">${peer.rankTitle}</div>` : ''}
            </div>
          </div>
          <div class="row-points">${peer.points}</div>
        </div>
      `).join('');

      slideContent = `
        ${generatePatrioticBackground(slide.variant)}
        
        <div class="slide-container">
          <div class="hall-header">
            <div class="hall-title">Hall of Fame</div>
          </div>

          <div class="leaderboard-container">
            ${leaderboardRows}
          </div>
        </div>
      `;
      break;
    }

    case 'outro':
      slideContent = `
        ${generatePatrioticBackground(slide.variant)}
        
        <div class="slide-container">
          <div class="outro-content">
            <h1 class="outro-title">
              Mission<br/>
              <span class="outro-highlight">Completed</span>
            </h1>
            <p class="outro-subtitle">See You In Next Contest</p>
            
            <div class="outro-buttons">
              <div class="outro-button primary">
                Share your achievement 📤
              </div>
              <div class="outro-button secondary">
                Share Stats (Text) 📤
              </div>
              <div class="outro-button tertiary">
                Replay Briefing
              </div>
            </div>
          </div>
        </div>
      `;
      break;

    default:
      slideContent = `
        ${generatePatrioticBackground(slide.variant || 'default')}
        <div class="slide-container">
          <h1 style="font-size: 4rem; font-weight: bold; margin-bottom: 2rem; background: linear-gradient(45deg, #FF9933, #FFFFFF, #138808); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            ${slide.type.toUpperCase()}
          </h1>
          <p style="font-size: 1.5rem; opacity: 0.8;">Coming Soon...</p>
        </div>
      `;
      break;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Yoddha Winnings - ${slide.type}</title>
      ${baseStyles}
    </head>
    <body>
      ${slideContent}
    </body>
    </html>
  `;
}