// app/api/analytics/log/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const searchParams = request.nextUrl.searchParams;

    // Forward the request to Swetrix
    const swetrixUrl = new URL("https://api.swetrix.com/log");

    // Copy all query parameters
    searchParams.forEach((value, key) => {
      swetrixUrl.searchParams.set(key, value);
    });

    const response = await fetch(swetrixUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type":
          request.headers.get("Content-Type") || "application/json",
        "User-Agent": request.headers.get("User-Agent") || "NextJS-Proxy/1.0",
        "X-Forwarded-For":
          request.headers.get("X-Forwarded-For") ||
          request.headers.get("CF-Connecting-IP") ||
          request.ip ||
          "unknown",
        "CF-IPCountry": request.headers.get("CF-IPCountry") || "unknown",
      },
      body: body || undefined,
    });

    const responseData = await response.text();

    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error proxying analytics request:", error);

    return new NextResponse("Error", {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Forward GET requests (for noscript tracking)
    const swetrixUrl = new URL("https://api.swetrix.com/log/noscript");

    searchParams.forEach((value, key) => {
      swetrixUrl.searchParams.set(key, value);
    });

    const response = await fetch(swetrixUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": request.headers.get("User-Agent") || "NextJS-Proxy/1.0",
        "X-Forwarded-For":
          request.headers.get("X-Forwarded-For") ||
          request.headers.get("CF-Connecting-IP") ||
          request.ip ||
          "unknown",
        "CF-IPCountry": request.headers.get("CF-IPCountry") || "unknown",
      },
    });

    const responseData = await response.arrayBuffer();

    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error proxying noscript request:", error);

    // Return a 1x1 transparent GIF as fallback
    const transparentGif = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
      0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
    ]);

    return new NextResponse(transparentGif, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
