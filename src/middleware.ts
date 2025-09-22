// src/middleware.ts
// Protects all /app/* pages and your BFF /api/* routes,
// while skipping NextAuth's own endpoints.
// Unauthenticated users are sent to /auth/login (a tiny client page that immediately calls signIn("keycloak")).

import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ✅ Always allow NextAuth internal endpoints
    // (token exchange, callbacks, CSRF checks, etc.)
    if (pathname.startsWith("/api/auth")) {
      return; // equivalent to NextResponse.next()
    }

    // ✅ (Optional) Allow public API without auth
    // if (pathname.startsWith("/api/public")) return;

    // No custom logic needed here; withAuth handles the auth check
    // and will redirect unauthenticated users to pages.signIn below.
  },
  {
    // ⬇️ Instead of a custom /login screen, point to our relay page.
    // That page immediately triggers signIn("keycloak", { callbackUrl })
    // so users go straight to Keycloak (no NextAuth interstitial).
    pages: { signIn: "/auth/login" },
  }
);

// Apply auth checks only to these paths.
// Note: /api/auth/* is still matched here, but we early-return above.
export const config = {
  matcher: [
    "/app/:path*", // protect all app pages
    "/api/:path*", // protect BFF API routes
  ],
};
