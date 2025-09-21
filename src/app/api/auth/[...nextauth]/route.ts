// src/app/api/auth/[...nextauth]/route.ts
// NextAuth.js configuration for Keycloak OIDC authentication
// This file handles all authentication routes: /api/auth/signin, /api/auth/signout, /api/auth/callback, etc.

import NextAuth, { type NextAuthOptions } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

// Export authOptions so it can be used in other parts of the application
export const authOptions: NextAuthOptions = {
  // Configure authentication providers
  providers: [
    Keycloak({
      // Keycloak server URL (e.g., "https://your-keycloak-server.com/realms/your-realm")
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
      // Client ID from Keycloak admin console
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      // Client secret from Keycloak admin console
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      
      // Define OAuth scopes - these determine what user information we request
      // "openid" is required for OIDC, "profile" gives us name/username, "email" gives us email
      authorization: { params: { scope: "openid profile email" } },
      
      // Transform Keycloak user profile data to NextAuth.js format
      // This function maps Keycloak's user data to our application's user object
      profile(p) {
        return {
          // Use Keycloak's subject ID as our user ID
          id: p.sub,
          // Prefer preferred_username, fallback to name, then to sub
          name: p.preferred_username ?? p.name ?? p.sub,
          // Email from Keycloak
          email: p.email,
          // Whether email is verified (Keycloak handles this)
          emailVerified: p.email_verified ?? false,
        };
      },
    }),
  ],

  // Use JWT strategy for sessions (stored in HTTP-only cookies)
  // This is more secure than database sessions for stateless applications
  session: { strategy: "jwt" },

  // Callbacks allow us to customize the authentication flow
  callbacks: {
    // JWT callback runs whenever a JWT is created, updated, or accessed
    // This is where we handle token refresh logic
    async jwt({ token, account }) {
      // When user first signs in, account object contains OAuth tokens
      if (account) {
        // Store access token for API calls to our backend
        token.accessToken = (account as any).access_token;
        // Store refresh token for renewing access token when it expires
        token.refreshToken = (account as any).refresh_token;

        // Keycloak returns expires_at in seconds (UNIX epoch)
        // Convert to milliseconds for JavaScript Date handling
        const expSec = (account as any).expires_at as number | undefined;
        token.expiresAt = expSec ? expSec * 1000 : undefined;
      }

      // Check if access token is about to expire (less than 60 seconds remaining)
      // If so, attempt to refresh it using the refresh token
      const msLeft =
        typeof token.expiresAt === "number" ? token.expiresAt - Date.now() : 0;

      if (msLeft < 60_000 && token.refreshToken) {
        try {
          // Prepare refresh token request body
          const body = new URLSearchParams({
            client_id: process.env.AUTH_KEYCLOAK_ID!,
            client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
            grant_type: "refresh_token",
            refresh_token: String(token.refreshToken),
          });

          // Make refresh token request to Keycloak
          const resp = await fetch(
            `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body,
            }
          );

          // If refresh fails, throw error to trigger re-authentication
          if (!resp.ok) throw new Error("Token refresh failed");

          // Parse new tokens from Keycloak response
          const data = await resp.json();
          token.accessToken = data.access_token;
          // Update refresh token if Keycloak provided a new one
          token.refreshToken = data.refresh_token ?? token.refreshToken;
          // Set new expiration time
          token.expiresAt = Date.now() + data.expires_in * 1000;
        } catch {
          // If refresh fails, clear the session
          // This will force the user to sign in again
          return {};
        }
      }

      // Return the (possibly updated) token
      return token;
    },

    // Session callback runs whenever a session is checked
    // This is where we can add custom data to the session object
    async session({ session }) {
      // Note: We don't expose accessToken to the client for security reasons
      // Access tokens should only be used server-side in API routes
      return session;
    },
  },

  // Secret used to encrypt JWT tokens
  // Should be a random string stored in environment variables
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
