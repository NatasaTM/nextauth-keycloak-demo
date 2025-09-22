// src/app/api/admin/only/route.ts
// BFF proxy → forwards the server-only access token to Spring's /api/admin/only

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE = process.env.BACKEND_URL ?? "http://localhost:8082";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request });
  const access = (token as any)?.accessToken;

  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const r = await fetch(`${API_BASE}/api/admin/only`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  // Some backends return text, some JSON — handle both
  const contentType = r.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await r.json() : await r.text();

  return NextResponse.json({ status: r.status, body }, { status: r.status });
}
