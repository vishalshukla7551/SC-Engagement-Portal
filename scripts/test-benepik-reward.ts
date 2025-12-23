/**
 * Test script for Benepik Reward API
 * Run with: npx tsx scripts/test-benepik-reward.ts
 */

async function testBenepikReward() {
  const API_URL = 'http://localhost:3000/api/rewards/send';
  
  const payload = {
    userName: "Vishal Shukla",
    mobileNumber: "7408108617",
    rewardAmount: 1
  };

  console.log('🚀 Testing Benepik Reward API...\n');
  console.log('📤 Sending request to:', API_URL);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));
  console.log('\n⏳ Please wait...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ SUCCESS! Reward sent successfully!');
      console.log('📱 Check mobile number 7408108617 for SMS/WhatsApp');
    } else {
      console.log('\n❌ FAILED:', data.error);
    }
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Make sure your dev server is running on http://localhost:3000');
  }
}

testBenepikReward();
