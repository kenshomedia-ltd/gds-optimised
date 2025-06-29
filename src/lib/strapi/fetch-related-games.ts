// src/lib/strapi/fetch-related-games.ts

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getGames } from "@/app/actions/games";
import { cacheManager } from "@/lib/cache/cache-manager";
import type { GameData } from "@/types/game.types";

/**
 * Cache configuration for related games
 */
const CACHE_CONFIG = {
  ttl: 300, // 5 minutes
  tags: ["related-games", "games"],
};

/**
 * Fetch related games from the same provider
 * Excludes the current game from results
 */
const fetchRelatedGamesCached = cache(
  async (
    providerSlug: string,
    currentGameSlug: string,
    limit: number = 6
  ): Promise<GameData[]> => {
    const cacheKey = `related-games:${providerSlug}:exclude-${currentGameSlug}:${limit}`;

    try {
      // Try to get from Redis cache first
      const cached = await cacheManager.get<GameData[]>(cacheKey);
      if (cached.data) {
        console.log(`Related games cache hit for provider: ${providerSlug}`);
        return cached.data;
      }

      // Use the getGames server action with provider filter
      const filters = {
        provider: {
          slug: {
            $eq: providerSlug,
          },
        },
      };

      const response = await getGames({
        page: 1,
        pageSize: limit + 2, // Fetch extra to account for current game
        sortBy: "Top Rated", // This will sort by ratingAvg:desc
        filters,
      });

      // Filter out the current game and take only the requested number
      const filteredGames = response.games
        .filter((game) => game.slug !== currentGameSlug)
        .slice(0, limit);

      // Cache the result
      await cacheManager.set(cacheKey, filteredGames, {
        ttl: CACHE_CONFIG.ttl,
        swr: CACHE_CONFIG.ttl * 2,
      });

      return filteredGames;
    } catch (error) {
      console.error(
        `Failed to fetch related games for provider ${providerSlug}:`,
        error
      );
      return [];
    }
  }
);

/**
 * Next.js unstable_cache wrapper for persistent caching
 */
const fetchRelatedGamesPersistent = unstable_cache(
  async (providerSlug: string, currentGameSlug: string, limit: number = 6) => {
    return fetchRelatedGamesCached(providerSlug, currentGameSlug, limit);
  },
  ["related-games"],
  {
    revalidate: CACHE_CONFIG.ttl,
    tags: CACHE_CONFIG.tags,
  }
);

/**
 * Main function to fetch related games
 * Uses multi-layer caching for optimal performance
 */
export async function fetchRelatedGames(
  providerSlug: string,
  currentGameSlug: string,
  limit: number = 6,
  options: { cached?: boolean } = { cached: true }
): Promise<GameData[]> {
  if (options.cached) {
    return fetchRelatedGamesPersistent(providerSlug, currentGameSlug, limit);
  }

  // Direct fetch without persistent cache
  return fetchRelatedGamesCached(providerSlug, currentGameSlug, limit);
}
