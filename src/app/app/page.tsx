import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AppHome() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const h = await headers();

  const cookie = h.get("cookie") ?? "";
  const host = h.get("x-forwarded-host") ?? h.get("host")!;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  // 1) User info
  const meRes = await fetch(`${base}/api/me`, { cache: "no-store", headers: { cookie } });
  if (!meRes.ok) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="rounded-lg bg-red-100 text-red-800 px-6 py-4 shadow-md">
          API error: {meRes.status}
        </div>
      </main>
    );
  }
  const me = await meRes.json();

  // 2) Determine admin from claims
  const isAdminByClaims = Array.isArray(me?.roles) && me.roles.includes("ADMIN");

  // 3) If (and only if) admin by claims, probe the admin endpoint
  let adminOk = false;
  let adminBody: string | unknown = null;
  if (isAdminByClaims) {
    const adminRes = await fetch(`${base}/api/admin/only`, {
      cache: "no-store",
      headers: { cookie },
    });
    adminOk = adminRes.status === 200;

    // Your BFF wraps Spring’s response as { status, body }
    const payload = await adminRes.json().catch(() => null);
    adminBody = payload?.body ?? null;
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">App Dashboard</h1>

      <div className="mb-8">
        <p className="text-lg">
          Welcome,{" "}
          <span className="font-semibold text-indigo-400">
            {session.user?.name ?? session.user?.email}
          </span>
          !
        </p>
      </div>

      {/* User info */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">User Info</h2>
        <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto text-gray-800">
          {JSON.stringify(me, null, 2)}
        </pre>
      </div>

      {/* Admin-only content: render ONLY when claims say ADMIN and probe succeeded */}
      {isAdminByClaims && adminOk ? (
        <div className="rounded-xl p-6 border bg-slate-900/60 border-slate-800 text-slate-100">
          <h2 className="text-lg font-semibold mb-3">Admin area</h2>
          <pre className="text-sm overflow-x-auto">
            {typeof adminBody === "string" ? adminBody : JSON.stringify(adminBody, null, 2)}
          </pre>
        </div>
      ) : null}
    </main>
  );
}
