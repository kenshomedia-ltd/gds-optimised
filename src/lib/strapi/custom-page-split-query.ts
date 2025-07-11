// src/lib/strapi/custom-page-split-query.ts

import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import { cacheManager } from "@/lib/cache/cache-manager";
import { getStrapiSort } from "@/lib/utils/sort-mappings";
import type {
  CustomPageData,
  GameData,
  CasinoData,
  SEOData,
} from "@/types/strapi.types";
import type {
  CustomPageBlock,
  NewAndLovedSlotsBlock as CustomPageNewAndLovedSlotsBlock,
  CasinoListBlock,
} from "@/types/custom-page.types";
import type { GamesCarouselBlock } from "@/types/custom-page.types";

// Cache configuration for different parts
const CACHE_CONFIG = {
  structure: { ttl: 600, swr: 1200, tags: ["custom-page-structure"] }, // 10min/20min
  games: { ttl: 60, swr: 180, tags: ["custom-page-games"] }, // 1min/3min
  casinos: { ttl: 300, swr: 600, tags: ["custom-page-casinos"] }, // 5min/10min
  metadata: { ttl: 600, swr: 1200, tags: ["custom-page-meta"] }, // 10min/20min
};

/**
 * Custom metadata type for lightweight metadata queries
 */
interface CustomPageMetadata {
  id: number;
  title: string;
  urlPath: string;
  publishedAt?: string;
  seo?: SEOData;
}

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
 * Interface for dynamic casinos data keyed by block ID
 */
interface DynamicCasinosData {
  [blockId: string]: CasinoData[];
}

/**
 * Fetch games for NewAndLovedSlots blocks
 * This function now accepts the block from custom-page types and extracts IDs
 */
async function fetchNewAndLovedSlotsGames(
  block: CustomPageNewAndLovedSlotsBlock
): Promise<{ newGames: GameData[]; popularGames: GameData[] }> {

  // Extract provider and category IDs from the objects
  const providerIds =
    block.slot_providers?.map((provider) => provider.id) || [];
  const categoryIds =
    block.slot_categories?.map((category) => category.id) || [];

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
      return {
        newGames: newGamesCache.data,
        popularGames: popularGamesCache.data,
      };
    }
  } catch (error) {
    console.error("Cache error:", error);
  }

  // Build filters based on IDs
  const filters: Record<string, unknown> = {};
  if (providerIds.length > 0) {
    filters.provider = { id: { $in: providerIds } };
  }
  if (categoryIds.length > 0) {
    filters.categories = { id: { $in: categoryIds } };
  }

  // Build query for new games
  const newGamesQuery = {
    fields: ["title", "slug", "ratingAvg", "createdAt"],
    populate: {
      images: { fields: ["url", "width", "height", "alternativeText"] },
      provider: { fields: ["title", "slug"] },
    },
    filters,
    sort: ["createdAt:desc"],
    pagination: { pageSize: 3, page: 1 },
  };

  // Build query for popular games
  const popularGamesQuery = {
    ...newGamesQuery,
    sort: ["ratingAvg:desc"],
  };

  try {
    // Fetch both in parallel
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

    // Cache the results
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

    return result;
  } catch (error) {
    console.error("Failed to fetch games for NewAndLovedSlots:", error);
    return { newGames: [], popularGames: [] };
  }
}

/**
 * Fetch games for GamesCarousel blocks
 */
