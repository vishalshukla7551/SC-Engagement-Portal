import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/rewards/test
 * Test endpoint to verify Benepik configuration
 */
export async function GET(req: NextRequest) {
  const hasAuthKey = !!process.env.BENEPIK_AUTH_KEY;
  const hasSecretKey = !!process.env.BENEPIK_SECRET_KEY;
  const hasApiUrl = !!process.env.BENEPIK_API_URL;

  const isConfigured = hasAuthKey && hasSecretKey && hasApiUrl;

  return NextResponse.json({
    configured: isConfigured,
    details: {
      authKey: hasAuthKey ? '✓ Set' : '✗ Missing',
      secretKey: hasSecretKey ? '✓ Set' : '✗ Missing',
      apiUrl: hasApiUrl ? '✓ Set' : '✗ Missing',
    },
    message: isConfigured
      ? 'Benepik API is properly configured'
      : 'Please set BENEPIK_AUTH_KEY, BENEPIK_SECRET_KEY, and BENEPIK_API_URL in .env'
  });
}
