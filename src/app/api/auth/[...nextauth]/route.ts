// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

/**
 * We want split endpoints:
 * - Browser should hit Keycloak on localhost (AUTH_URL_PUBLIC)
 * - Server (inside Docker) should DISCOVER via internal issuer (ISSUER_INTERNAL)
 *
 * If ISSUER_INTERNAL is not provided, we try to derive it from TOKEN_URL.
 */
const AUTH_URL_PUBLIC = process.env.AUTH_KEYCLOAK_AUTH_URL; // e.g. http://localhost:8080/realms/demo/protocol/openid-connect/auth
const TOKEN_URL = process.env.AUTH_KEYCLOAK_TOKEN_URL;       // e.g. http://keycloak:8080/realms/demo/protocol/openid-connect/token
const ISSUER_INTERNAL_EXPLICIT = process.env.AUTH_KEYCLOAK_ISSUER; // e.g. http://keycloak:8080/realms/demo

// Try to derive issuer from TOKEN_URL if explicit issuer is missing
const ISSUER_FROM_TOKEN =
  TOKEN_URL?.replace(/\/protocol\/openid-connect\/token$/, "") ?? undefined;

// Final internal issuer used by the server (Docker network)
const ISSUER_INTERNAL = ISSUER_INTERNAL_EXPLICIT ?? ISSUER_FROM_TOKEN;

export const authOptions: NextAuthOptions = {
  providers: [
    Keycloak({
      /**
       * IMPORTANT:
       * - `issuer` MUST be reachable from the Next.js server (inside Docker), so use keycloak:8080.
       *   This lets openid-client discover token/userinfo endpoints internally.
       * - `authorization` is overridden to the public URL so the BROWSER opens localhost.
       */
      issuer: ISSUER_INTERNAL, // ex: http://keycloak:8080/realms/demo
      authorization: AUTH_URL_PUBLIC
        ? { url: AUTH_URL_PUBLIC, params: { scope: "openid profile email" } }
        : { params: { scope: "openid profile email" } },

      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      checks: ["pkce", "state"],

      // Map Keycloak profile to NextAuth user
      profile(p) {
        return {
          id: p.sub,
          name: p.preferred_username ?? p.name ?? p.sub,
          email: p.email,
          emailVerified: p.email_verified ?? false,
        };
      },
    }),
  ],

  // JWT in HttpOnly cookies (stateless)
  session: { strategy: "jwt" },

  // Keep your existing callbacks here (jwt/session) if you already have them:
  // callbacks: { ... }

  secret: process.env.NEXTAUTH_SECRET,

  // Enable while debugging:
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
