// src/app/api/auth/logout/route.ts
// This route logs the user out of both NextAuth and Keycloak.
// It redirects to Keycloak's end-session endpoint, then clears the local session.
//NextAuth’s signOut() clears the local cookie, but to fully log the user out you also need to hit Keycloak’s /logout endpoint. This route demonstrates that

import { NextResponse } from "next/server";

export async function GET() {
  const issuer = process.env.AUTH_KEYCLOAK_ISSUER!;
  const clientId = process.env.AUTH_KEYCLOAK_ID!;
  const postLogoutRedirect = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  // Build Keycloak end-session URL
  const url =
    `${issuer}/protocol/openid-connect/logout` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirect)}`;

  // Redirect the user to Keycloak logout
  return NextResponse.redirect(url, { status: 302 });
}
