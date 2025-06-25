// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache/cache-manager";

export async function GET() {
  const debugInfo: Record<string, unknown> = {};

  try {
    // Capture environment info for debugging
    debugInfo.environment = {
      NODE_ENV: process.env.NODE_ENV,
      REDIS_HOST: process.env.REDIS_HOST || "NOT_SET",
      REDIS_PORT: process.env.REDIS_PORT || "NOT_SET",
      // Don't log the password for security
      REDIS_PASSWORD: process.env.REDIS_PASSWORD ? "SET" : "NOT_SET",
      STRAPI_URL:
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.PUBLIC_API_URL ||
        "NOT_SET",
    };

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

    // Test Redis connection with better error handling
    let redisHealthy = false;
    let redisError = null;

    try {
      // Try a simple set/get operation
      const testKey = "health-check-test";
      const testValue = new Date().toISOString();

      await cacheManager.set(
        testKey,
        { timestamp: testValue },
        { ttl: 10, swr: 20 }
      );
      const result = await cacheManager.get<{ timestamp: string }>(testKey);

      redisHealthy = result.data?.timestamp === testValue;

      if (redisHealthy) {
        // Clean up test key
        await cacheManager.delete(testKey);
      }
    } catch (error) {
      console.error("Redis health check failed:", error);
      redisError = error instanceof Error ? error.message : "Unknown error";
    }

    return NextResponse.json({
      status: isHealthy && redisHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      debug: debugInfo,
      services: {
        strapi: {
          status: isHealthy ? "up" : "down",
          url:
            process.env.NEXT_PUBLIC_API_URL ||
            process.env.PUBLIC_API_URL ||
            "not configured",
          contentType,
        },
        redis: {
          status: redisHealthy ? "up" : "down",
          error: redisError,
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
        debug: debugInfo,
      },
      { status: 503 }
    );
  }
}
