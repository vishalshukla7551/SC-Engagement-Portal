import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer';

/**
 * Creates a Puppeteer browser instance optimized for the current environment
 * - Development: Uses system Chrome or Puppeteer's bundled Chrome
 * - Production (Vercel): Uses @sparticuz/chromium for serverless compatibility
 */
export async function createBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  console.log(`🌍 Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`🚀 Vercel: ${isVercel ? 'yes' : 'no'}`);
  
  try {
    let executablePath: string | undefined;
    
    if (isProduction) {
      // Use serverless-optimized Chrome in production
      executablePath = await chromium.executablePath();
      console.log(`🔧 Using serverless Chrome: ${executablePath}`);
    } else {
      // Use system Chrome or Puppeteer's bundled Chrome in development
      console.log('🔧 Using system/bundled Chrome');
    }
    
    const config = {
      headless: true,
      args: isProduction ? [
        // Serverless-optimized arguments from @sparticuz/chromium
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
        '--single-process', // Important for serverless
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--disable-plugins',
        '--disable-images', // Optimize for video generation
        '--disable-javascript', // We don't need JS for static HTML
      ] : [
        // Development arguments - more permissive
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ],
      timeout: 60000, // 60 second timeout for browser launch
      executablePath,
      // Additional options for serverless
      ...(isProduction && {
        ignoreDefaultArgs: ['--disable-extensions'],
        defaultViewport: { width: 720, height: 1280 }, // 9:16 format
      })
    };
    
    console.log('🚀 Launching browser with config:', {
      headless: config.headless,
      argsCount: config.args.length,
      timeout: config.timeout,
      hasExecutablePath: !!config.executablePath
    });
    
    const browser = await puppeteer.launch(config);
    
    // Verify browser is working
    const version = await browser.version();
    console.log(`✅ Browser launched successfully: ${version}`);
    
    return browser;
    
  } catch (error) {
    console.error('❌ Browser launch failed:', error);
    
    // Provide detailed error information for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      isProduction,
      isVercel,
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      arch: process.arch,
      chromiumPath: isProduction ? 'attempting serverless chrome' : 'system chrome'
    };
    
    console.error('🔍 Error details:', errorDetails);
    
    // Re-throw with more context
    throw new Error(`Chrome initialization failed: ${errorDetails.message}`);
  }
}

/**
 * Utility function to check if Chrome is available
 */
export async function checkChromeAvailability(): Promise<{ available: boolean; version?: string; error?: string }> {
  try {
    const browser = await createBrowser();
    const version = await browser.version();
    await browser.close();
    
    return {
      available: true,
      version
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}