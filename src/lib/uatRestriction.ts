import { NextResponse } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role?: string;
  metadata?: {
    isUatUser?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Check if user is UAT user and restrict access to admin-only routes
 * UAT users can only access spot-incentive-report related endpoints
 *
 * @param authUser - Authenticated user object
 * @param allowedForUat - Whether this endpoint is allowed for UAT users (default: false)
 * @returns NextResponse with 403 error if access denied, null if allowed
 */
export function checkUatRestriction(
  authUser: AuthenticatedUser | null,
  allowedForUat: boolean = false
): NextResponse | null {
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isUatUser = authUser.metadata?.isUatUser === true;

  if (isUatUser && !allowedForUat) {
    return NextResponse.json(
      { error: 'UAT users cannot access this endpoint' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Check if user is UAT user
 */
export function isUatUser(authUser: AuthenticatedUser | null): boolean {
  return authUser?.metadata?.isUatUser === true;
}

/**
 * Get UAT SEC phones from environment (comma-separated)
 * Example: "9876543210,9876543211,9876543212"
 */
export function getUatSecPhones(): string[] {
  const phonesStr = process.env.UAT_SEC_PHONES || '';
  return phonesStr
    .split(',')
    .map(phone => phone.trim())
    .filter(phone => phone.length > 0);
}

/**
 * Get single UAT SEC phone (for backward compatibility)
 * Falls back to UAT_SEC_PHONES if UAT_SEC_PHONE not set
 */
export function getUatSecPhone(): string | undefined {
  const singlePhone = process.env.UAT_SEC_PHONE;
  if (singlePhone) {
    return singlePhone;
  }
  
  const phones = getUatSecPhones();
  return phones.length > 0 ? phones[0] : undefined;
}
