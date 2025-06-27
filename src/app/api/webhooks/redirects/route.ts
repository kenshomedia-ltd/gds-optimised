// src/app/api/webhooks/redirects/route.ts
/**
 * Webhook endpoint to handle redirect updates from Strapi
 * This allows for cache invalidation when redirects are updated
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cacheManager } from "@/lib/cache/cache-manager";

// Validate webhook secret
const WEBHOOK_SECRET = process.env.STRAPI_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get("authorization");
    if (!WEBHOOK_SECRET || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("[Webhook] Redirect update received:", body);

    // Clear redirect cache
    await cacheManager.delete("strapi:redirects:*");

    // Revalidate all pages to pick up new redirects
    // Note: In production, you might want to be more selective
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: "Redirect cache cleared successfully",
    });
  } catch (error) {
    console.error("[Webhook] Error processing redirect update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
