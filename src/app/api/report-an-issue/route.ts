// app/api/reportAnIssue/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.json();

  const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${apiURL}/api/report-forms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  return NextResponse.json({ ...data });
}
