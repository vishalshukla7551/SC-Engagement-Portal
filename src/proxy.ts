import { NextRequest, NextResponse } from "next/server";
import { getHomePathForRole } from "./lib/roleHomePath";

export const config = {
  matcher: [
    "/",
    "/login/:path*",
    "/SEC/:path*",
    "/ASE/:path*",
    "/ABM/:path*",
    "/ZSM/:path*",
    "/ZSE/:path*",
    "/Zopper-Administrator/:path*",
    "/Samsung-Administrator/:path*",
  ],
};

/**
 * Main Proxy Handler
 * Orchestrates all proxy modules and routes requests appropriately
 */
export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  // ✅ Root "/" redirect logic
  if (pathname === "/" || pathname.startsWith("/login")) {
    try {
      const cookieHeader = req.headers.get("cookie") || "";
      const verifyResponse = await fetch(
        new URL("/api/auth/verify", req.nextUrl.origin),
        {
          method: "GET",
          headers: { cookie: cookieHeader },
        }
      );

      if (verifyResponse.ok) {
        const data = await verifyResponse.json();
        const user = data.user;

        if (user && user.role) {
          // Authenticated - redirect to home
          const homePath = getHomePathForRole(user.role);
          return NextResponse.redirect(
            new URL(homePath, req.nextUrl.origin)
          );
        }
      }
    } catch (error) {
      console.error("Root redirect error:", error);
    }
  }

  // ✅ Protected pages - check auth
  if (
    pathname.startsWith("/SEC") ||
    pathname.startsWith("/ASE") ||
    pathname.startsWith("/ABM") ||
    pathname.startsWith("/ZSM") ||
    pathname.startsWith("/ZSE") ||
    pathname.startsWith("/Zopper-Administrator") ||
    pathname.startsWith("/Samsung-Administrator")
  ) {
    try {
      const cookieHeader = req.headers.get("cookie") || "";
      const verifyResponse = await fetch(
        new URL("/api/auth/verify", req.nextUrl.origin),
        {
          method: "GET",
          headers: { cookie: cookieHeader },
        }
      );

      if (!verifyResponse.ok) {
        // Not authenticated - redirect to login
        return NextResponse.redirect(
          new URL("/login/role", req.nextUrl.origin)
        );
      }

      // Authenticated - allow
      return NextResponse.next();
    } catch (error) {
      console.error("Protected page auth error:", error);
      return NextResponse.redirect(
        new URL("/login/role", req.nextUrl.origin)
      );
    }
  }

  return NextResponse.next();
}
