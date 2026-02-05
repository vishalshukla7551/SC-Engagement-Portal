import puppeteer from 'puppeteer-core';

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
    // Development: Use standard Puppeteer with system Chrome
    console.log('🔧 Using system Chrome for development');
    return puppeteer.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS path
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ],
      timeout: 60000
    });
  }
  
  // Production: Try @sparticuz/chromium with enhanced configuration
  console.log('🔧 Configuring for production serverless environment...');
  
  try {
    const chromiumModule = await getChromium();
    
    if (!chromiumModule) {
      throw new Error('@sparticuz/chromium module not available');
    }
    
    console.log('🚀 Using @sparticuz/chromium for serverless environment');
    
    // Configure fonts if available (but don't fail if it doesn't work)
    try {
      if (chromiumModule.font) {
        await chromiumModule.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
        console.log('✅ Font configured successfully');
      }
    } catch (fontError) {
      console.warn('⚠️ Font configuration failed, continuing without fonts:', fontError instanceof Error ? fontError.message : fontError);
    }
    
    // Get executable path with better error handling
    let executablePath: string;
    try {
      executablePath = await chromiumModule.executablePath();
      console.log(`✅ Chromium executable found: ${executablePath}`);
    } catch (pathError) {
      console.error('❌ Failed to get chromium executable path:', pathError);
      throw new Error(`Chromium executable path error: ${pathError instanceof Error ? pathError.message : pathError}`);
    }
    
    // Launch browser with comprehensive configuration
    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        // Base chromium args
        ...(chromiumModule.args || []),
        // Essential serverless args
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        // Performance optimizations
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript',
        // Timeout and resource management
        '--virtual-time-budget=5000',
        '--run-all-compositor-stages-before-draw',
        '--disable-background-networking',
        '--disable-client-side-phishing-detection',
        '--disable-component-extensions-with-background-pages',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--safebrowsing-disable-auto-update',
        '--enable-automation',
        '--password-store=basic',
        '--use-mock-keychain',
        // Memory optimizations
        '--memory-pressure-off',
        '--max_old_space_size=4096'
      ],
      timeout: 60000,
      defaultViewport: { width: 720, height: 1280 },
      // Additional options for stability
      ignoreDefaultArgs: ['--disable-extensions']
    });
    
    const version = await browser.version();
    console.log(`✅ Chromium browser launched successfully: ${version}`);
    return browser;
    
  } catch (chromiumError) {
    console.error('❌ @sparticuz/chromium failed:', chromiumError);
    
    // Enhanced error logging
    console.error('🔍 Chromium error details:', {
      message: chromiumError instanceof Error ? chromiumError.message : chromiumError,
      stack: chromiumError instanceof Error ? chromiumError.stack : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL,
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        cwd: process.cwd()
      }
    });
    
    // Try fallback approaches for production
    console.log('🔄 Attempting fallback approaches...');
    
    // Fallback 1: Try puppeteer-core without executable path (let it find Chrome)
    try {
      console.log('🔄 Fallback 1: Trying puppeteer-core auto-detection');
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
      console.log(`✅ Fallback 1 successful: ${version}`);
      return browser;
    } catch (fallback1Error) {
      console.error('❌ Fallback 1 failed:', fallback1Error instanceof Error ? fallback1Error.message : fallback1Error);
    }
    
    // Fallback 2: Try with different Chrome paths
    const chromePaths = [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/opt/google/chrome/chrome'
    ];
    
    for (const chromePath of chromePaths) {
      try {
        console.log(`🔄 Fallback 2: Trying Chrome at ${chromePath}`);
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: chromePath,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security'
          ],
          timeout: 30000, // Shorter timeout for fallbacks
          defaultViewport: { width: 720, height: 1280 }
        });
        
        const version = await browser.version();
        console.log(`✅ Fallback 2 successful with ${chromePath}: ${version}`);
        return browser;
      } catch (fallback2Error) {
        console.error(`❌ Chrome at ${chromePath} failed:`, fallback2Error instanceof Error ? fallback2Error.message : fallback2Error);
      }
    }
    
    // All attempts failed
    const errorMessage = `All Chrome launch attempts failed. Original error: ${chromiumError instanceof Error ? chromiumError.message : chromiumError}`;
    console.error('❌ Complete failure:', errorMessage);
    throw new Error(errorMessage);
  }
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