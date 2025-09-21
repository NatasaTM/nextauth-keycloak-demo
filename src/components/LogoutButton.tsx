"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

/**
 * Logs the user out cleanly:
 * 1) POST to our BFF route that revokes Keycloak session via refresh_token
 * 2) NextAuth signOut() clears local session cookie and redirects home
 */
export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  const doLogout = async () => {
    try {
      setBusy(true);
      // 1) Revoke Keycloak session (server-side, uses refresh_token from NextAuth JWT)
      await fetch("/api/auth/kc-logout", { method: "POST" });
      // 2) Clear NextAuth cookie and go to home
      await signOut({ callbackUrl: "/" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className="px-3 py-2 rounded border"
      disabled={busy}
      onClick={doLogout}
    >
      {busy ? "Logging out..." : "Logout"}
    </button>
  );
}
