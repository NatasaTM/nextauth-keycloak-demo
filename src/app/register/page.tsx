// src/app/register/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [busy, setBusy] = useState(false);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl p-8 text-slate-100">
        <h1 className="text-2xl font-bold mb-4">Create account</h1>
        <p className="text-slate-300 mb-6">You’ll be redirected to Keycloak to register.</p>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            // 2nd arg = callback; 3rd arg = authorization params -> kc_action=register
            await signIn("keycloak", { callbackUrl: "/app" }, { kc_action: "register" });
            setBusy(false);
          }}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Redirecting…" : "Continue to Keycloak"}
        </button>
      </div>
    </main>
  );
}
