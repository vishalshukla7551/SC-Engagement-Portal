# Server-side Video Template Matching - Design Document

## Architecture Overview

The server-side video generation system will be redesigned to exactly replicate the frontend React components using server-side HTML/CSS templates with Puppeteer rendering.

## Component Architecture

### 1. Slide Template System

#### 1.1 Slide Type Mapping
```typescript
// Updated slide definitions to match frontend exactly
const SLIDES = [
  { type: 'intro', duration: 4000, variant: 'default' },
  { type: 'stats', duration: 6000, variant: 'radar' },
  { type: 'rank', duration: 6000, variant: 'laser' },
  { type: 'leaderboard', duration: 5000, variant: 'battalion' },
  { type: 'badges', duration: 6000, variant: 'regal' },
  { type: 'hall-of-fame', duration: 5000, variant: 'spotlight' },
  { type: 'outro', duration: 8000, variant: 'cobra' }
];
```

#### 1.2 Template Generator Functions
Each slide type will have a dedicated template generator that matches the frontend `SlideRenderer` component:

```typescript
interface SlideTemplateProps {
  slide: SlideConfig;
  data: VideoGenerationData;
  isVertical: boolean;
}

// Template generators for each slide type
const slideTemplates = {
  intro: generateIntroTemplate,
  stats: generateStatsTemplate,
  rank: generateRankTemplate,
  leaderboard: generateLeaderboardTemplate,
  badges: generateBadgesTemplate,
  'hall-of-fame': generateHallOfFameTemplate,
  outro: generateOutroTemplate
};
```

### 2. PatrioticBackground System

#### 2.1 Background Variant Implementation
Each PatrioticBackground variant will be implemented as CSS/SVG:

```typescript
const backgroundVariants = {
  default: generateDefaultBackground,
  radar: generateRadarBackground,
  spotlight: generateSpotlightBackground,
  regal: generateRegalBackground,
  rising: generateRisingBackground,
  cobra: generateCobraBackground,
  battalion: generateBattalionBackground,
  honor: generateHonorBackground,
  elite: generateEliteBackground,
  laser: generateLaserBackground
};
```

#### 2.2 CSS Animation Equivalents
Frontend Framer Motion animations will be converted to CSS animations:
- `animate-spin-slow` → CSS keyframe animations
- Gradient movements → CSS transform animations
- Particle effects → CSS pseudo-elements with animations

### 3. Vertical Format Optimization

#### 3.1 Viewport Configuration
```typescript
// Updated viewport for 9:16 aspect ratio
const VIEWPORT_CONFIG = {
  width: 720,   // 720px width
  height: 1280, // 1280px height (9:16 ratio)
  deviceScaleFactor: 2 // High DPI for quality
};
```

#### 3.2 Layout Adjustments
All templates will be optimized for vertical layout:
- Font sizes adjusted for mobile viewing
- Element positioning optimized for 9:16 format
- Responsive breakpoints for vertical orientation

### 4. Audio Integration System

#### 4.1 Audio Processing Pipeline
```typescript
interface AudioProcessor {
  loadAudioFile(path: string): Promise<AudioBuffer>;
  synchronizeWithVideo(audioDuration: number, videoDuration: number): AudioBuffer;
  encodeToAAC(audioBuffer: AudioBuffer): Promise<EncodedAudioChunk[]>;
}
```

#### 4.2 Audio-Video Synchronization
- Load MP3 file and decode to AudioBuffer
- Calculate video duration from slide timings
- Loop or trim audio to match video duration
- Encode audio chunks synchronized with video frames

## Detailed Component Design

### 5. Slide Template Implementations

#### 5.1 Intro Slide Template
Matches frontend intro slide with:
- Saffron "Jai Hind" header
- "YODDHA WRAPPED" text with gradient and skew effects
- "Operation 2026 Successful" badge
- PatrioticBackground with tricolor gradients and Ashoka Chakra

```html
<!-- Intro slide HTML structure -->
<div class="slide-container intro-slide">
  <div class="patriotic-bg default-variant">
    <!-- Tricolor gradients and Ashoka Chakra -->
  </div>
  <div class="content-layer">
    <div class="saffron-header">Jai Hind</div>
    <h1 class="main-title">
      <div class="yoddha-text">YODDHA</div>
      <div class="wrapped-text">WRAPPED</div>
    </h1>
    <div class="success-badge">Operation 2026 Successful</div>
  </div>
</div>
```

#### 5.2 Stats Slide Template
Matches frontend stats slide with:
- Radar background with grid lines and sweep animation
- Tech-style container with scanning line
- Animated numbers for points, units sold, longest streak
- Status lights and tech grid overlay

#### 5.3 Rank Slide Template
Matches frontend rank slide with:
- Laser background with vertical beams
- Rank logic for percentage display vs. achievement text
- Crown icon and gradient backgrounds
- Proper rank title and description text

#### 5.4 Badges Slide Template
Matches frontend badges slide with:
- ID card style layout with tricolor header
- Avatar circle with user initials
- Rank icon badge overlay
- Stats grid and holographic texture

#### 5.5 Hall of Fame Slide Template
Matches frontend hall-of-fame slide with:
- Spotlight background with moving beams
- Leaderboard list with user highlighting
- Proper rank formatting and points display

### 6. CSS Framework

#### 6.1 Base Styles
```css
/* Vertical format base styles */
.slide-container {
  width: 720px;
  height: 1280px;
  font-family: 'Inter', sans-serif;
  background: #001233;
  color: white;
  overflow: hidden;
  position: relative;
}

/* Patriotic color scheme */
:root {
  --saffron: #FF9933;
  --white: #FFFFFF;
  --green: #138808;
  --navy: #001233;
  --gold: #FFD700;
}
```

