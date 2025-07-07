import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
  }

  const token = req.cookies.get("_token")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/upload/files/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  return NextResponse.json(data, { status: 200 });
}
