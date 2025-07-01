// src/lib/strapi/query-chunks/casino-fetchers.ts

import { strapiClient } from "../strapi-client";
import { casinoTableQueryChunk } from "./shared-chunks";
import { QueryBuilder } from "./query-builder";
import type { CasinoData } from "@/types/casino.types";

/**
 * Casino fetching options interface
 */
interface CasinoFetchOptions {
  limit?: number;
  sortBy?: string;
  queryType?: "basic" | "standard" | "detailed" | "table";
  cacheTime?: number;
  country?: string;
}

/**
 * Filter options for casinos
 */
interface CasinoFilters {
  providers?: string[];
  country?: string;
  excludeInactive?: boolean;
  minRating?: number;
}

/**
 * Enhanced casino query chunks to match different use cases
 */
export const casinoQueryChunk = {
  // Basic for simple lists and cards
  basic: {
    fields: ["title", "slug", "ratingAvg"],
    populate: {
      images: { fields: ["url", "width", "height"] },
      casinoBonus: { fields: ["bonusLabel"] },
    },
  },

  // Standard for most listing use cases (matches homepage pattern)
  standard: {
    fields: [
      "title",
      "slug",
      "ratingAvg",
      "ratingCount",
      "publishedAt",
      "Badges",
    ],
    populate: {
      images: {
        fields: ["url", "width", "height"],
      },
      casinoBonus: {
        fields: ["bonusUrl", "bonusLabel", "bonusCode"],
      },
      noDepositSection: {
        fields: ["bonusAmount", "termsConditions"],
      },
      freeSpinsSection: {
        fields: ["bonusAmount", "termsConditions"],
      },
      termsAndConditions: {
        fields: ["copy", "gambleResponsibly"],
      },
      bonusSection: {
        fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
      },
    },
  },

  // Detailed for full casino pages (uses existing casinoTableQueryChunk)
  detailed: casinoTableQueryChunk(true),

  // Table format for casino comparison tables
  table: casinoTableQueryChunk(false),
};

/**
 * Centralized function to fetch casinos for homepage
 * Replaces the inline casino query in homepage-data-loader.ts
 * Now uses Query Builder for cleaner, type-safe queries
 */
export async function fetchCasinosForHomepage(
  options: CasinoFetchOptions = {}
): Promise<CasinoData[]> {
  const {
    limit = 10,
    sortBy = "ratingAvg:desc",
    queryType = "standard",
    cacheTime = 600, // 10 minutes default for casinos
    country,
  } = options;

  try {
    // Use Query Builder for cleaner query construction
    const query = QueryBuilder.casinos()
      .variant(queryType)
      .where({
        excludeInactive: true,
        country,
      })
      .orderBy(sortBy)
      .paginate(1, limit)
      .build();

    const response = await strapiClient.fetchWithCache<{
      data: CasinoData[];
      meta: { pagination: { total: number } };
    }>("casinos", query, cacheTime);

    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch casinos for homepage:", error);
    return [];
  }
}

/**
 * Centralized function to fetch casinos with flexible filtering
 * For use in custom pages and advanced filtering scenarios
 * Now uses Query Builder for cleaner, type-safe queries
 */
export async function fetchCasinosWithFilters(
  filters: CasinoFilters,
  options: CasinoFetchOptions = {}
): Promise<CasinoData[]> {
  const {
    limit = 20,
    sortBy = "ratingAvg:desc",
    queryType = "standard",
    cacheTime = 600,
  } = options;

  const {
    providers = [],
    country,
    excludeInactive = false,
    minRating,
  } = filters;

  try {
    // Use Query Builder for cleaner query construction
    const query = QueryBuilder.casinos()
      .variant(queryType)
      .where({
        providers: providers.length > 0 ? providers : undefined,
        country,
        excludeInactive,
        minRating,
      })
      .orderBy(sortBy)
      .paginate(1, limit)
      .build();

    const response = await strapiClient.fetchWithCache<{
      data: CasinoData[];
    }>("casinos", query, cacheTime);

    return response.data || [];
  } catch (error) {
    console.error(`Failed to fetch casinos with filters:`, error);
    return [];
  }
}

/**
 * Fetch casinos for a specific casino list block
 * This can be used in custom page casino blocks
 */
export async function fetchCasinosForBlock(
  block: {
    showCasinoTableHeader?: boolean;
    casinosList?: Array<{ casino?: CasinoData }>;
    maxCasinos?: number;
  },
  options: Pick<CasinoFetchOptions, "queryType" | "cacheTime" | "country"> = {}
): Promise<CasinoData[]> {
  const { queryType = "table", cacheTime = 600, country } = options;

  // If casinos are already provided in the block, return them
  if (block.casinosList && block.casinosList.length > 0) {
    return block.casinosList
      .map((item) => item.casino)
      .filter((casino): casino is CasinoData => Boolean(casino));
  }

  // Otherwise fetch top casinos
  return fetchCasinosForHomepage({
    limit: block.maxCasinos || 10,
    queryType,
    cacheTime,
    country,
  });
}

/**
 * Utility function to extract casino settings from homepage blocks
 * Similar to the game settings extractor
 */
export function extractCasinoSettingsFromBlocks(
  blocks: Array<{ __component: string; [key: string]: unknown }>
): {
  hasCasinoBlock: boolean;
  maxCasinos: number;
  sortBy: string;
} {
  const casinoBlocks = blocks.filter(
    (block) => block.__component === "homepage.home-casino-list"
  );

  if (casinoBlocks.length === 0) {
    return {
      hasCasinoBlock: false,
      maxCasinos: 10,
      sortBy: "ratingAvg:desc",
    };
  }

  // Aggregate from all casino blocks
  let maxCasinos = 10;
  let sortBy = "ratingAvg:desc";

  for (const block of casinoBlocks) {
    if (typeof block.maxCasinos === "number") {
      maxCasinos = Math.max(maxCasinos, block.maxCasinos);
    }

    if (typeof block.sortBy === "string") {
      sortBy = block.sortBy;
    }
  }

  return {
    hasCasinoBlock: true,
    maxCasinos,
    sortBy,
  };
}
