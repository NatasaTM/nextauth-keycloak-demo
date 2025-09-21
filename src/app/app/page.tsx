// src/app/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AppHome() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // Fetch user data with proper authentication
  const r = await fetch(`${process.env.NEXTAUTH_URL}/api/me`, { 
    cache: "no-store"
  });
  
  if (!r.ok) return <main className="p-8">API error: {r.status}</main>;
  
  const data = await r.json();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">App</h1>
      <p>Welcome, {session.user?.name}!</p>
      <pre className="p-4 bg-gray-100 rounded">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
  