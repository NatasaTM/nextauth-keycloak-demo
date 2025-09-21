// src/middleware.ts
// NextAuth middleware to protect routes.
// This ensures that only authenticated users can access /app/* and /api/* (except /api/auth/*).

import { withAuth } from "next-auth/middleware";

export default withAuth(function middleware() {}, {
  // If the user is not authenticated, redirect them to /login
  pages: { signIn: "/login" },
});

// Configuration for which routes to protect
export const config = {
  matcher: [
    "/app/:path*",        // Protect all /app/* pages
    "/api/(?!auth)(.*)",  // Protect all /api/* routes except NextAuth's own /api/auth/*
  ],
};
