// src/app/api/me/route.ts
// This is a Backend-for-Frontend (BFF) proxy route.
// It takes the access token stored in the NextAuth JWT (server-side only),
// and uses it to call the protected Spring Boot API (`/api/me`).
// The browser never sees the access token directly.

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Backend API base URL. In production, replace with your API domain or Docker service name.
const API_BASE = process.env.BACKEND_URL ?? "http://localhost:8082";

export async function GET(request: NextRequest) {
  // 1) Extract the NextAuth JWT from the incoming request cookies.
  //    `getToken` automatically decrypts the JWT and gives us our custom fields.
  //    With next-auth v4, we must pass { req }.
  const token = await getToken({ req: request });

  // 2) Read the access token we stored earlier in the jwt() callback of [...nextauth]/route.ts
  const access = (token as any)?.accessToken;

  // 3) If no access token exists, the user is not authenticated → return 401
  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 4) Forward the request to the Spring Boot backend API,
  //    adding the Bearer token in the Authorization header.
  const r = await fetch(`${API_BASE}/api/me`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store", // always fetch fresh data (no Next.js cache)
  });

  // 5) Parse the response from Spring Boot and forward it back to the client.
//    Add protection in case backend doesn't return JSON (e.g. 401 with HTML).
const contentType = r.headers.get("content-type") ?? "";

if (!contentType.includes("application/json")) {
  const text = await r.text();
  return NextResponse.json(
    { error: "Invalid JSON response from backend", raw: text },
    { status: r.status }
  );
}

const data = await r.json();
return NextResponse.json(data, { status: r.status });
}

