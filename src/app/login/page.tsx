// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-lg p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 grid place-items-center rounded-full bg-indigo-100 text-indigo-700 text-2xl">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Use your Keycloak account to access the app.
          </p>
        </div>

        <button
          onClick={async () => {
            setLoading(true);
            await signIn("keycloak", { callbackUrl: "/app" });
            setLoading(false);
          }}
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-lg px-4 py-3 font-medium
                     bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800
                     disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "Redirecting…" : "Continue with Keycloak"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Back to{" "}
          <a
            href="/"
            className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Home
          </a>
        </p>
      </div>
    </main>
  );
}

