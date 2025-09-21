import { NextRequest, NextResponse } from "next/server";
import { popTempVerifier } from "@/lib/cookies";
import { kcUrls } from "@/lib/oidc";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 👇 await, jer popTempVerifier() vraća Promise<string | undefined>
  const verifier = (await popTempVerifier()) ?? "";

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", process.env.KC_CLIENT_ID!);
  body.set("code", code);
  body.set("code_verifier", verifier);
  body.set("redirect_uri", process.env.KC_REDIRECT_URI!);

  const r = await fetch(kcUrls().token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!r.ok) {
    const text = await r.text();
    console.error("Token exchange failed:", r.status, text);
    return NextResponse.json({ error: "token_exchange_failed", status: r.status, text }, { status: 500 });
  }

  const json = await r.json();

  // Setuj access token kao HttpOnly cookie direktno na response
  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set("oidc_access_token", json.access_token, {
    httpOnly: true,
    secure: false,   // true u produkciji (HTTPS)
    sameSite: "lax",
    path: "/",
    maxAge: json.expires_in ?? 300,
  });
  return res;
}
