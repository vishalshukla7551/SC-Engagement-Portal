#!/usr/bin/env tsx

// Test script for server-side video generation
import fetch from 'node-fetch';

async function testServerVideoGeneration() {
  console.log('🎬 Testing Server-side Video Generation...\n');

  try {
    // Test data
    const testData = {
      userName: 'Test User',
      currentPoints: 12500,
      unitsSold: 45,
      longestStreak: 8,
      regionData: {
        region: 'North',
        rank: 5,
        topPercent: 15
      },
      rankTitle: 'Sales Commander',
      globalRank: 23,
      globalStats: {
        rank: 23,
        total: 150,
        percent: 15
      },
      async: false // Use synchronous mode for testing
    };

    console.log('📤 Sending request to server...');
    
    const response = await fetch('http://localhost:3000/api/generate-yoddha-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📥 Response status: ${response.status}`);

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('video/mp4')) {
        console.log('✅ Video generated successfully!');
        
        // Save the video file
        const buffer = await response.buffer();
        const fs = await import('fs/promises');
        await fs.writeFile('test_yoddha_video.mp4', buffer);
        
        console.log(`📁 Video saved as test_yoddha_video.mp4 (${buffer.length} bytes)`);
        console.log('🎉 Server-side video generation test completed successfully!');
      } else {
        const result = await response.json();
        console.log('📄 Response:', result);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Request failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testServerVideoGeneration();