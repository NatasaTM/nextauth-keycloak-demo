import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AppHome() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const h = await headers();
  const cookie = h.get("cookie") ?? "";

  const r = await fetch("http://localhost:3000/api/me", {
    cache: "no-store",
    headers: { cookie },
  });

  if (!r.ok) {
    return (
      <main className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <div className="rounded-lg bg-red-100 text-red-800 px-6 py-4 shadow-md">
          API error: {r.status}
        </div>
      </main>
    );
  }

  const data = await r.json();

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">App Dashboard</h1>

      <div className="mb-8">
        <p className="text-lg">
          Welcome,&nbsp;
          <span className="font-semibold text-indigo-600">
            {session.user?.name ?? session.user?.email}
          </span>
          !
        </p>
      </div>

      {/* User info card */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">User Info</h2>
        <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto text-gray-800">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </main>
  );
}
