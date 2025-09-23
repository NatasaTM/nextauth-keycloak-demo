"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

/**
 * Clean logout UX:
 * 1) Revoke Keycloak client session (server-side) via refresh_token
 * 2) Clear local NextAuth session and redirect home
 *
 * Even if revocation fails, we still signOut to clear the local session.
 */
export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  const doLogout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/kc-logout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
      }).catch(() => { /* ignore network errors, still sign out */ });
    } finally {
      // Clear NextAuth session regardless of revocation result
      await signOut({ callbackUrl: "/" });
      setBusy(false);
    }
  };

  return (
    <button
    type="button"
    onClick={doLogout}
    disabled={busy}
    aria-busy={busy}
    className="
      inline-flex items-center gap-2
      
      bg-slate-900/40  text-sm
      transition-colors
       text-slate-300 hover:text-indigo-300
      cursor-pointer disabled:cursor-not-allowed disabled:opacity-60
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
    "
    title="Logout"
  >
    {busy ? "Logging out..." : "Logout"}
  </button>
);
}
