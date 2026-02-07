import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { Role, Validation } from '@prisma/client';
import { cookies as nextCookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  // In Next.js route handlers this will only log on the server side
  console.warn(
    '[auth] ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set in environment variables.',
  );
}

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || ''
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || ''

// Helper function to clear auth cookies
// Handles both NextResponse.cookies (has .set) and next/headers cookies (has .delete)
export function clearAuthCookies(cookieStore: any, shouldMutate: boolean = true) {
  if (!cookieStore || !shouldMutate) return;

  if (cookieStore.set) {
    // NextResponse.cookies - use .set() with maxAge: 0
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production' && !process.env.ALLOW_HTTP_COOKIES,
      path: '/',
      maxAge: 0,
    };
    cookieStore.set(ACCESS_TOKEN_COOKIE, '', cookieOptions);
    cookieStore.set(REFRESH_TOKEN_COOKIE, '', cookieOptions);
  } else if (cookieStore.delete) {
    // next/headers cookies - use .delete()
    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
  }
}

export interface AuthTokenPayload {
  userId?: string;
  secId?: string;
  role: Role;
  projectId: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: Role;
  validation: Validation;
  metadata: any;
  profile: any | null;
}

export function signAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
}

export function signRefreshToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL_SECONDS });
}

export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

