import puppeteer from 'puppeteer';

// Dynamic import for chromium to handle potential issues
let chromium: any = null;

async function getChromium() {
  if (!chromium) {
    try {
      chromium = await import('@sparticuz/chromium');
      return chromium.default || chromium;
    } catch (error) {
      console.error('Failed to import @sparticuz/chromium:', error);
      return null;
    }
  }
  return chromium;
}

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
  
  if (!isProduction) {
    // Development: Use standard Puppeteer
    console.log('🔧 Using standard Puppeteer for development');
    return puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ],
      timeout: 60000
    });
  }
  
  // Production: Try serverless Chrome with fallbacks
  console.log('🔧 Configuring for production environment...');
  
  // First attempt: Use @sparticuz/chromium
  try {
    const chromiumModule = await getChromium();
    
    if (chromiumModule) {
      console.log('🚀 Attempting to use @sparticuz/chromium...');
      
      // Configure fonts if available
      try {
        if (chromiumModule.font) {
          await chromiumModule.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
        }
      } catch (fontError) {
        console.warn('⚠️ Font configuration failed, continuing without fonts:', fontError);
      }
      
      const executablePath = await chromiumModule.executablePath();
      console.log(`✅ Chromium executable found: ${executablePath}`);
      
      const browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args: [
          ...(chromiumModule.args || []),
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-default-apps',
          '--disable-extensions',
          '--virtual-time-budget=5000',
          '--run-all-compositor-stages-before-draw'
        ],
        timeout: 60000,
        defaultViewport: { width: 720, height: 1280 }
      });
      
      const version = await browser.version();
      console.log(`✅ Chromium browser launched successfully: ${version}`);
      return browser;
    }
  } catch (chromiumError) {
    console.error('❌ @sparticuz/chromium failed:', chromiumError);
  }
  
  // Second attempt: Try system Chrome
  console.log('🔄 Attempting fallback to system Chrome...');
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome-stable',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-default-apps',
        '--disable-extensions'
      ],
      timeout: 60000,
      defaultViewport: { width: 720, height: 1280 }
    });
    
    const version = await browser.version();
    console.log(`✅ System Chrome launched successfully: ${version}`);
    return browser;
  } catch (systemChromeError) {
    console.error('❌ System Chrome failed:', systemChromeError);
  }
  
  // Third attempt: Try Puppeteer's bundled Chrome
  console.log('🔄 Attempting fallback to Puppeteer bundled Chrome...');
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security'
      ],
      timeout: 60000,
      defaultViewport: { width: 720, height: 1280 }
    });
    
    const version = await browser.version();
    console.log(`✅ Puppeteer bundled Chrome launched successfully: ${version}`);
    return browser;
  } catch (bundledChromeError) {
    console.error('❌ Puppeteer bundled Chrome failed:', bundledChromeError);
  }
  
  // All attempts failed
  const errorMessage = 'All Chrome launch attempts failed. Video generation is not available in this environment.';
  console.error('❌', errorMessage);
  throw new Error(errorMessage);
}

/**
 * Utility function to check if Chrome is available
 */
export async function checkChromeAvailability(): Promise<{ available: boolean; version?: string; error?: string; method?: string }> {
  try {
    const browser = await createBrowser();
    const version = await browser.version();
    await browser.close();
    
    return {
      available: true,
      version,
      method: 'createBrowser'
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'createBrowser'
    };
  }
}