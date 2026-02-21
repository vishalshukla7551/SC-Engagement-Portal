import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/verify
 * 
 * Verifies the user's authentication tokens (HTTP-only cookies).
 * This is the single source of truth for authentication.
 * 
 * Returns:
 * - 200: User is authenticated, returns user data
 * - 401: User is not authenticated or tokens are invalid
 */
export async function GET(req: Request) {
  try {
    // ✅ Verify tokens from HTTP-only cookies (secure, user can't manipulate)
    const user = await getAuthenticatedUserFromCookies(undefined, {
      mutateCookies: true, // Allow token rotation if using refresh token
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // ✅ Return user data with role
    // For SEC users, flatten profile data to include all fields
    const responseData: any = {
      id: user.id,
      role: user.role,
      username: user.username,
      validation: user.validation,
      metadata: user.metadata, // Include metadata with isUatUser flag
    };

    // For SEC users, include flattened profile fields for easier access
    if (user.role === 'SEC' && user.profile) {
      responseData.secId = user.profile.id;
      responseData.phone = user.profile.phone;
      responseData.fullName = user.profile.fullName || null;
      responseData.store = user.profile.store || null;
      responseData.employeeId = user.profile.employeeId || null;
      responseData.AgencyName = user.profile.AgencyName || null;
    } else {
      // For other roles, include the full profile object
      responseData.profile = user.profile;
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('[auth/verify] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 401 }
    );
  }
}
