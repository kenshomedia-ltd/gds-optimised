import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Get token from cookies
  const token = req.cookies.get("_token")?.value;

  // Get the incoming form data
  const formData = await req.formData();

  // Forward the formData to your API endpoint
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't manually set content-type for FormData
    },
    body: formData,
  });

  const data = await res.json();

  return NextResponse.json(data, { status: 200 });
}
