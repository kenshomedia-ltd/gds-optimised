// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { strapiClient } from "@/lib/strapi/strapi-client";

export async function GET() {
  try {
    // Test Strapi connection
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL}/api`,
      {
        headers: {
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_API_TOKEN || process.env.PUBLIC_API_TOKEN
          }`,
        },
      }
    );

    const isHealthy = response.ok;
    const contentType = response.headers.get("content-type");

    // Test Redis connection
    let redisHealthy = false;
    try {
      await strapiClient.invalidateCache("health-check");
      redisHealthy = true;
    } catch (error) {
      console.error("Redis health check failed:", error);
    }

    return NextResponse.json({
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        strapi: {
          status: isHealthy ? "up" : "down",
          url: process.env.NEXT_PUBLIC_API_URL || "not configured",
          contentType,
        },
        redis: {
          status: redisHealthy ? "up" : "down",
        },
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
