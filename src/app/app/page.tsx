// src/app/app/page.tsx

// --- Server Component (App Router) -------------------------------------------
// We want the dashboard to always render on the server with fresh auth/session
// state (no static output or caching). That way, authorization decisions are
// made on the server and the UI never flashes unauthenticated content.
export const dynamic = "force-dynamic"; // disable static rendering and server cache
export const revalidate = 0;             // explicitly opt out of ISR for this page

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  // 1) Gatekeeping (SSR): if there is no session, redirect to our relay page.
  // The relay page immediately calls signIn("keycloak") and returns the user
  // to the requested URL. Doing this on the server avoids client-side flashes.
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  // 2) Build an origin-aware absolute base URL (works locally and in production).
  // On many hosts there can be a reverse proxy in front of Next.js, so:
  // - x-forwarded-host/proto come from the proxy
  // - host/proto are used as a fallback locally
  // We use an absolute URL to call our **own** API routes during SSR.
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const host = h.get("x-forwarded-host") ?? h.get("host")!;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  // 3) Fetch the authenticated user info through our BFF route (/api/me).
  // Important:
  // - We do NOT read or expose any access token in the browser.
  // - We forward the incoming cookies so NextAuth can read the session JWT on
  //   the server and attach the Bearer token when proxying to Spring Boot.
  // - cache: "no-store" ensures the request is never served from a cache.
  const meRes = await fetch(`${base}/api/me`, {
    cache: "no-store",
    headers: { cookie }, // forward session cookie to NextAuth in SSR context
  });

  if (!meRes.ok) {
    // Be graceful: if the backend is down or the session is invalid, show a
    // simple error box rather than crashing the page.
    return (
      <main className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="rounded-lg bg-red-100 text-red-800 px-6 py-4 shadow-md">
          API error: {meRes.status}
        </div>
      </main>
    );
  }

  const me = await meRes.json();
  const isAdmin = Array.isArray(me?.roles) && me.roles.includes("ADMIN");

  // 4) Optional: only if the user claims include ADMIN, probe the admin-only
  // endpoint to fetch extra data for the admin area. This avoids unnecessary
  // calls for non-admins and keeps the UI logic simple.
  let adminPayload: unknown = null;
  if (isAdmin) {
    const adminRes = await fetch(`${base}/api/admin/only`, {
      cache: "no-store",
      headers: { cookie },
    });
    if (adminRes.ok) {
      // Your BFF currently returns JSON (recommended). If the upstream were to
      // return text, this still won’t break due to the try/catch below.
      adminPayload = await adminRes.json().catch(() => null);
    }
  }

  // 5) Render: plain, inspectable JSON for the user block and a gated admin
  // section that only appears when both the claim and the probe succeed.
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">App Dashboard</h1>

      <section className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">User Info</h2>
        <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto text-gray-800">
          {JSON.stringify(me, null, 2)}
        </pre>
      </section>

      {isAdmin && adminPayload ? (
        <section className="rounded-xl p-6 border bg-slate-900/60 border-slate-800 text-slate-100">
          <h2 className="text-lg font-semibold mb-3">Admin area</h2>
          <pre className="text-sm overflow-x-auto">
            {typeof adminPayload === "string"
              ? adminPayload
              : JSON.stringify(adminPayload, null, 2)}
          </pre>
        </section>
      ) : null}
    </main>
  );
}
