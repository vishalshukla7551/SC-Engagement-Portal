'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { clientLogout } from '@/lib/clientLogout';
import { getHomePathForRole } from '@/lib/roleHomePath';

export type ClientAuthUser = {
  role?: string;
  [key: string]: any;
};

// Map URL segments to required roles
const URL_TO_ROLE_MAP: Record<string, string[]> = {
  'SEC': ['SEC'],
  'ASE': ['ASE'],
  'ABM': ['ABM'],
  'ZSM': ['ZSM'],
  'ZSE': ['ZSE'],
  'Zopper-Administrator': ['ZOPPER_ADMINISTRATOR'],
  'Samsung-Administrator': ['SAMSUNG_ADMINISTRATOR'],
};

/**
 * Extract required role from URL path
 */
function getRequiredRoleFromUrl(pathname: string): string[] | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  return URL_TO_ROLE_MAP[firstSegment] || null;
}

/**
 * Read authUser from localStorage (client only). Returns null if missing or invalid.
 */
export function readAuthUserFromStorage(): ClientAuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('authUser');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ClientAuthUser;
    return parsed ?? null;
  } catch {
    return null;
  }
}

/**
 * useRequireAuth
 *
 * Token-based auth verification with URL-based role enforcement.
 * - Tokens (HTTP-only cookies) are the single source of truth
 * - Required role is determined from URL path
 * - localStorage is only for UI display purposes
 *
 * Usage:
 *   const { user, loading, error } = useRequireAuth();
 */
export function useRequireAuth(options?: { enabled?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<ClientAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If explicitly disabled (e.g. public routes), skip auth checks
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    const verifyTokens = async () => {
      try {
        // ✅ Get required role from URL
        const requiredRoles = getRequiredRoleFromUrl(pathname);

        // ✅ Verify token with server (single source of truth)
        const res = await fetch('/api/auth/verify', {
          credentials: 'include', // Send HTTP-only cookies
        });

        if (!res.ok) {
          console.warn(`[auth] Token verification failed: ${res.status}`);
          void clientLogout();
          return;
        }

        const { data } = await res.json();
        const userRole = data.role;

        console.log(`[auth] Token verified. User role: ${userRole}, Required: ${requiredRoles?.join(' or ') || 'any'}`);

        // ✅ Check if user's role matches URL requirement
        if (requiredRoles && !requiredRoles.includes(userRole)) {
          setError(`Unauthorized: This page is for ${requiredRoles.join(' or ')} only`);
          
          // Redirect to user's correct home
          const homeUrl = getHomePathForRole(userRole);
          setTimeout(() => router.replace(homeUrl), 2000);
          return;
        }

        // ✅ Update localStorage for UI display only (not for auth decisions)
        localStorage.setItem('authUser', JSON.stringify(data));

        setUser(data);
        setLoading(false);
      } catch (error) {
        console.error('[auth] Token verification error:', error);
        void clientLogout();
      }
    };

    verifyTokens();
  }, [pathname, router, options?.enabled]);

  return { user, loading, error } as const;
}
