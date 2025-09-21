// src/app/api/auth/register/route.ts
// This route builds a Keycloak registration URL and redirects the user there.
// Requires "User Registration" to be enabled in the Keycloak realm settings.
//This is optional. If you don’t want self-service registration, disable it in Keycloak and remove this route. Users will only be able to sign in if their accounts are created by an admin

import { NextResponse } from "next/server";

export async function GET() {
  const issuer = process.env.AUTH_KEYCLOAK_ISSUER!;
  const clientId = process.env.AUTH_KEYCLOAK_ID!;
  const redirect = `${process.env.NEXTAUTH_URL}/api/auth/callback/keycloak`;
  const scope = encodeURIComponent("openid profile email");

  // Build the Keycloak self-registration URL
  const url =
    `${issuer}/protocol/openid-connect/registrations` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&redirect_uri=${encodeURIComponent(redirect)}`;

  // Redirect the user to the Keycloak registration page
  return NextResponse.redirect(url, { status: 302 });
}

