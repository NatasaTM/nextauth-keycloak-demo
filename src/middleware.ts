// src/middleware.ts
// Protect all /app/* pages and all /api/* BFF routes.
// We explicitly skip NextAuth's own /api/auth/* endpoints inside the middleware.

import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    // ✅ Allow NextAuth internal endpoints without auth checks
    if (req.nextUrl.pathname.startsWith("/api/auth")) {
      return; // equivalent to NextResponse.next()
    }

    // (Optional) If you have public API under /api/public/*, skip them too:
    // if (req.nextUrl.pathname.startsWith("/api/public")) return;

    // No custom logic needed; withAuth will enforce auth for matched routes below.
  },
  {
    pages: { signIn: "/login" }, // unauthenticated users go here
  }
);

// ✅ Use only globs in matcher (no regex lookaheads)
export const config = {
  matcher: [
    "/app/:path*",  // protect all application pages
    "/api/:path*",  // protect all BFF API routes (except the skips above)
  ],
};

