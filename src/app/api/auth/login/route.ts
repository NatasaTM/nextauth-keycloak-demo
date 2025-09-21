import { NextResponse } from "next/server";
import { kcUrls, pkceChallengeFromVerifier, randomString } from "@/lib/oidc";
import { setTempVerifier } from "@/lib/cookies";

export async function GET() {
  const clientId = process.env.KC_CLIENT_ID!;
  const redirectUri = process.env.KC_REDIRECT_URI!;
  const { authorize } = kcUrls();

  const state = randomString(16);
  const verifier = randomString(64);
  const challenge = pkceChallengeFromVerifier(verifier);

  await setTempVerifier(verifier); // 👈 now async

  const authUrl = new URL(authorize);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString(), { status: 302 });
}
