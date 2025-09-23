//src\app\api\auth\kc-logout\route.ts
export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * POST /api/auth/kc-logout
 *
 * Server-side logout against Keycloak using the refresh_token.
 * Must be called BEFORE NextAuth signOut (while the session cookie exists).
 */
export async function POST(req: NextRequest) {
  const issuer = process.env.AUTH_KEYCLOAK_ISSUER!;
  const clientId = process.env.AUTH_KEYCLOAK_ID!;
  const clientSecret = process.env.AUTH_KEYCLOAK_SECRET!;

  // Read the NextAuth JWT (server-side) and extract the refresh_token we stored in jwt() callback.
  const token = await getToken({ req });
  const refreshToken = (token as any)?.refreshToken;

  if (!refreshToken) {
    // Nothing to revoke (e.g., session already half-gone) — this is not fatal.
    return NextResponse.json({ error: "no_refresh_token" }, { status: 400 });
  }

  // Keycloak RP-initiated logout for a single client via refresh_token
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: String(refreshToken),
  });

  const resp = await fetch(`${issuer}/protocol/openid-connect/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  // Keycloak commonly returns 204 No Content on success
  if (!resp.ok && resp.status !== 204) {
    const text = await resp.text().catch(() => "");
    return NextResponse.json(
      { error: "kc_logout_failed", status: resp.status, raw: text },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