async function fetchGamesCarouselGames(
  block: GamesCarouselBlock
): Promise<GameData[]> {
  // Extract provider and category slugs
  const providerSlugs =
    block.gameProviders?.map((p) => p.slotProvider?.slug).filter(Boolean) || [];
  const categorySlugs =
    block.gameCategories?.map((c) => c.slotCategory?.slug).filter(Boolean) ||
    [];

  // Build filters
  const filters: Record<string, unknown> = {};
  if (providerSlugs.length > 0) {
    filters.provider = { slug: { $in: providerSlugs } };
  }
  if (categorySlugs.length > 0) {
    filters.categories = { slug: { $in: categorySlugs } };
  }

  // FIXED: Use centralized sort mapping instead of hardcoded logic
  const sortBy = getStrapiSort(block.sortBy, "createdAt:desc");

  const query = {
    fields: ["title", "slug", "ratingAvg", "createdAt", "views"],
    populate: {
      images: { fields: ["url", "width", "height", "alternativeText"] },
      provider: { fields: ["title", "slug"] },
      categories: { fields: ["title", "slug"] },
    },
    filters,
    sort: [sortBy],
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
  blocks: CustomPageBlock[]
): Promise<DynamicGamesData> {
  const gamesData: DynamicGamesData = {};
  const fetchPromises: Promise<void>[] = [];

  // Analyze each block and prepare fetch promises
  blocks.forEach((block) => {

    if (block.__component === "games.new-and-loved-slots") {
      const typedBlock = block as CustomPageNewAndLovedSlotsBlock;
      if (typedBlock.newSlots) {
        fetchPromises.push(
          fetchNewAndLovedSlotsGames(typedBlock).then((data) => {
            gamesData[`block-${block.id}`] = data;
          })
        );
      }
    } else if (block.__component === "games.games-carousel") {
      const typedBlock = block as GamesCarouselBlock;
      fetchPromises.push(
        fetchGamesCarouselGames(typedBlock).then((games) => {
          gamesData[`block-${block.id}`] = { games };
        })
      );
    }
    // Add more block types here as needed
  });

  // Execute all fetches in parallel
  await Promise.all(fetchPromises);

  return gamesData;
}

/**
 * Fetch casinos for custom page blocks with full query
 */
async function fetchCasinosForCustomPage(
  blocks: CustomPageBlock[]
): Promise<DynamicCasinosData> {
  const casinoListBlocks = blocks.filter(
    (block) => block.__component === "casinos.casino-list"
  ) as CasinoListBlock[];

  if (casinoListBlocks.length === 0) return {};

  const casinoDataByBlock: DynamicCasinosData = {};

  // Fetch casinos for each block
  await Promise.all(
    casinoListBlocks.map(async (block) => {
      const casinoIds =
        block.casinosList
          ?.map((item) => item.casino?.id)
          .filter((id): id is number => id !== undefined) || [];

      if (casinoIds.length === 0) {
        casinoDataByBlock[`block-${block.id}`] = [];
        return;
      }

      const query = {
        fields: [
          "id",
          "documentId",
          "title",
          "slug",
          "ratingAvg",
          "ratingCount",
          "publishedAt",
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
          bonusSection: {
            fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
          },
          providers: {
            fields: ["title"],
            populate: {
              images: {
                fields: ["url"],
              },
            },
          },
          casinoGeneralInfo: {
            fields: ["wageringRequirements"],
          },
          termsAndConditions: {
            fields: ["copy", "gambleResponsibly"],
          },
          countries: {
            fields: ["countryName", "shortCode"],
          },
        },
        filters: {
          id: {
            $in: casinoIds,
          },
        },
        pagination: {
          page: 1,
          pageSize: casinoIds.length,
        },
      };

      try {
        const response = await strapiClient.fetchWithCache<{
          data: CasinoData[];
        }>("casinos", query, CACHE_CONFIG.casinos.ttl);

        // Sort casinos to match the order in casinosList
        const casinosMap = new Map(
          response.data?.map((casino) => [casino.id, casino]) || []
        );

        const sortedCasinos = casinoIds
          .map((id) => casinosMap.get(id))
          .filter((casino): casino is CasinoData => casino !== undefined);

        casinoDataByBlock[`block-${block.id}`] = sortedCasinos;
      } catch (error) {
        console.error(`Failed to fetch casinos for block ${block.id}:`, error);
        casinoDataByBlock[`block-${block.id}`] = [];
      }
    })
  );

  return casinoDataByBlock;
}

/**
 * Optimized custom page data fetching with split queries
 */
const getCustomPageDataWithSplitQueries = async (
  path: string
): Promise<{
  pageData: CustomPageData | null;
  games: GameData[];
  casinos: CasinoData[];
  dynamicGamesData: DynamicGamesData;
  dynamicCasinosData: DynamicCasinosData;
}> => {
  const normalizedPath = normalizePath(path);

  // 1. Fetch page structure with minimal fields
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
                fields: ["id"],
              },
              slot_providers: {
                fields: ["id"],
              },
            },
          },
          "homepage.home-featured-providers": {
            populate: {
              homeFeaturedProviders: {
                populate: {
                  providers: {
                    fields: ["title", "slug"],
                    populate: {
                      images: {
                        fields: ["url", "width", "height"],
                      },
                    },
                  },
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
          "casinos.casino-list": {
            fields: [
              "showCasinoTableHeader",
              "casinoSort",
              "casinoFilters",
              "showCasinoFilters",
              "showLoadMore",
              "numberPerLoadMore",
            ],
            populate: {
              casinosList: {
                fields: ["id"],
                populate: {
                  casino: {
                    fields: ["id"], // Only need ID for separate fetch
                  },
                },
              },
            },
          },
          "shared.quicklinks": {
            fields: ["showQuickLinks"],
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
        dynamicCasinosData: {},
      };
    }

    // 2. Analyze blocks and determine what dynamic data is needed
    const blocks = (pageData.blocks || []) as CustomPageBlock[];
    const needsCasinos = blocks.some((block) =>
      ["casinos.casino-list", "casinos.casinos-comparison"].includes(
        block.__component
      )
    );

    // 3. Fetch all dynamic data in parallel
    const [dynamicGamesData, dynamicCasinosData] = await Promise.all([
      fetchDynamicDataForBlocks(blocks),
      needsCasinos ? fetchCasinosForCustomPage(blocks) : {},
    ]);

    // Note: 'games' and 'casinos' arrays are for backward compatibility
    // New components should use dynamicGamesData and dynamicCasinosData
    return {
      pageData,
      games: [], // Empty for now, use dynamicGamesData instead
      casinos: [], // Empty for now, use dynamicCasinosData instead
      dynamicGamesData,
      dynamicCasinosData,
    };
  } catch (error) {
    console.error("Failed to fetch custom page data:", error);
    return {
      pageData: null,
      games: [],
      casinos: [],
      dynamicGamesData: {},
      dynamicCasinosData: {},
    };
  }
};

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
