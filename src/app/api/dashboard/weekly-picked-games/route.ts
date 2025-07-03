import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pick-of-the-weeks`,
      {
        headers,
      }
    );

    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
