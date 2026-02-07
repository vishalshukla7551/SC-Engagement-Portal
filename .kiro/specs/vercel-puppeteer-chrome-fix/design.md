# Vercel Puppeteer Chrome Fix - Design

## Architecture Overview

The solution involves configuring Puppeteer to use a serverless-optimized Chrome binary in production while maintaining local development compatibility.

## Solution Components

### 1. Serverless Chrome Binary
- **Package**: `@sparticuz/chromium`
- **Purpose**: Provides pre-built Chrome binary optimized for serverless environments
- **Benefits**: Smaller size, faster cold starts, AWS Lambda/Vercel compatible

### 2. Environment Detection
- **Local Development**: Use system Chrome or Puppeteer's bundled Chrome
- **Production**: Use @sparticuz/chromium binary
- **Detection**: Check `process.env.NODE_ENV` and `process.env.VERCEL`

### 3. Puppeteer Configuration
- **Dynamic Executable Path**: Set based on environment
- **Optimized Args**: Use serverless-friendly Chrome arguments
- **Memory Management**: Configure for Vercel's constraints

## Implementation Strategy

### Phase 1: Package Installation
```bash
npm install @sparticuz/chromium
```

### Phase 2: Puppeteer Configuration Update
```typescript
import chromium from '@sparticuz/chromium';

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

const puppeteerConfig = {
  headless: true,
  args: isProduction ? [
    ...chromium.args,
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--single-process'
  ] : [
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ],
  executablePath: isProduction 
    ? await chromium.executablePath()
    : undefined
};
```

### Phase 3: Error Handling
- Graceful fallback if Chrome initialization fails
- Detailed error logging for debugging
- User-friendly error messages

## Technical Design

### File Structure
```
src/app/api/generate-yoddha-video/
├── route.ts (main API endpoint)
├── puppeteer-config.ts (new: Chrome configuration)
└── progress/
    └── route.ts (progress tracking)
```

### Chrome Configuration Module
```typescript
// src/app/api/generate-yoddha-video/puppeteer-config.ts
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer';

export async function createBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const config = {
    headless: true,
    args: isProduction ? [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--single-process',
      '--disable-default-apps',
      '--disable-extensions'
    ] : [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    timeout: 60000,
    executablePath: isProduction 
      ? await chromium.executablePath()
      : undefined
  };

  return puppeteer.launch(config);
}
```

### Updated Video Generation Function
```typescript
// In route.ts
import { createBrowser } from './puppeteer-config';

async function generateVideo(data, progressCallback) {
  let browser = null;
  
  try {
    progressCallback?.(15, 'Launching browser...');
    browser = await createBrowser();
    
    // Rest of the video generation logic...
  } catch (error) {
    console.error('Browser launch failed:', error);
    throw new Error(`Video generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
```

## Environment Configuration

### Development Environment
- Uses system Chrome or Puppeteer's bundled Chrome
- Standard Chrome arguments
- Full debugging capabilities

### Production Environment (Vercel)
- Uses @sparticuz/chromium binary
- Serverless-optimized arguments
- Memory and timeout constraints
- Single-process mode for stability

## Performance Considerations

### Memory Optimization
- Single-process Chrome mode
- Disabled unnecessary features
- Efficient frame generation
- Proper cleanup of resources

### Timeout Management
- Browser launch timeout: 60 seconds
- Overall video generation timeout: 10 minutes
- FFmpeg encoding timeout: 5 minutes
- Vercel function timeout: Consider upgrading if needed

### Cold Start Optimization
- Chrome binary is cached by Vercel
- Minimal initialization overhead
- Efficient resource allocation

## Error Handling Strategy

### Chrome Launch Failures
```typescript
try {
  browser = await createBrowser();
} catch (error) {
  console.error('Chrome launch failed:', error);
  return NextResponse.json({
    success: false,
    error: 'Video generation service unavailable',
    details: 'Chrome initialization failed in serverless environment'
  }, { status: 503 });
}
```

### Memory/Timeout Issues
- Detect memory pressure
- Implement graceful degradation
- Provide meaningful error messages
- Log detailed information for debugging

## Deployment Considerations

### Vercel Configuration
- Ensure sufficient memory allocation
- Configure appropriate timeout limits
- Monitor function performance
- Set up error tracking

### Package Dependencies
- Add @sparticuz/chromium to dependencies
- Ensure proper version compatibility
- Update package-lock.json
- Test deployment process

## Testing Strategy

### Local Testing
- Test with both development and production configurations
- Verify Chrome detection logic
- Test error handling scenarios

### Production Testing
- Deploy to staging environment first
- Test video generation end-to-end
- Monitor performance metrics
- Verify error handling in production

## Monitoring and Debugging

### Logging Strategy
- Log Chrome version and path
- Track memory usage
- Monitor generation times
- Log error details

### Performance Metrics
- Video generation success rate
- Average generation time
- Memory usage patterns
- Error frequency and types