#### 6.2 Animation System
```css
/* CSS animations to replace Framer Motion */
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes radar-sweep {
  0% { transform: rotate(0deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: rotate(360deg); opacity: 0; }
}

@keyframes laser-beam {
  0% { height: 0%; opacity: 0; }
  50% { opacity: 0.4; }
  100% { height: 120%; opacity: 0; }
}
```

### 7. Data Processing Layer

#### 7.1 Data Transformation
```typescript
interface DataProcessor {
  transformUserData(data: VideoGenerationData): ProcessedSlideData;
  calculateRankLogic(rankTitle: string, points: number): RankDisplayData;
  formatLeaderboardData(data: any[]): FormattedLeaderboard;
  processHallOfFameData(data: any[], userName: string): HallOfFameDisplay;
}
```

#### 7.2 Rank Logic Implementation
Exact replication of frontend rank logic:
```typescript
function calculateRankDisplay(rankTitle: string, points: number) {
  const rLower = rankTitle.toLowerCase();
  
  if (points === 0) {
    return {
      mainText: 'Better Luck next time',
      subText: 'You missed the chance to win INR 5000 voucher',
      isPercentage: false
    };
  }
  
  if (rLower.includes('chief marshal')) {
    return { isPercentage: true, percentageVal: 5 };
  }
  
  // ... rest of rank logic matching frontend exactly
}
```

## Technical Implementation

### 8. Video Generation Pipeline

#### 8.1 Enhanced Generation Flow
```typescript
async function generateVideo(data: VideoGenerationData): Promise<Buffer> {
  // 1. Initialize Puppeteer with vertical viewport
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT_CONFIG);
  
  // 2. Load and process audio
  const audioBuffer = await loadAudioFile('/audio track/iam attaching lyrics for the song, the t.mp3');
  
  // 3. Generate frames for each slide
  const frames = [];
  for (const slide of SLIDES) {
    const slideFrames = await generateSlideFrames(page, slide, data);
    frames.push(...slideFrames);
  }
  
  // 4. Encode video with audio
  const videoBuffer = await encodeVideoWithAudio(frames, audioBuffer);
  
  return videoBuffer;
}
```

#### 8.2 Frame Generation Process
```typescript
async function generateSlideFrames(page: Page, slide: SlideConfig, data: VideoGenerationData) {
  // Generate HTML for slide
  const html = generateSlideHTML(slide, data);
  
  // Set content and wait for fonts/animations
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.waitForTimeout(500); // Allow fonts to load
  
  // Calculate frames needed
  const fps = 30;
  const framesNeeded = Math.ceil((slide.duration / 1000) * fps);
  
  // Capture frames with Ken Burns effect
  const frames = [];
  for (let i = 0; i < framesNeeded; i++) {
    const frame = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 720, height: 1280 }
    });
    frames.push(frame);
  }
  
  return frames;
}
```

### 9. Audio Processing Implementation

#### 9.1 Audio Loading and Decoding
```typescript
async function loadAudioFile(audioPath: string): Promise<AudioBuffer> {
  const audioData = await fs.readFile(audioPath);
  const audioContext = new AudioContext();
  return await audioContext.decodeAudioData(audioData.buffer);
}
```

#### 9.2 Audio-Video Synchronization
```typescript
async function synchronizeAudio(audioBuffer: AudioBuffer, videoDurationMs: number): Promise<Float32Array[]> {
  const videoDurationSec = videoDurationMs / 1000;
  const audioChannels = [];
  
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const targetLength = Math.floor(videoDurationSec * audioBuffer.sampleRate);
    
    // Loop or trim audio to match video duration
    const syncedChannel = new Float32Array(targetLength);
    for (let i = 0; i < targetLength; i++) {
      syncedChannel[i] = channelData[i % channelData.length];
    }
    
    audioChannels.push(syncedChannel);
  }
  
  return audioChannels;
}
```

## Quality Assurance

### 10. Template Validation

#### 10.1 Visual Comparison System
```typescript
interface TemplateValidator {
  compareWithFrontend(slideType: string, data: VideoGenerationData): ValidationResult;
  validateLayout(html: string): LayoutValidation;
  checkColorAccuracy(template: string): ColorValidation;
}
```

#### 10.2 Automated Testing
- Screenshot comparison between frontend and server-side renders
- Color palette validation
- Layout measurement verification
- Animation timing validation

### 11. Performance Optimization

#### 11.1 Memory Management
- Efficient frame buffering
- Garbage collection between slides
- Resource cleanup after generation

#### 11.2 Concurrent Generation
- Queue system for multiple requests
- Resource pooling for Puppeteer instances
- Progress tracking per job

## Error Handling

### 12. Fallback Strategies

#### 12.1 Generation Failures
- Graceful degradation to image sequence
- Retry mechanisms for transient failures
- Detailed error logging and reporting

#### 12.2 Audio Processing Failures
- Continue video generation without audio if audio fails
- Fallback to silent video with notification
- Audio format validation and conversion

## Deployment Considerations

### 13. Server Requirements

#### 13.1 Dependencies
- Puppeteer with Chrome/Chromium
- FFmpeg for video encoding
- Audio processing libraries
- Font files for consistent rendering

#### 13.2 Resource Allocation
- Memory requirements for video processing
- CPU allocation for encoding
- Storage for temporary files
- Network bandwidth for file delivery

This design ensures exact template matching with the frontend while optimizing for vertical format and audio integration.