// Utility used inside API routes to resolve the logged-in user.
// Flow:
// 1) Try access token.
// 2) If missing/invalid, try refresh token.
// 3) If refresh is valid, re-issue fresh access & refresh tokens and set cookies.
// 4) Load the user from DB and ensure validation=APPROVED.
// 5) If anything fails, clear auth cookies and return null.
export async function getAuthenticatedUserFromCookies(
  
  cookiesParam?: CookieReader,
  options?: { mutateCookies?: boolean },
): Promise<AuthenticatedUser | null> {
  const allowCookieMutation = options?.mutateCookies ?? true;
  // Prefer the explicit reader passed from route handlers; otherwise fall back to next/headers.
  // In Next.js 16, `cookies()` is async and returns a Promise, so we must await it
  // before accessing `.get`, `.set`, `.delete`, etc.
  const cookieStore =
    !cookiesParam && typeof nextCookies === 'function'
      ? await nextCookies()
      : undefined;

  const reader: CookieReader = cookiesParam
    ? cookiesParam
    : cookieStore
    ? {
        get: (name: string) => {
          const c = cookieStore.get(name);
          return c ? { value: c.value } : undefined;
        },
      }
    : {
        get: () => undefined,
      };

  const accessToken = reader.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = reader.get(REFRESH_TOKEN_COOKIE)?.value;

  let payload: AuthTokenPayload | null = null;
  let authenticatedViaRefresh = false;

  if (accessToken) {
    payload = verifyAccessToken(accessToken);
  }

  if (!payload && refreshToken) {
    payload = verifyRefreshToken(refreshToken);
    authenticatedViaRefresh = !!payload;
  }

  // No valid tokens at all – clear cookies if we can and bail out
  if (!payload) {
    clearAuthCookies(cookieStore, allowCookieMutation);
    return null;
  }

  // Validate projectId to prevent cross-project token usage
  const currentProject = process.env.PROJECT_ID || 'samsung';
  if (payload.projectId !== currentProject) {
    console.warn(
      `[auth] Token from different project: ${payload.projectId} vs ${currentProject}. Clearing cookies.`
    );
    clearAuthCookies(cookieStore, allowCookieMutation);
    return null;
  }

  // Validate role is one of the valid roles
  const VALID_ROLES = ['SEC', 'ASE', 'ABM', 'ZSM', 'ZSE', 'ZOPPER_ADMINISTRATOR', 'SAMSUNG_ADMINISTRATOR'];
  if (!VALID_ROLES.includes(payload.role)) {
    console.warn(`[auth] Invalid role in token: ${payload.role}. Clearing cookies.`);
    clearAuthCookies(cookieStore, allowCookieMutation);
    return null;
  }

  // Special handling for SEC users.
  // For simple OTP-based SEC login we treat the SEC identity as the phone number
  // carried in `secId` inside the JWT payload, and we do not depend on a
  // dedicated SEC collection record.
  if (payload.role === 'SEC') {
    const secId = payload.secId;
    if (!secId) {
      clearAuthCookies(cookieStore, allowCookieMutation);
      return null;
    }

    // If we authenticated using the refresh token, rotate SEC tokens as well so
    // a missing/expired access token gets recreated from a valid refresh token.
    if (authenticatedViaRefresh && cookieStore && allowCookieMutation) {
      const newPayload: AuthTokenPayload = {
        secId,
        role: 'SEC' as Role,
        projectId: process.env.PROJECT_ID || 'samsung',
      };

      // Rotate ONLY the access token. Refresh token keeps its original
      // lifetime from login (fixed maximum session window).
      const newAccessToken = signAccessToken(newPayload);
      const isSecure = process.env.NODE_ENV === 'production' && !process.env.ALLOW_HTTP_COOKIES;

      cookieStore.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecure,
        path: '/',
        maxAge: ACCESS_TOKEN_TTL_SECONDS,
      });
    }

    // Fetch SEC profile data from database
    const secProfile = await prisma.sEC.findUnique({
      where: { phone: secId },
      select: {
        id: true,
        phone: true,
        fullName: true,
        storeId: true,
        employeeId: true,
        AgencyName: true,
      },
    });

    // If SEC user doesn't exist in database, reject the token
    if (!secProfile) {
      console.warn(`[auth] SEC user not found in database: ${secId}`);
      clearAuthCookies(cookieStore, allowCookieMutation);
      return null;
    }

    // Fetch store details if storeId exists
    let storeDetails = null;
    if (secProfile?.storeId) {
      storeDetails = await prisma.store.findUnique({
        where: { id: secProfile.storeId },
        select: {
          id: true,
          name: true,
          city: true,
        },
      });
    }

    const authUser: AuthenticatedUser = {
      id: secId,
      username: secId,
      role: 'SEC' as Role,
      validation: 'APPROVED',
      metadata: {},
      profile: {
        id: secProfile.id,
        phone: secProfile.phone,
        fullName: secProfile.fullName,
        store: storeDetails,
        employeeId: secProfile.employeeId,
        AgencyName: secProfile.AgencyName,
      },
    } as any;

    return authUser;
  }

  // Ensure userId exists in payload
  if (!payload.userId) {
    clearAuthCookies(cookieStore, allowCookieMutation);
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      abmProfile: true,
      aseProfile: true,
      zsmProfile: true,
      zseProfile: true,
      samsungAdminProfile: true,
      zopperAdminProfile: true,
    },
  } as any);

  if (!user || user.validation !== 'APPROVED') {
    clearAuthCookies(cookieStore, allowCookieMutation);
    return null;
  }

  // If we authenticated using the refresh token, rotate tokens so the client
  // gets a fresh access token (and optionally a new refresh token).
  if (authenticatedViaRefresh && cookieStore && allowCookieMutation) {
    const newPayload: AuthTokenPayload = {
      userId: user.id,
      role: user.role,
      projectId: process.env.PROJECT_ID || 'samsung',
    };

    // Rotate ONLY the access token. Refresh token keeps its original
    // lifetime from login (fixed maximum session window).
    const newAccessToken = signAccessToken(newPayload);
    const isSecure = process.env.NODE_ENV === 'production' && !process.env.ALLOW_HTTP_COOKIES;

    cookieStore.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      path: '/',
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
    });
  }

  const anyUser = user as any;
  const { password: _pw, ...rest } = anyUser;

  const profile =
    anyUser.abmProfile ||
    anyUser.aseProfile ||
    anyUser.zsmProfile ||
    anyUser.zseProfile ||
    anyUser.samsungAdminProfile ||
    anyUser.zopperAdminProfile ||
    null;

  const authUser: AuthenticatedUser = {
    id: rest.id,
    username: rest.username,
    role: rest.role,
    validation: rest.validation,
    metadata: rest.metadata ?? {},
    profile,
  };

  return authUser;
}

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS };
