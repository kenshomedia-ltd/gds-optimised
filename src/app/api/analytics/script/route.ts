// app/api/analytics/script/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch the Swetrix script from their CDN
    const response = await fetch("https://swetrix.org/swetrix.js", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NextJS-Proxy/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch script: ${response.status}`);
    }

    const script = await response.text();

    // Modify the script to use our proxy endpoint
    const modifiedScript = script.replace(
      /https:\/\/api\.swetrix\.com\/log/g,
      "/api/analytics/log"
    );

    return new NextResponse(modifiedScript, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error proxying Swetrix script:", error);

    return new NextResponse("// Error loading analytics script", {
      status: 500,
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  }
}
