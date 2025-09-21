// src/app/api/update/route.ts
// Example POST route that proxies a request to the Spring Boot backend.
// Demonstrates how to forward JSON body and use the access token
// without ever exposing it to the browser.
//All mutating API requests (POST/PUT/DELETE) should go through a BFF proxy route like this. The access token is attached server-side, 
// never sent from the browser

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE = process.env.BACKEND_URL ?? "http://localhost:8082";

export async function POST(request: NextRequest) {
  // Extract NextAuth JWT
  const token = await getToken({ req: request });
  const access = (token as any)?.accessToken;

  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Parse the incoming JSON body from the browser
  const body = await request.json();

  // Forward the request to the Spring Boot backend
  const r = await fetch(`${API_BASE}/api/update`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // Return backend response back to the client
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
