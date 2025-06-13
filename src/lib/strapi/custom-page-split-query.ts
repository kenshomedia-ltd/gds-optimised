// src/lib/strapi/custom-page-split-query.ts

import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import { cacheManager } from "@/lib/cache/cache-manager";
import type {
  CustomPageData,
  CustomPageMetadata,
} from "@/types/custom-page.types";
import type {
  GameData,
  CasinoData,
  GamesListResponse,
} from "@/types/strapi.types";
import type { NewAndLovedSlotsBlock } from "@/types/new-and-loved-slots.types";

// Cache configuration for different parts
const CACHE_CONFIG = {
  structure: { ttl: 600, swr: 1200, tags: ["custom-page-structure"] }, // 10min/20min
  games: { ttl: 60, swr: 180, tags: ["custom-page-games"] }, // 1min/3min
  casinos: { ttl: 300, swr: 600, tags: ["custom-page-casinos"] }, // 5min/10min
  metadata: { ttl: 600, swr: 1200, tags: ["custom-page-meta"] }, // 10min/20min
};

/**
 * Normalize path by removing leading and trailing slashes
 */
function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

/**
 * Interface for dynamic games data keyed by block ID
 */
interface DynamicGamesData {
  [blockId: string]: {
    newGames?: GameData[];
    popularGames?: GameData[];
    games?: GameData[];
  };
}

/**
 * Fetch games for NewAndLovedSlots blocks
 */
