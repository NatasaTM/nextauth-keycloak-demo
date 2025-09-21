import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/cookies";

const API_BASE = "http://localhost:8082";

export async function GET() {
  const token = await getAccessToken(); // 👈 async
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const r = await fetch(`${API_BASE}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
