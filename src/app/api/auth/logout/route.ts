import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({}, { status: 200 });

  // Delete cookies by setting them with an expired date
  response.cookies.set("_token", "", {
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set("_ppToken", "", {
    path: "/",
    expires: new Date(0),
  });

  return response;
}
