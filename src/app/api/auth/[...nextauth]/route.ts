// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

const authUrl     = process.env.AUTH_KEYCLOAK_AUTH_URL;      // browser → localhost
const tokenUrl    = process.env.AUTH_KEYCLOAK_TOKEN_URL;     // server (inside Docker) → keycloak:8080
const userinfoUrl = process.env.AUTH_KEYCLOAK_USERINFO_URL;  // server (inside Docker) → keycloak:8080
const issuer      = process.env.AUTH_KEYCLOAK_ISSUER;        // classic "issuer" (used when not running via compose)

export const authOptions: NextAuthOptions = {
  providers: [
    // If overrides are present, use explicit endpoints (works in Docker)
    authUrl && tokenUrl && userinfoUrl
      ? Keycloak({
          authorization: { url: authUrl, params: { scope: "openid profile email" } },
          token: { url: tokenUrl },
          userinfo: { url: userinfoUrl },
          clientId: process.env.AUTH_KEYCLOAK_ID!,
          clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
          checks: ["pkce", "state"],
          profile(p) {
            return {
              id: p.sub,
              name: p.preferred_username ?? p.name ?? p.sub,
              email: p.email,
              emailVerified: p.email_verified ?? false,
            };
          },
        })
      // Otherwise fall back to issuer (works when running everything locally without Docker)
      : Keycloak({
          issuer,
          clientId: process.env.AUTH_KEYCLOAK_ID!,
          clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
          authorization: { params: { scope: "openid profile email" } },
          checks: ["pkce", "state"],
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

  session: { strategy: "jwt" },

  // (keep your jwt/session callbacks here if already present)
  // ...
  
  secret: process.env.NEXTAUTH_SECRET,
  // Optional: enable debug to see detailed logs in `docker compose logs -f next`
  // debug: process.env.NODE_ENV !== "production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
