import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies(); // 👈 force-await to satisfy TS
  const token = cookieStore.get("oidc_access_token")?.value;

  if (!token) {
    return <p>No session. Please <a href="/api/auth/login">log in</a>.</p>;
  }

  const res = await fetch("http://localhost:3000/api/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return <p>Unauthorized. Please <a href="/api/auth/login">log in</a> again.</p>;
  }

  const user = await res.json();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.preferred_username}!</p>
      <p>Email: {user.email}</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
