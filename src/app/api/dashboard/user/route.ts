// app/api/user/route.ts

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  const token = req.cookies.get("_token")?.value;

  const res = await fetch(`${API_URL}/api/users/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("_token")?.value;
  const payload = await req.json();

  const res = await fetch(`${API_URL}/api/user/me/update`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: payload }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}
