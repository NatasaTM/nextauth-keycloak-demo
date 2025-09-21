import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Server route to revoke Keycloak session using refresh_token.
 * Must be called BEFORE NextAuth signOut (while session cookie exists).
 */
export async function POST(req: NextRequest) {
  const issuer = process.env.AUTH_KEYCLOAK_ISSUER!;
  const clientId = process.env.AUTH_KEYCLOAK_ID!;
  const clientSecret = process.env.AUTH_KEYCLOAK_SECRET!;

  const token = await getToken({ req });
  const refreshToken = (token as any)?.refreshToken;

  if (!refreshToken) {
    return NextResponse.json({ error: "no_refresh_token" }, { status: 400 });
  }

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

  // Keycloak often returns 204 on success
  if (!resp.ok && resp.status !== 204) {
    const text = await resp.text().catch(() => "");
    return NextResponse.json(
      { error: "kc_logout_failed", status: resp.status, raw: text },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
