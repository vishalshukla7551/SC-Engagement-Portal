// Test optimized server-side video generation

async function testOptimizedVideoGeneration() {
  console.log('🚀 Testing Optimized Server-side Video Generation...');
  
  try {
    // Simple test data
    const testData = {
      userName: "Test User",
      currentPoints: 25000,
      unitsSold: 50,
      longestStreak: 5,
      regionData: {
        region: "Test Region",
        rank: 5,
        topPercent: 15
      },
      rankTitle: "Sales Captain",
      globalRank: 25,
      globalStats: {
        rank: 25,
        total: 500,
        percent: 5
      },
      async: true
    };

    console.log('📊 Starting optimized video generation...');
    console.log('⏱️ Expected duration: ~26 seconds (reduced from 40 seconds)');

    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/generate-yoddha-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('🎯 Server Response:', result);

    if (result.success && result.jobId) {
      console.log(`✅ Video generation started with job ID: ${result.jobId}`);
      console.log('📈 Tracking progress (5 minute timeout)...');
      
      let completed = false;
      let attempts = 0;
      const maxAttempts = 300; // 5 minutes
      let lastProgress = 0;

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;

        try {
          const progressResponse = await fetch(`http://localhost:3000/api/generate-yoddha-video?jobId=${result.jobId}`);
          
          if (progressResponse.ok) {
            const contentType = progressResponse.headers.get('content-type');
            
            if (contentType && contentType.includes('video/mp4')) {
              const endTime = Date.now();
              const totalTime = Math.round((endTime - startTime) / 1000);
              
              console.log(`🎉 Video generation completed in ${totalTime} seconds!`);
              
              const videoBuffer = await progressResponse.arrayBuffer();
              const fs = await import('fs/promises');
              await fs.writeFile('test_optimized_video.mp4', Buffer.from(videoBuffer));
              console.log('💾 Video saved as test_optimized_video.mp4');
              
              // Check file size
              const stats = await fs.stat('test_optimized_video.mp4');
              const fileSizeMB = Math.round(stats.size / (1024 * 1024) * 100) / 100;
              console.log(`📁 File size: ${fileSizeMB} MB`);
              
              completed = true;
            } else {
              const progressData = await progressResponse.json();
              
              if (progressData.success && progressData.data) {
                const { status, progress, message, error } = progressData.data;
                
                // Only log if progress changed significantly
                if (Math.abs((progress || 0) - lastProgress) >= 5) {
                  console.log(`📊 ${Math.round(progress || 0)}% - ${message || 'Processing...'}`);
                  lastProgress = progress || 0;
                }
                
                if (status === 'error') {
                  throw new Error(error || 'Generation failed');
                }
                
                if (status === 'completed') {
                  completed = true;
                }
              }
            }
          } else {
            console.warn(`⚠️ Progress check failed: ${progressResponse.status}`);
          }
        } catch (progressError) {
          console.warn('⚠️ Progress check error:', progressError.message);
        }
      }

      if (!completed) {
        console.error('❌ Video generation timed out after 5 minutes');
        console.log('💡 Try reducing slide durations or frame count further');
      }

    } else {
      console.error('❌ Failed to start video generation:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test with even shorter durations for debugging
async function testMinimalVideo() {
  console.log('\n🔬 Testing Minimal Video Generation...');
  
  try {
    const testData = {
      userName: "Quick Test",
      currentPoints: 10000,
      unitsSold: 25,
      longestStreak: 3,
      regionData: { region: "Test", rank: 3, topPercent: 10 },
      rankTitle: "Sales Lieutenant",
      globalRank: 15,
      async: true
    };

    console.log('⚡ Starting minimal test (should complete in ~1-2 minutes)...');

    const response = await fetch('http://localhost:3000/api/generate-yoddha-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Minimal test started with job ID: ${result.jobId}`);
      
      // Just check initial progress
      setTimeout(async () => {
        try {
          const progressResponse = await fetch(`http://localhost:3000/api/generate-yoddha-video?jobId=${result.jobId}`);
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData.success && progressData.data) {
              console.log(`📊 Progress after 10 seconds: ${progressData.data.progress}% - ${progressData.data.message}`);
            }
          }
        } catch (e) {
          console.log('Progress check failed:', e.message);
        }
      }, 10000);
      
    } else {
      console.log(`❌ Minimal test failed: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Minimal test error:', error);
  }
}

// Run tests
async function runOptimizedTests() {
  console.log('🚀 Starting Optimized Video Generation Tests\n');
  
  await testOptimizedVideoGeneration();
  await testMinimalVideo();
  
  console.log('\n✅ Optimized tests completed!');
}

runOptimizedTests().catch(console.error);