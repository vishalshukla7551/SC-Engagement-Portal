# Server-side Video Template Matching - Requirements

## Overview
Fix the server-side video generation system to exactly match the frontend React components, generate videos in 9:16 vertical format, and include audio synchronization.

## Problem Statement
The current server-side video generation has several issues:
1. **Template Mismatch**: Server-side slide definitions don't match frontend slide types and structure
2. **Missing Slides**: 2-3 slides are not matching between server and frontend versions
3. **Wrong Aspect Ratio**: Videos are generated in landscape format instead of 9:16 vertical
4. **No Audio**: Generated videos don't include the background music/song

## User Stories

### US1: Exact Template Matching
**As a** user generating a video on mobile
**I want** the server-side generated video to look exactly like the frontend version
**So that** I get consistent visual experience regardless of generation method

**Acceptance Criteria:**
- All slide types match exactly: `intro`, `stats`, `highlight`, `rank`, `leaderboard`, `badges`, `hall-of-fame`, `outro`
- PatrioticBackground variants are replicated: `default`, `radar`, `spotlight`, `regal`, `rising`, `cobra`, `battalion`, `honor`, `elite`, `laser`
- Slide data structure and content match frontend exactly
- Visual styling, colors, fonts, and layouts are identical
- Animations and transitions are represented appropriately for video format

### US2: Vertical Video Format
**As a** mobile user sharing on social media
**I want** videos generated in 9:16 vertical format
**So that** they display properly on mobile platforms like Instagram Stories, TikTok, etc.

**Acceptance Criteria:**
- Video dimensions are 9:16 aspect ratio (e.g., 1080x1920 or 720x1280)
- All slide layouts are optimized for vertical format
- Text and elements are properly positioned for mobile viewing
- No content is cut off or improperly scaled

### US3: Audio Integration
**As a** user generating a video
**I want** the background music/song included in the generated video
**So that** the video has the same audio experience as the frontend

**Acceptance Criteria:**
- Background music from `/audio track/iam attaching lyrics for the song, the t.mp3` is included
- Audio is properly synchronized with video duration
- Audio quality is maintained during encoding
- Audio loops or fades appropriately for video length

### US4: Slide Structure Alignment
**As a** developer maintaining the system
**I want** server-side slide definitions to match frontend slide array exactly
**So that** there's no confusion about which slides are missing or different

**Acceptance Criteria:**
- Server-side slide array matches frontend `slides` array structure
- Each slide type has corresponding HTML template
- Slide durations match frontend timing
- Data passed to each slide template matches frontend props

## Technical Requirements

### TR1: Slide Type Mapping
- Map all frontend slide types to server-side templates:
  - `intro` → Patriotic intro with Yoddha Wrapped text
  - `stats` → Radar-style stats display with animated numbers
  - `highlight` → Elite spotlight effect for top performers
  - `rank` → Rank display with percentage or achievement text
  - `leaderboard` → Battalion-style regional ranking
  - `badges` → ID card style rank badge display
  - `hall-of-fame` → Global leaderboard with spotlight
  - `outro` → Mission completed with share buttons

### TR2: PatrioticBackground Variants
- Implement all background variants used in frontend:
  - `default`: Tricolor gradients with Ashoka Chakra
  - `radar`: Grid lines with radar sweep animation
  - `spotlight`: Dramatic lighting with moving beams
  - `regal`: Gold vignette with tricolor patterns
  - `rising`: Rising particles effect
  - `cobra`: Hexagonal tech pattern with glitch effects
  - `battalion`: Topographic lines with crosshairs
  - `honor`: Flowing tricolor bands
  - `elite`: Laser beams with explosive burst
  - `laser`: Vertical laser beams with particles

### TR3: Vertical Format Optimization
- Change video dimensions from 1280x720 to 720x1280 (9:16)
- Adjust all CSS layouts for vertical orientation
- Ensure text scaling works for mobile screens
- Optimize element positioning for vertical viewing

### TR4: Audio Processing
- Load and decode the MP3 audio file
- Synchronize audio with video duration
- Handle audio encoding with AAC codec
- Ensure audio quality and proper mixing

## Data Requirements

### DR1: Slide Data Structure
Server-side must accept and use the same data structure as frontend:
```typescript
interface VideoGenerationData {
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
```

### DR2: Slide Configuration
Match frontend slide configuration exactly:
```typescript
const slides = [
  { type: 'intro', themeId: 'patriotic', duration: 4000 },
  { type: 'stats', themeId: 'patriotic', duration: 6000 },
  { type: 'rank', themeId: 'patriotic', duration: 6000 },
  { type: 'leaderboard', themeId: 'patriotic', duration: 5000 },
  { type: 'badges', themeId: 'patriotic', duration: 6000 },
  { type: 'hall-of-fame', themeId: 'patriotic', duration: 5000 },
  { type: 'outro', themeId: 'patriotic', duration: 8000 },
];
```

## Performance Requirements

### PR1: Generation Speed
- Video generation should complete within 2 minutes for typical content
- Progress updates should be provided every 5-10% completion
- Memory usage should be optimized for server environment

### PR2: Quality Standards
- Video quality should be suitable for social media sharing
- Audio quality should be clear and properly mixed
- File size should be optimized for mobile sharing

## Constraints

### C1: Browser Compatibility
- Server-side generation must work independently of browser capabilities
- Should handle cases where client-side generation fails due to colorSpace issues

### C2: Resource Limitations
- Must work within server memory and processing constraints
- Should handle concurrent video generation requests

### C3: File Format Support
- Output must be MP4 format for maximum compatibility
- Audio must be AAC encoded for broad device support

## Success Criteria
1. All frontend slide types are accurately represented in server-side generation
2. Videos are generated in 9:16 vertical format suitable for mobile sharing
3. Background music is properly integrated and synchronized
4. Visual quality matches frontend experience
5. No missing or mismatched slides between frontend and server versions
6. Generation completes reliably within acceptable time limits