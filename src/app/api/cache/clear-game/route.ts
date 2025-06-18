// src/app/api/cache/clear-game/route.ts

import { NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache/cache-manager";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Slug parameter required" },
      { status: 400 }
    );
  }

  try {
    // Clear both static and dynamic caches
    const staticKey = `game-static-${slug}`;
    const dynamicKey = `game-dynamic-${slug}`;

    await Promise.all([
      cacheManager.delete(staticKey),
      cacheManager.delete(dynamicKey),
    ]);

    // Also clear any strapi client caches for games
    await cacheManager.invalidatePattern(`strapi:games:*`);

    return NextResponse.json({
      success: true,
      message: `Cache cleared for game: ${slug}`,
      cleared: [staticKey, dynamicKey, "strapi:games:*"],
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
