// Quick test for server-side video generation with shorter durations

async function testQuickVideoGeneration() {
  console.log('🎬 Quick Server-side Video Generation Test...');
  
  try {
    // Test data with shorter durations for quick testing
    const testData = {
      userName: "Test User",
      currentPoints: 50000,
      unitsSold: 75,
      longestStreak: 5,
      regionData: {
        region: "Test Region",
        rank: 3,
        topPercent: 10
      },
      rankTitle: "Sales Captain",
      globalRank: 15,
      globalStats: {
        rank: 15,
        total: 500,
        percent: 3
      },
      async: true
    };

    console.log('📊 Starting quick test...');

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
      
      // Poll for progress with shorter intervals
      let completed = false;
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second intervals
        attempts++;

        try {
          const progressResponse = await fetch(`http://localhost:3000/api/generate-yoddha-video?jobId=${result.jobId}`);
          
          if (progressResponse.ok) {
            const contentType = progressResponse.headers.get('content-type');
            
            if (contentType && contentType.includes('video/mp4')) {
              console.log('🎉 Video generation completed!');
              
              // Save video file
              const videoBuffer = await progressResponse.arrayBuffer();
              const fs = await import('fs/promises');
              await fs.writeFile('test_quick_video.mp4', Buffer.from(videoBuffer));
              console.log('💾 Video saved as test_quick_video.mp4');
              
              completed = true;
            } else {
              const progressData = await progressResponse.json();
              
              if (progressData.success && progressData.data) {
                const { status, progress, message, error } = progressData.data;
                
                console.log(`📊 ${Math.round(progress || 0)}% - ${message || 'Processing...'}`);
                
                if (status === 'error') {
                  throw new Error(error || 'Generation failed');
                }
                
                if (status === 'completed') {
                  completed = true;
                }
              }
            }
          }
        } catch (progressError) {
          console.warn('⚠️ Progress check error:', progressError);
        }
      }

      if (!completed) {
        console.error('❌ Video generation timed out');
      }

    } else {
      console.error('❌ Failed to start video generation:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test individual slide rendering
async function testSlideRendering() {
  console.log('\n🎨 Testing Individual Slide Rendering...');
  
  const slides = ['intro', 'stats', 'rank', 'badges'];
  
  for (const slideType of slides) {
    try {
      console.log(`🔍 Testing ${slideType} slide...`);
      
      const testData = {
        userName: "Test User",
        currentPoints: 25000,
        unitsSold: 50,
        longestStreak: 3,
        rankTitle: "Sales Lieutenant",
        regionData: { region: "Test", rank: 5, topPercent: 20 },
        globalRank: 25,
        async: false // Synchronous for quick testing
      };

      const response = await fetch('http://localhost:3000/api/generate-yoddha-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        console.log(`✅ ${slideType} slide rendered successfully`);
      } else {
        console.log(`❌ ${slideType} slide failed: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ ${slideType} slide error:`, error.message);
    }
  }
}

// Run tests
async function runQuickTests() {
  console.log('🚀 Starting Quick Video Generation Tests\n');
  
  await testQuickVideoGeneration();
  
  console.log('\n✅ Quick tests completed!');
}

runQuickTests().catch(console.error);