async function fetchNewAndLovedSlotsGames(
  block: NewAndLovedSlotsBlock
): Promise<{ newGames: GameData[]; popularGames: GameData[] }> {
  console.log("Fetching games for NewAndLovedSlots block:", block.id);

  // Extract provider and category IDs
  const providerIds = block.slot_providers || [];
  const categoryIds = block.slot_categories || [];

  console.log("Provider IDs:", providerIds);
  console.log("Category IDs:", categoryIds);

  // Create cache keys based on IDs
  const newGamesCacheKey = `games:new:providers-${providerIds.join(
    ","
  )}-categories-${categoryIds.join(",")}`;
  const popularGamesCacheKey = `games:popular:providers-${providerIds.join(
    ","
  )}-categories-${categoryIds.join(",")}`;

  // Try cache manager first
  try {
    const [newGamesCache, popularGamesCache] = await Promise.all([
      cacheManager.get<GameData[]>(newGamesCacheKey),
      cacheManager.get<GameData[]>(popularGamesCacheKey),
    ]);

    if (newGamesCache.data && popularGamesCache.data) {
      console.log("Returning cached games data");
      return {
        newGames: newGamesCache.data,
        popularGames: popularGamesCache.data,
      };
    }
  } catch (error) {
    console.error("Cache error:", error);
  }

  // Build filters based on IDs
  const filters: any = {};
  if (providerIds.length > 0) {
    filters.provider = {
      id: { $in: providerIds },
    };
  }
  if (categoryIds.length > 0) {
    filters.categories = {
      id: { $in: categoryIds },
    };
  }

  // Prepare queries for new and popular games
  const newGamesQuery = {
    fields: [
      "title",
      "slug",
      "ratingAvg",
      "ratingCount",
      "createdAt",
      "publishedAt",
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
    ...(Object.keys(filters).length > 0 && { filters }),
    sort: ["createdAt:desc"],
    pagination: {
      pageSize: 3,
      page: 1,
    },
  };

  const popularGamesQuery = {
    ...newGamesQuery,
    sort: ["ratingAvg:desc", "ratingCount:desc"],
  };

  console.log(
    "Fetching new games with query:",
    JSON.stringify(newGamesQuery, null, 2)
  );
  console.log(
    "Fetching popular games with query:",
    JSON.stringify(popularGamesQuery, null, 2)
  );

  // Fetch in parallel
  const [newGamesResponse, popularGamesResponse] = await Promise.all([
    strapiClient.fetchWithCache<{ data: GameData[] }>(
      "games",
      newGamesQuery,
      CACHE_CONFIG.games.ttl
    ),
    strapiClient.fetchWithCache<{ data: GameData[] }>(
      "games",
      popularGamesQuery,
      CACHE_CONFIG.games.ttl
    ),
  ]);

  const result = {
    newGames: newGamesResponse.data || [],
    popularGames: popularGamesResponse.data || [],
  };

  console.log(
    `Fetched ${result.newGames.length} new games and ${result.popularGames.length} popular games`
  );

  // Store in cache
  try {
    await Promise.all([
      cacheManager.set(newGamesCacheKey, result.newGames, {
        ttl: CACHE_CONFIG.games.ttl,
        swr: CACHE_CONFIG.games.swr,
      }),
      cacheManager.set(popularGamesCacheKey, result.popularGames, {
        ttl: CACHE_CONFIG.games.ttl,
        swr: CACHE_CONFIG.games.swr,
      }),
    ]);
  } catch (error) {
    console.error("Cache set error:", error);
  }

  return result;
} 

/**
 * Fetch games for games.games-carousel blocks
 */
async function fetchGamesCarouselGames(
  block: any // You'll need to type this based on your carousel block structure
): Promise<GameData[]> {
  // Build filters based on the block configuration
  const filters: any = {};

  // Extract provider IDs if present
  if (block.gameProviders && block.gameProviders.length > 0) {
    const providerIds = block.gameProviders
      .map((p: any) => p.id)
      .filter(Boolean);
    if (providerIds.length > 0) {
      filters.provider = { id: { $in: providerIds } };
    }
  }

  // Extract category IDs if present
  if (block.gameCategories && block.gameCategories.length > 0) {
    const categoryIds = block.gameCategories
      .map((c: any) => c.id)
      .filter(Boolean);
    if (categoryIds.length > 0) {
      filters.categories = { id: { $in: categoryIds } };
    }
  }

  const query = {
    fields: [
      "title",
      "slug",
      "ratingAvg",
      "ratingCount",
      "createdAt",
      "publishedAt",
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
    ...(Object.keys(filters).length > 0 && { filters }),
    sort:
      block.sortBy === "Most Popular" ? ["ratingAvg:desc"] : ["createdAt:desc"],
    pagination: {
      pageSize: block.numberOfGames || 24,
      page: 1,
    },
  };

  const response = await strapiClient.fetchWithCache<{ data: GameData[] }>(
    "games",
    query,
    CACHE_CONFIG.games.ttl
  );

  return response.data || [];
}

/**
 * Analyze blocks and fetch all required dynamic data
 */
async function fetchDynamicDataForBlocks(
  blocks: any[]
): Promise<DynamicGamesData> {
  console.log("Analyzing blocks for dynamic data fetching...");
  const gamesData: DynamicGamesData = {};
  const fetchPromises: Promise<void>[] = [];

  // Analyze each block and prepare fetch promises
  blocks.forEach((block) => {
    console.log(`Found block: ${block.__component} (ID: ${block.id})`);

    if (block.__component === "games.new-and-loved-slots" && block.newSlots) {
      console.log("Adding NewAndLovedSlots block to fetch queue");
      fetchPromises.push(
        fetchNewAndLovedSlotsGames(block).then((data) => {
          gamesData[`block-${block.id}`] = data;
        })
      );
    } else if (block.__component === "games.games-carousel") {
      console.log("Adding GamesCarousel block to fetch queue");
      fetchPromises.push(
        fetchGamesCarouselGames(block).then((games) => {
          gamesData[`block-${block.id}`] = { games };
        })
      );
    }
    // Add more block types here as needed
  });

  console.log(`Fetching dynamic data for ${fetchPromises.length} blocks...`);

  // Execute all fetches in parallel
  await Promise.all(fetchPromises);

  console.log("Dynamic data fetching complete:", Object.keys(gamesData));
  return gamesData;
}

/**
 * Optimized custom page data fetching with split queries
 */
const getCustomPageDataWithSplitQueries = async (
  path: string,
  casinoCountry?: string,
  localisation: boolean = false
): Promise<{
  pageData: CustomPageData | null;
  games: GameData[];
  casinos: CasinoData[];
  dynamicGamesData: DynamicGamesData;
}> => {
  const normalizedPath = normalizePath(path);

  // 1. Fetch page structure (lightweight)
  const structureQuery = {
    fields: [
      "title",
      "urlPath",
      "createdAt",
      "updatedAt",
      "showContentDate",
      "sideBarToShow",
    ],
    populate: {
      seo: {
        fields: ["metaTitle", "metaDescription", "keywords", "canonicalURL"],
        populate: {
          metaImage: { fields: ["url", "width", "height"] },
          metaSocial: {
            fields: ["socialNetwork", "title", "description"],
            populate: {
              image: { fields: ["url", "width", "height"] },
            },
          },
        },
      },
      breadcrumbs: {
        fields: ["breadCrumbText", "breadCrumbUrl"],
      },
      author: {
        fields: [
          "firstName",
          "lastName",
          "slug",
          "linkedInLink",
          "twitterLink",
          "facebookLink",
          "content1",
          "jobTitle",
          "experience",
          "areaOfWork",
          "specialization",
        ],
        populate: {
          photo: {
            fields: ["url", "width", "height", "alternativeText"],
          },
        },
      },
      blocks: {
        on: {
          // Basic block structure without heavy data
          "shared.introduction-with-image": {
            fields: ["heading", "introduction"],
            populate: {
              image: {
                fields: ["url", "mime", "width", "height", "alternativeText"],
              },
            },
          },
          "games.new-and-loved-slots": {
            fields: ["newSlots"],
            populate: {
              slot_categories: {
                populate: {
                  fields: ["title", "slug"],
                },
              },
              slot_providers: {
                populate: {
                  fields: ["title", "slug"],
                },
              },
            },
          },
          "games.games-carousel": {
            fields: [
              "numberOfGames",
              "sortBy",
              "showGameFilterPanel",
              "showGameMoreButton",
            ],
            populate: {
              gameProviders: {
                fields: ["id"],
                populate: {
                  slotProvider: {
                    fields: ["id", "slug"],
                  },
                },
              },
              gameCategories: {
                fields: ["id"],
                populate: {
                  slotCategory: {
                    fields: ["id", "slug"],
                  },
                },
              },
            },
          },
          "shared.single-content": {
            fields: ["content"],
          },
          "shared.how-to-group": {
            fields: ["title", "description"],
            populate: {
              howToGroup: {
                fields: ["heading", "copy"],
                populate: {
                  image: {
                    fields: ["url", "width", "height", "alternativeText"],
                  },
                },
              },
            },
          },
          // Add other block types as needed
        },
      },
    },
    filters: {
      urlPath: { $eq: normalizedPath },
    },
    pagination: { page: 1, pageSize: 1 },
  };

  try {
    // Fetch page structure
    const pageResponse = await strapiClient.fetchWithCache<{
      data: CustomPageData[];
    }>("custom-pages", structureQuery, CACHE_CONFIG.structure.ttl);

    const pageData = pageResponse.data?.[0];

    if (!pageData) {
      return {
        pageData: null,
        games: [],
        casinos: [],
        dynamicGamesData: {},
      };
    }

    // 2. Analyze blocks and determine what dynamic data is needed
    const blocks = pageData.blocks || [];
    const needsCasinos = blocks.some((block) =>
      ["casinos.casino-list", "casinos.casinos-comparison"].includes(
        block.__component
      )
    );

    // 3. Fetch all dynamic data in parallel
    const [dynamicGamesData, casinos] = await Promise.all([
      fetchDynamicDataForBlocks(blocks),
      needsCasinos
        ? fetchCasinosForCustomPage(casinoCountry, localisation)
        : [],
    ]);

    // Note: 'games' array is for backward compatibility
    // New components should use dynamicGamesData
    return {
      pageData,
      games: [], // Empty for now, use dynamicGamesData instead
      casinos,
      dynamicGamesData,
    };
  } catch (error) {
    console.error("Failed to fetch custom page data:", error);
    return {
      pageData: null,
      games: [],
      casinos: [],
      dynamicGamesData: {},
    };
  }
};

/**
 * Fetch casinos for custom page blocks
 */
async function fetchCasinosForCustomPage(
  casinoCountry?: string,
  localisation: boolean = false
): Promise<CasinoData[]> {
  const query = {
    fields: ["name", "slug", "ratingAvg"],
    populate: {
      logoImageAlt: { fields: ["url"] },
      bonuses: {
        populate: {
          mainImage: { fields: ["url"] },
        },
      },
      casinoGeneralInfo: { fields: ["wageringRequirements"] },
      termsAndConditions: { fields: ["copy", "gambleResponsibly"] },
      countries: { fields: ["countryName", "shortCode"] },
    },
    filters: {
      ...(localisation &&
        casinoCountry && {
          countries: {
            shortCode: { $in: casinoCountry },
          },
        }),
    },
    sort: ["ratingAvg:desc"],
    pagination: { pageSize: 20, page: 1 },
  };

  try {
    const response = await strapiClient.fetchWithCache<{
      data: CasinoData[];
    }>("casinos", query, CACHE_CONFIG.casinos.ttl);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch casinos:", error);
    return [];
  }
}

/**
 * Cached metadata fetcher
 */
export const getCustomPageMetadata = unstable_cache(
  async (path: string): Promise<CustomPageMetadata | null> => {
    try {
      const query = {
        fields: ["title", "urlPath", "publishedAt"],
        populate: {
          seo: {
            fields: ["metaTitle", "metaDescription", "keywords"],
          },
        },
        filters: {
          urlPath: { $eq: normalizePath(path) },
        },
        pagination: { page: 1, pageSize: 1 },
      };

      const response = await strapiClient.fetchWithCache<{
        data: CustomPageMetadata[];
      }>("custom-pages", query, CACHE_CONFIG.metadata.ttl);

      return response.data?.[0] || null;
    } catch (error) {
      console.error("Failed to fetch custom page metadata:", error);
      return null;
    }
  },
  ["custom-page-metadata"],
  {
    revalidate: CACHE_CONFIG.metadata.ttl,
    tags: CACHE_CONFIG.metadata.tags,
  }
);

/**
 * Export the cached version of the split query
 */
export const getCustomPageDataSplit = unstable_cache(
  getCustomPageDataWithSplitQueries,
  ["custom-page-data-split"],
  {
    revalidate: 60, // 1 minute base revalidation
    tags: ["custom-page"],
  }
);
