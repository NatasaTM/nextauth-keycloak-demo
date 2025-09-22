// src/app/auth/login/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AuthLoginRelay() {
  // Read ?callbackUrl=... so we can return the user back after login
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/app";

  useEffect(() => {
    // Immediately trigger NextAuth → Keycloak without showing the interstitial page
    signIn("keycloak", { callbackUrl });
  }, [callbackUrl]);

  // Optional tiny loader for UX while redirect happens
  return (
    <main className="min-h-[60vh] grid place-items-center p-8 text-slate-200">
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 px-6 py-4 shadow">
        Redirecting to Keycloak…
      </div>
    </main>
  );
}
