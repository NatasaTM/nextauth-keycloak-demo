// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [authLoading, setAuthLoading] = useState(false);

  // Display name or fallback to email
  const nameOrEmail = session?.user?.name ?? session?.user?.email ?? null;

  // Generate initials for avatar (first two characters of name/email)
  const initials =
    nameOrEmail
      ?.split(/[.@\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") ?? "";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          <nav className="flex items-center gap-5 text-sm">
            <Link
              className="font-semibold text-slate-100 hover:text-indigo-300"
              href="/"
            >
              Home
            </Link>

            {/* If session is still loading, show placeholder */}
            {status === "loading" ? (
              <span className="text-slate-400">…</span>
            ) : session ? (
              // If user is signed in
              <>
                <Link
                  className="text-slate-300 hover:text-indigo-300"
                  href="/app"
                >
                  App
                </Link>
                <LogoutButton />
              </>
            ) : (
              // If user is NOT signed in
              <>
                {/* Direct login: opens Keycloak login screen */}
                <button
                  onClick={async () => {
                    setAuthLoading(true);
                    await signIn("keycloak", { callbackUrl: "/app" });
                  }}
                  disabled={authLoading}
                  className="text-slate-300 hover:text-indigo-300 disabled:opacity-60"
                >
                  {authLoading ? "Redirecting…" : "Login"}
                </button>

                {/* Register button is optional: 
                    With Keycloak, registration is usually enabled on the login page,
                    so you may not need a separate link here */}
              </>
            )}
          </nav>

          {/* Right side: user info or fallback */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {nameOrEmail ? (
              <>
                <span className="hidden sm:inline">
                  Signed in as{" "}
                  <span className="font-medium text-slate-200">
                    {nameOrEmail}
                  </span>
                </span>
                <div className="grid h-7 w-7 place-items-center rounded-full bg-indigo-600 text-white text-[11px] font-semibold">
                  {initials}
                </div>
              </>
            ) : (
              <span>Not signed in</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
