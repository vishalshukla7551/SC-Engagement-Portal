'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { setupApiInterceptor } from '@/lib/apiInterceptor';

export type AuthUser = {
  id: string;
  username: string;
  role?: string;
  validation?: string;
  profile?: any;
  metadata?: any;
  [key: string]: any;
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public pages - no auth check needed
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/terms',
  '/privacy',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) =>
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  );
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Setup API interceptor on mount
  useEffect(() => {
    setupApiInterceptor();
  }, []);

  // Refresh auth - manually call verify API
  const refreshAuth = async () => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const response = await res.json();
        const freshUser = response.data; // ← data object se user lao

        if (freshUser) {
          setUser(freshUser);
          setIsAuthenticated(true);
          localStorage.setItem('authUser', JSON.stringify(freshUser));
        }
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
    }
  };

  useEffect(() => {
    // Skip auth check for public pages (proxy already handles it)
    if (isPublicPath(pathname)) {
      setLoading(false);
      return;
    }

    // If already authenticated, don't verify again
    // if (user) {
    //   setLoading(false);
    //   return;
    // }

    // Protected pages - verify auth
    verifyAuth();

    async function verifyAuth() {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          const freshUser = data.data; // ← data.data se user lao (not data.user)
          console.log("User",freshUser)
          if (freshUser) {
            setUser(freshUser);
            setIsAuthenticated(true);
            // Store for debugging only - not used by app
            localStorage.setItem('authUser', JSON.stringify(freshUser));
          }
        }
      } catch (error) {
        console.error('Auth verification error:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [pathname, isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthRefresh() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthRefresh must be used within an AuthProvider');
  }
  return context.refreshAuth;
}
