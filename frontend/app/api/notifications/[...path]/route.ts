import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const token = request.headers.get("Authorization");
  
  const res = await fetch(`http://localhost:8080/api/notifications/${pathStr}`, {
    headers: {
      Authorization: token || "",
    },
  });

  if (!res.ok) {
    return NextResponse.json({}, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const token = request.headers.get("Authorization");
  
  const res = await fetch(`http://localhost:8080/api/notifications/${pathStr}`, {
    method: "PUT",
    headers: {
      Authorization: token || "",
    },
  });

  return NextResponse.json({}, { status: res.status });
}