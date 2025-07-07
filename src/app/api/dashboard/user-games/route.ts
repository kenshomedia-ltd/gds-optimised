import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-favourite-games`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        {
          error: "Failed to fetch user favourite games",
          status: res.status,
          details: errorText,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching favourite games:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { games } = await req.json();

    const body = {
      data: {
        games,
      },
    };
    console.log("body", body);

    const token = req.cookies.get("_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-favourite-games`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error syncing user favourite games:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const favoriteId = searchParams.get("favoriteId");

    if (!favoriteId) {
      return NextResponse.json(
        { error: "Missing favoriteId" },
        { status: 400 }
      );
    }

    const token = req.cookies.get("_token")?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-favourite-games/${favoriteId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("delete data", res);
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 }); // ✅ no body
    }
    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error deleting user favourite game:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
