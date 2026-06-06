import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const body = await request.json();
  
  const res = await fetch(`http://localhost:8080/auth/${pathStr}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return new NextResponse(text, { 
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "text/plain" }
  });
}