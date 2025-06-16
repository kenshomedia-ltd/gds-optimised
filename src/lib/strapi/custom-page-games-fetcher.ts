// src/lib/strapi/custom-page-games-fetcher.ts

import { strapiClient } from "./strapi-client";
import type { GamesCarouselBlock } from "@/types/dynamic-block.types";
import type { GameData } from "@/types/game.types";
import type { CustomPageBlock } from "@/types/custom-page.types";

// Map sortBy values to Strapi sort parameters
const SORT_BY_MAP: Record<string, string> = {
  "Most Popular": "views:desc,ratingAvg:desc",
  Newest: "createdAt:desc",
  Rating: "ratingAvg:desc",
  Alphabetical: "title:asc",
  // Italian mappings
  nuove: "createdAt:desc",
  az: "title:asc",
  za: "title:desc",
  giocati: "views:desc",
  votate: "ratingAvg:desc",
} as const;

/**
 * Fetch games for a games carousel block
 *
 * This function fetches games based on the block's configuration
 * including provider and category filters
 */
async function fetchGamesForCarousel(
  block: GamesCarouselBlock
): Promise<GameData[]> {
  const numberOfGames = block.numberOfGames || 24;
  const sortBy = SORT_BY_MAP[block.sortBy || "Newest"] || "createdAt:desc";

  // Build filters based on block configuration
  const filters: Record<string, unknown> = {};

  // Add provider filters if specified
  if (block.gameProviders && block.gameProviders.length > 0) {
    const providerSlugs = block.gameProviders
      .map((p) => p.slotProvider?.slug)
      .filter(Boolean);

    if (providerSlugs.length > 0) {
      filters.provider = {
        slug: { $in: providerSlugs },
      };
    }
  }

  // Add category filters if specified
  if (block.gameCategories && block.gameCategories.length > 0) {
    const categorySlugs = block.gameCategories
      .map((c) => c.slotCategory?.slug)
      .filter(Boolean);

    if (categorySlugs.length > 0) {
      filters.categories = {
        slug: { $in: categorySlugs },
      };
    }
  }

  try {
    // Build the query
    const query = {
      fields: [
        "title",
        "slug",
        "ratingAvg",
        "ratingCount",
        "createdAt",
        "views",
        "publishedAt",
        "isGameDisabled",
        "gameDisableText",
      ],
      populate: {
        images: {
          fields: ["url", "alternativeText", "width", "height"],
        },
        provider: {
          fields: ["title", "slug"],
        },
        categories: {
          fields: ["title", "slug"],
        },
      },
      filters,
      sort: [sortBy],
      pagination: {
        pageSize: numberOfGames,
        page: 1,
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: GameData[];
      meta: { pagination: { total: number } };
    }>("games", query, 60); // Cache for 1 minute

    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch games for carousel:", error);
    return [];
  }
}

/**
 * Enrich custom page blocks with games data
 *
 * This function looks for games.games-carousel blocks and fetches
 * the appropriate games data for each one
 */
export async function enrichCustomPageBlocksWithGames(
  blocks: CustomPageBlock[]
): Promise<CustomPageBlock[]> {
  // Find all games carousel blocks
  const gamesCarouselBlocks = blocks.filter(
    (block): block is GamesCarouselBlock =>
      block.__component === "games.games-carousel"
  );

  if (gamesCarouselBlocks.length === 0) {
    return blocks;
  }

  // Fetch games for each carousel block in parallel
  const gamesPromises = gamesCarouselBlocks.map((block) =>
    fetchGamesForCarousel(block)
  );

  const gamesResults = await Promise.all(gamesPromises);

  // Create a map of block id to games
  const blockGamesMap = new Map<number, GameData[]>();
  gamesCarouselBlocks.forEach((block, index) => {
    blockGamesMap.set(block.id, gamesResults[index]);
  });

  // Return blocks with enriched games data
  return blocks.map((block) => {
    if (
      block.__component === "games.games-carousel" &&
      blockGamesMap.has(block.id)
    ) {
      return {
        ...block,
        games: blockGamesMap.get(block.id),
      } as GamesCarouselBlock;
    }
    return block;
  });
}
