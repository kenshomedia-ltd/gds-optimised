import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/local`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (data.jwt) {
    const cookieStore = await cookies();
    cookieStore.set("_token", data.jwt, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 60, // 60 days
    });
  }

  return NextResponse.json(data);
}
