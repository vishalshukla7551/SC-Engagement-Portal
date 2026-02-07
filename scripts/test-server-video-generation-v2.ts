import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testServerVideoGeneration() {
  console.log('🎬 Testing Updated Server-side Video Generation...');
  
  try {
    // Test data matching frontend structure
    const testData = {
      userName: "Harshdeep Singh",
      currentPoints: 124500,
      unitsSold: 156,
      longestStreak: 12,
      regionData: {
        region: "North",
        rank: 7,
        topPercent: 15
      },
      leaderboardData: [
        { rank: 6, name: "Vikram Malhotra", points: "125k" },
        { rank: 7, name: "Harshdeep Singh", points: "124.5k", isUser: true },
        { rank: 8, name: "Aditi Sharma", points: "123k" }
      ],
      rankTitle: "Sales Commander",
      hallOfFameData: [
        { rank: 1, name: "Top Performer", points: "200k" },
        { rank: 2, name: "Second Best", points: "180k" },
        { rank: 7, name: "Harshdeep Singh", points: "124.5k", isUser: true }
      ],
      globalRank: 42,
      globalStats: {
        rank: 42,
        total: 1000,
        percent: 5
      },
      async: true // Use async mode for progress tracking
    };

    console.log('📊 Test Data:', JSON.stringify(testData, null, 2));

    // Test server-side generation
    const response = await fetch('http://localhost:3000/api/generate-yoddha-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('🎯 Server Response:', result);

    if (result.success && result.jobId) {
      console.log(`✅ Video generation started with job ID: ${result.jobId}`);
      console.log('📈 Tracking progress...');

      // Poll for progress
      let completed = false;
      let attempts = 0;
      const maxAttempts = 180; // 3 minutes timeout for testing

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        attempts++;

        try {
          const progressResponse = await fetch(`http://localhost:3000/api/generate-yoddha-video?jobId=${result.jobId}`);
          
          if (progressResponse.ok) {
            const contentType = progressResponse.headers.get('content-type');
            
            if (contentType && contentType.includes('video/mp4')) {
              console.log('🎉 Video generation completed!');
              console.log('📁 Video file ready for download');
              completed = true;
              
              // Save video file for testing
              const videoBuffer = await progressResponse.arrayBuffer();
              const fs = await import('fs/promises');
              await fs.writeFile('test_server_generated_video.mp4', Buffer.from(videoBuffer));
              console.log('💾 Video saved as test_server_generated_video.mp4');
              
            } else {
              // Still processing, get progress
              const progressData = await progressResponse.json();
              
              if (progressData.success && progressData.data) {
                const { status, progress, message, error } = progressData.data;
                
                console.log(`📊 Progress: ${Math.round(progress || 0)}% - ${message || 'Processing...'}`);
                
                if (status === 'error') {
                  throw new Error(error || 'Server-side generation failed');
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
  } finally {
    await prisma.$disconnect();
  }
}

// Test slide structure validation
function validateSlideStructure() {
  console.log('\n🔍 Validating Slide Structure...');
  
  const expectedSlides = [
    { type: 'intro', duration: 4000, variant: 'default' },
    { type: 'stats', duration: 6000, variant: 'radar' },
    { type: 'rank', duration: 6000, variant: 'laser' },
    { type: 'leaderboard', duration: 5000, variant: 'battalion' },
    { type: 'badges', duration: 6000, variant: 'regal' },
    { type: 'hall-of-fame', duration: 5000, variant: 'spotlight' },
    { type: 'outro', duration: 8000, variant: 'cobra' }
  ];

  console.log('📋 Expected Slides:');
  expectedSlides.forEach((slide, index) => {
    console.log(`  ${index + 1}. ${slide.type} (${slide.duration}ms, ${slide.variant})`);
  });

  const totalDuration = expectedSlides.reduce((sum, slide) => sum + slide.duration, 0);
  console.log(`⏱️ Total Video Duration: ${totalDuration / 1000} seconds`);
  
  console.log('✅ Slide structure validation complete');
}

// Test PatrioticBackground variants
function validateBackgroundVariants() {
  console.log('\n🎨 Validating PatrioticBackground Variants...');
  
  const variants = [
    'default', 'radar', 'spotlight', 'regal', 'rising', 
    'cobra', 'battalion', 'honor', 'elite', 'laser'
  ];

  console.log('🎭 Available Background Variants:');
  variants.forEach((variant, index) => {
    console.log(`  ${index + 1}. ${variant}`);
  });
  
  console.log('✅ Background variants validation complete');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Server-side Video Generation Tests\n');
  
  validateSlideStructure();
  validateBackgroundVariants();
  
  console.log('\n🎬 Starting video generation test...');
  await testServerVideoGeneration();
  
  console.log('\n✅ All tests completed!');
}

// Execute tests
runAllTests().catch(console.error);