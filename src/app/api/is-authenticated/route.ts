import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookies = req.cookies;
  const authCookie = cookies.get("_token")?.value;

  const res = NextResponse.json(
    {
      isAuthenticated: !!authCookie,
    },
    {
      status: 200,
    }
  );

  return res;
}
