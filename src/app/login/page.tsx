// src/app/login/page.tsx
"use client";
import { signIn } from "next-auth/react";

// Simple login page with a "Sign in with Keycloak" button.
// In production, this is the recommended way: call signIn("keycloak")
// and let NextAuth handle PKCE, state, nonce, and the OIDC flow.
export default function LoginPage() {
  return (
    <main className="p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Sign in</h1>

      {/* Clicking this button will redirect to Keycloak */}
      <button
        className="px-4 py-2 rounded border"
        onClick={() => signIn("keycloak", { callbackUrl: "/app" })}
      >
        Continue with Keycloak
      </button>
    </main>
  );
}
