'use client';

/**
 * Global API Interceptor
 * Listens to all fetch requests and handles 401 responses
 */

let isLogoutInProgress = false;

// Public API routes that should not trigger logout on 401
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/sec/send-otp',
  '/api/auth/sec/verify-otp',
];

function isPublicRoute(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname;
    return PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
  } catch {
    return false;
  }
}

export function setupApiInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args: any[]) {
    const response = await originalFetch.apply(window, args as [RequestInfo | URL, RequestInit?]);

    // Get the URL from args
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.toString?.() || '';

    // Handle 401 Unauthorized (skip for public routes)
    if (response.status === 401 && !isLogoutInProgress && !isPublicRoute(url)) {
      isLogoutInProgress = true;

      try {
        // Call logout API
        await originalFetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });

        // Clear localStorage
        localStorage.removeItem('authUser');
        localStorage.removeItem('token');

        // Show alert
        const Swal = (await import('sweetalert2')).default;
        await Swal.fire({
          icon: 'info',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        // Redirect to login
        window.location.href = '/login/role';
      } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('token');
        window.location.href = '/login/role';
      } finally {
        isLogoutInProgress = false;
      }
    }

    return response;
  } as any;
}
