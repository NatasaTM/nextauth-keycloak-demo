import NextAuth, { type NextAuthOptions } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

/**
 * We want split endpoints:
 * - Browser should hit Keycloak on localhost (AUTH_URL_PUBLIC)
 * - Server (inside Docker) should use internal endpoints (keycloak:8080)
 */
const AUTH_URL_PUBLIC = process.env.AUTH_KEYCLOAK_AUTH_URL;
const TOKEN_URL = process.env.AUTH_KEYCLOAK_TOKEN_URL;
const USERINFO_URL = process.env.AUTH_KEYCLOAK_USERINFO_URL;
const ISSUER_INTERNAL_EXPLICIT = process.env.AUTH_KEYCLOAK_ISSUER;

// Try to derive issuer from TOKEN_URL if explicit issuer is missing
const ISSUER_FROM_TOKEN =
  TOKEN_URL?.replace(/\/protocol\/openid-connect\/token$/, "") ?? undefined;

// Final internal issuer used by the server (Docker network)
const ISSUER_INTERNAL = ISSUER_INTERNAL_EXPLICIT ?? ISSUER_FROM_TOKEN;

// 🔍 DEBUG - dodajte console.log da vidimo šta se koristi
console.log("🔍 NextAuth Debug Info:");
console.log("AUTH_URL_PUBLIC:", AUTH_URL_PUBLIC);
console.log("TOKEN_URL:", TOKEN_URL);
console.log("USERINFO_URL:", USERINFO_URL);
console.log("ISSUER_INTERNAL_EXPLICIT:", ISSUER_INTERNAL_EXPLICIT);
console.log("ISSUER_FROM_TOKEN:", ISSUER_FROM_TOKEN);
console.log("FINAL ISSUER_INTERNAL:", ISSUER_INTERNAL);

export const authOptions: NextAuthOptions = {
  providers: [
    Keycloak({
      /**
       * FIXED: Disable discovery and explicitly set all endpoints
       */
      issuer: ISSUER_INTERNAL, // Still needed for client library
      
      // EXPLICITLY SET ALL ENDPOINTS TO AVOID DISCOVERY
      authorization: {
        url: AUTH_URL_PUBLIC!, // Browser URL (localhost)
        params: { scope: "openid profile email" }
      },
      
      token: TOKEN_URL!, // Server URL (keycloak:8080)
      userinfo: USERINFO_URL!, // Server URL (keycloak:8080)

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

  secret: process.env.NEXTAUTH_SECRET,

  // 🔍 Enable debug to see more details
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };