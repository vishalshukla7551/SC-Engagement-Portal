'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { clientLogout } from '@/lib/clientLogout';
import { getHomePathForRole } from '@/lib/roleHomePath';

export type ClientAuthUser = {
  role?: string;
  [key: string]: any;
};

interface AuthContextType {
  user: ClientAuthUser | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const URL_TO_ROLE_MAP: Record<string, string[]> = {
  'SEC': ['SEC'],
  'ASE': ['ASE'],
  'ABM': ['ABM'],
  'ZSM': ['ZSM'],
  'ZSE': ['ZSE'],
  'Zopper-Administrator': ['ZOPPER_ADMINISTRATOR'],
  'Samsung-Administrator': ['SAMSUNG_ADMINISTRATOR'],
};

function getRequiredRoleFromUrl(pathname: string): string[] | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  return URL_TO_ROLE_MAP[firstSegment] || null;
}

const PUBLIC_PATHS = [
  "/",
  "/login/role",
  "/login/sec",
  "/signup",
  "/terms",
  "/privacy",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<ClientAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyTokens = async () => {
      try {
        // Skip verification for public routes
        if (isPublicPath(pathname)) {
          setLoading(false);
          return;
        }

        const requiredRoles = getRequiredRoleFromUrl(pathname);

        const res = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (!res.ok) {
          console.warn(`[auth] Token verification failed: ${res.status}`);
          void clientLogout();
          setLoading(false);
          return;
        }

        const { data } = await res.json();
        const userRole = data.role;

        // Role-based URL protection
        if (requiredRoles && !requiredRoles.includes(userRole)) {
          setError(`Unauthorized: This page is for ${requiredRoles.join(' or ')} only`);
          const homeUrl = getHomePathForRole(userRole);
          setTimeout(() => router.replace(homeUrl), 2000);
          setLoading(false);
          return;
        }

        // Update localStorage for UI display
        localStorage.setItem('authUser', JSON.stringify(data));
        setUser(data);
        setError(null);
        setLoading(false);
      } catch (error) {
        console.error('[auth] Token verification error:', error);
        void clientLogout();
        setLoading(false);
      }
    };

    verifyTokens();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {error && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting in 2 seconds...</p>
          </div>
        </div>
      )}
      {!error && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
