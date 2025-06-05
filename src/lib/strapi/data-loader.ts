// src/lib/strapi/data-loader.ts
import { cache } from "react";
import { strapiClient, REVALIDATE_TIMES } from "./strapi-client";
import type { LayoutDataResponse } from "@/types/strapi.types";
import { unstable_cache } from "next/cache";

/**
 * React cache for deduplicating requests within a single render
 */
const getLayoutDataCached = cache(async () => {
  try {
    const [layout, navigation, translations] = await Promise.all([
      strapiClient.getLayoutCritical(),
      strapiClient.getNavigation(),
      strapiClient.getTranslations(),
    ]);

    const data: LayoutDataResponse = {
      layout,
      navigation,
      translations,
    };

    return data;
  } catch (error) {
    console.error("Failed to fetch layout data:", error);
    throw error;
  }
});

/**
 * Next.js unstable_cache for persistent caching across requests
 */
const getLayoutDataPersistent = unstable_cache(
  async () => {
    return getLayoutDataCached();
  },
  ["layout-data"],
  {
    revalidate: REVALIDATE_TIMES.layout,
    tags: ["layout", "navigation", "translations"],
  }
);

/**
 * Main layout data loader with multiple caching layers
 */
export async function getLayoutData(
  options: {
    cached?: boolean;
  } = {}
): Promise<LayoutDataResponse> {
  const usePersistentCache = options.cached !== false;

  // Use persistent cache by default
  if (usePersistentCache) {
    return await getLayoutDataPersistent();
  }

  // Direct fetch without persistent cache (still uses React cache)
  return await getLayoutDataCached();
}

/**
 * Prefetch layout data for specific routes
 */
export async function prefetchLayoutData() {
  try {
    await strapiClient.prefetchCriticalData();
  } catch (error) {
    console.error("Prefetch error:", error);
  }
}

/**
 * Get game data with caching
 */
export const getGameBySlug = unstable_cache(
  async (slug: string) => {
    return strapiClient.getGameBySlug(slug);
  },
  ["game-detail"],
  {
    revalidate: REVALIDATE_TIMES.gameDetail,
    tags: ["games"],
  }
);

/**
 * Get games list with caching
 */
export const getGames = unstable_cache(
  async (options: Parameters<typeof strapiClient.getGames>[0]) => {
    return strapiClient.getGames(options);
  },
  ["games-list"],
  {
    revalidate: REVALIDATE_TIMES.games,
    tags: ["games"],
  }
);

/**
 * Get popular games with caching
 */
export const getPopularGames = unstable_cache(
  async (limit: number = 10) => {
    return strapiClient.getPopularGames(limit);
  },
  ["popular-games"],
  {
    revalidate: REVALIDATE_TIMES.games,
    tags: ["games", "popular"],
  }
);

/**
 * Get new games with caching
 */
export const getNewGames = unstable_cache(
  async (limit: number = 10) => {
    return strapiClient.getNewGames(limit);
  },
  ["new-games"],
  {
    revalidate: REVALIDATE_TIMES.games,
    tags: ["games", "new"],
  }
);

/**
 * Revalidate specific cache tags
 * This can be called from API routes or server actions
 */
export async function revalidateLayoutCache() {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("layout");
  revalidateTag("navigation");
  revalidateTag("translations");
}

export async function revalidateGameCache() {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("games");
}

/**
 * Helper to invalidate Redis cache patterns
 * Useful for webhook handlers when content updates
 */
export async function invalidateRedisCache(pattern: string) {
  await strapiClient.invalidateCache(pattern);
}
