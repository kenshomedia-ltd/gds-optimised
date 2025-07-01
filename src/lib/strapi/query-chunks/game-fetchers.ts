// src/lib/strapi/query-chunks/game-fetchers.ts

import { strapiClient } from "../strapi-client";
import { QueryBuilder } from "./query-builder";
import type { GameData } from "@/types/game.types";

/**
 * Game fetching options interface
 */
interface GameFetchOptions {
  limit?: number;
  sortBy?: string;
  queryType?: "minimal" | "standard" | "detailed" | "homepage" | "carousel";
  gamesPerProvider?: number;
  cacheTime?: number;
}

/**
 * Filter options for games
 */
interface GameFilters {
  providers?: string[];
  categories?: string[];
  excludeDisabled?: boolean;
}

/**
 * Centralized function to fetch games by providers
 * Replaces the logic in homepage-data-loader.ts fetchGamesForProviders()
 * Now uses Query Builder for cleaner, type-safe queries
 */
export async function fetchGamesByProviders(
  providers: string[],
  options: GameFetchOptions = {}
): Promise<GameData[]> {
  const {
    limit = 24,
    sortBy = "views:desc", // Changed default to popular (views:desc)
    queryType = "homepage",
    gamesPerProvider = 8,
    cacheTime = 60,
  } = options;

  if (providers.length === 0) {
    console.warn("No providers specified for game fetching");
    return [];
  }

  try {
    // Use Query Builder for cleaner query construction
    const query = QueryBuilder.games()
      .variant(queryType)
      .where({ providers })
      .orderBy(sortBy)
      .paginate(1, Math.min(limit * 2, 100)) // Buffer for better distribution
      .build();

    const response = await strapiClient.fetchWithCache<{
      data: GameData[];
      meta: { pagination: { total: number } };
    }>("games", query, cacheTime);

    if (!response.data || response.data.length === 0) {
      console.warn(`No games found for providers: ${providers.join(", ")}`);
      return [];
    }

    // Efficient grouping using Map (same logic as before)
    const gamesByProvider = new Map<string, GameData[]>(
      providers.map((p) => [p, []])
    );

    // Single pass through games
    for (const game of response.data) {
      const providerSlug = game.provider?.slug;
      if (providerSlug && gamesByProvider.has(providerSlug)) {
        const providerGames = gamesByProvider.get(providerSlug)!;
        if (providerGames.length < gamesPerProvider) {
          providerGames.push(game);
        }
      }
    }

    // Flatten and limit results
    const allGames: GameData[] = [];
    for (const providerGames of gamesByProvider.values()) {
      allGames.push(...providerGames);
      if (allGames.length >= limit) break;
    }

    return allGames.slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch games for providers:", error);
    return [];
  }
}

/**
 * Centralized function to fetch games with flexible filtering
 * Replaces the logic in custom-page-loader.ts enrichGameCarousels()
 * Now uses Query Builder for cleaner, type-safe queries
 */
export async function fetchGamesWithFilters(
  filters: GameFilters,
  options: GameFetchOptions = {}
): Promise<GameData[]> {
  const {
    limit = 24,
    sortBy = "views:desc", // Changed default to popular (views:desc)
    queryType = "carousel",
    cacheTime = 60,
  } = options;

  const { providers = [], categories = [], excludeDisabled = false } = filters;

  // If no filters provided, return empty array
  if (providers.length === 0 && categories.length === 0) {
    console.warn("No filters specified for game fetching");
    return [];
  }

  try {
    // Use Query Builder for cleaner query construction
    const query = QueryBuilder.games()
      .variant(queryType)
      .where({
        providers: providers.length > 0 ? providers : undefined,
        categories: categories.length > 0 ? categories : undefined,
        excludeDisabled,
      })
      .orderBy(sortBy)
      .paginate(1, limit)
      .build();

    const response = await strapiClient.fetchWithCache<{
      data: GameData[];
    }>("games", query, cacheTime);

    return response.data || [];
  } catch (error) {
    console.error(`Failed to fetch games with filters:`, error);
    return [];
  }
}

/**
 * Fetch games for a specific carousel block
 * This replaces the inline logic in enrichGameCarousels
 */
export async function fetchGamesForCarousel(
  block: {
    gameProviders?: Array<{ slotProvider?: { slug?: string } }>;
    gameCategories?: Array<{ slotCategory?: { slug?: string } }>;
    numberOfGames?: number;
    sortBy?: string;
  },
  options: Pick<GameFetchOptions, "queryType" | "cacheTime"> = {}
): Promise<GameData[]> {
  const { queryType = "carousel", cacheTime = 60 } = options;

  // Extract provider and category slugs
  const providers =
    block.gameProviders
      ?.map((p) => p.slotProvider?.slug)
      .filter((slug): slug is string => Boolean(slug)) || [];

  const categories =
    block.gameCategories
      ?.map((c) => c.slotCategory?.slug)
      .filter((slug): slug is string => Boolean(slug)) || [];

  // Use the centralized fetcher
  return fetchGamesWithFilters(
    { providers, categories },
    {
      limit: block.numberOfGames || 24,
      sortBy: block.sortBy || "createdAt:desc",
      queryType,
      cacheTime,
    }
  );
}

/**
 * Utility function to extract game settings from homepage blocks
 * This can replace the extractGameSettings function in homepage-data-loader.ts
 */
export function extractGameSettingsFromBlocks(
  blocks:
    | Array<{ __component: string; [key: string]: unknown }>
    | Array<{ __component: string; id: number; [key: string]: unknown }>
): {
  providers: string[];
  totalGames: number;
  gamesQuotaPerProvider: number;
  sortBy: string;
} {
  const gameBlocks = blocks.filter(
    (block) => block.__component === "homepage.home-game-list"
  );

  if (gameBlocks.length === 0) {
    return {
      providers: [],
      totalGames: 0,
      gamesQuotaPerProvider: 6,
      sortBy: "createdAt:desc",
    };
  }

  // Aggregate from all game blocks
  const allProviders = new Set<string>();
  let totalGames = 0;
  let gamesQuotaPerProvider = 6;
  let sortBy = "createdAt:desc";

  for (const block of gameBlocks) {
    const blockProviders = (
      (block.providers as Array<{ slotProvider?: { slug?: string } }>) || []
    )
      .map((p) => p.slotProvider?.slug)
      .filter((slug): slug is string => Boolean(slug));

    blockProviders.forEach((provider) => allProviders.add(provider));

    if (typeof block.numberOfGames === "number") {
      gamesQuotaPerProvider = Math.max(
        gamesQuotaPerProvider,
        block.numberOfGames
      );
      totalGames += block.numberOfGames;
    }

    if (typeof block.sortBy === "string") {
      sortBy = block.sortBy;
    }
  }

  // If no total was calculated, use provider count * quota
  if (totalGames === 0) {
    totalGames = allProviders.size * gamesQuotaPerProvider;
  }

  return {
    providers: Array.from(allProviders),
    totalGames: totalGames || 24,
    gamesQuotaPerProvider,
    sortBy,
  };
}
