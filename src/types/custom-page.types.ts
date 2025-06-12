// src/lib/strapi/custom-page-query-splitter.ts
import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import {
  seoQueryChunk,
  breadcrumbsQueryChunk,
  authorQueryChunk,
} from "./query-chunks/shared-chunks";
import type {
  CustomPageData,
  CustomPageMetadata,
  BaseCustomPageBlock,
} from "@/types/custom-page.types";
import type { GameData, CasinoData } from "@/types/strapi.types";
import { getStrapiSort } from "@/lib/utils/sort-mappings";

// Cache configuration for different parts
const CACHE_CONFIG = {
  structure: { ttl: 600, swr: 1200, tags: ["custom-page-structure"] }, // 10min/20min
  blocks: { ttl: 300, swr: 600, tags: ["custom-page-blocks"] }, // 5min/10min
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
 * Build lightweight metadata query
 */
function buildMetadataQuery(path: string) {
  return {
    fields: ["title", "urlPath", "publishedAt"],
    filters: {
      urlPath: { $eq: normalizePath(path) },
    },
    pagination: { page: 1, pageSize: 1 },
  };
}

/**
 * Build minimal structure query - only fetches page structure without block data
 */
function buildMinimalStructureQuery(path: string) {
  const normalizedPath = normalizePath(path);

  return {
    fields: [
      "title",
      "urlPath",
      "createdAt",
      "updatedAt",
      "showContentDate",
      "sideBarToShow",
    ],
    populate: {
      seo: seoQueryChunk,
      breadcrumbs: breadcrumbsQueryChunk,
      author: authorQueryChunk,
      // Only get block types and IDs, not the full data
      blocks: {
        fields: ["__component"],
      },
    },
    filters: {
      urlPath: {
        $eq: normalizedPath,
      },
    },
    pagination: {
      page: 1,
      pageSize: 1,
    },
  };
}

/**
 * Fetch individual block data
 */
async function fetchBlockData(
  pageId: number,
  blockIndex: number,
  blockType: string,
  casinoCountry?: string,
  localisation: boolean = false
): Promise<BaseCustomPageBlock | null> {
  try {
    // Build query specific to this block type
    const blockQuery = buildBlockSpecificQuery(
      blockType,
      casinoCountry,
      localisation
    );

    const query = {
      fields: ["id"],
      populate: {
        blocks: {
          ...blockQuery,
          start: blockIndex,
          limit: 1,
        },
      },
      filters: {
        id: { $eq: pageId },
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: Array<{ blocks: BaseCustomPageBlock[] }>;
    }>(`custom-pages`, query, CACHE_CONFIG.blocks.ttl);

    return response.data?.[0]?.blocks?.[0] || null;
  } catch (error) {
    console.error(
      `Failed to fetch block ${blockIndex} of type ${blockType}:`,
      error
    );
    return null;
  }
}

/**
 * Build block-specific query based on component type
 */
function buildBlockSpecificQuery(
  blockType: string,
  casinoCountry?: string,
  localisation: boolean = false
) {
  switch (blockType) {
    case "shared.introduction-with-image":
      return {
        on: {
          "shared.introduction-with-image": {
            fields: ["heading", "introduction"],
            populate: {
              image: {
                fields: ["url", "mime", "width", "height", "alternativeText"],
              },
            },
          },
        },
      };

    case "games.new-and-loved-slots":
      return {
        on: {
          "games.new-and-loved-slots": {
            fields: ["newSlots"],
            populate: {
              slot_categories: {
                fields: ["title", "slug"],
              },
              slot_providers: {
                fields: ["title", "slug"],
              },
            },
          },
        },
      };

    case "games.games-carousel":
      return {
        on: {
          "games.games-carousel": {
            fields: [
              "numberOfGames",
              "sortBy",
              "showGameFilterPanel",
              "showGameMoreButton",
            ],
            populate: {
              gameProviders: {
                populate: {
                  slotProvider: {
                    fields: ["id", "slug", "title"],
                  },
                },
              },
              gameCategories: {
                populate: {
                  slotCategory: {
                    fields: ["id", "slug", "title"],
                  },
                },
              },
            },
          },
        },
      };

    case "shared.single-content":
      return {
        on: {
          "shared.single-content": {
            fields: ["content"],
          },
        },
      };

    case "casinos.casino-list":
    case "casinos.casinos-comparison":
      return {
        on: {
          [blockType]: {
            fields: ["heading"],
            populate: {
              [blockType === "casinos.casino-list" ? "casinosList" : "casinos"]:
                {
                  fields: ["id"],
                  populate: {
                    casino: {
                      fields: [
                        "title",
                        "slug",
                        "ratingAvg",
                        "ratingCount",
                        "publishedAt",
                      ],
                      populate: {
                        images: { fields: ["url"] },
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
                          fields: [
                            "bonusAmount",
                            "termsConditions",
                            "cashBack",
                            "freeSpin",
                          ],
                        },
                        termsAndConditions: {
                          fields: ["copy", "gambleResponsibly"],
                        },
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
                    },
                  },
                },
            },
          },
        },
      };

    case "shared.how-to-group":
      return {
        on: {
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
        },
      };

    // Add more block types as needed
    default:
      // For unknown block types, populate everything
      return {
        on: {
          [blockType]: {
            populate: "*",
          },
        },
      };
  }
}

/**
 * Fetch games for a specific carousel block
 */
async function fetchGamesForCarousel(block: any): Promise<GameData[]> {
  const providers =
    block.gameProviders
      ?.map((p: any) => p.slotProvider?.slug)
      .filter(Boolean) || [];

  const categories =
    block.gameCategories
      ?.map((c: any) => c.slotCategory?.slug)
      .filter(Boolean) || [];

  const sortParam = getStrapiSort(block.sortBy, "createdAt:desc");

  const query = {
    fields: ["title", "slug", "ratingAvg", "createdAt", "publishedAt"],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"],
      },
      provider: { fields: ["title", "slug"] },
      categories: { fields: ["title", "slug"] },
    },
    filters: {
      ...(providers.length > 0 && {
        provider: { slug: { $in: providers } },
      }),
      ...(categories.length > 0 && {
        categories: { slug: { $in: categories } },
      }),
    },
    sort: [sortParam],
    pagination: {
      pageSize: block.numberOfGames || 24,
      page: 1,
    },
  };

  try {
    const response = await strapiClient.fetchWithCache<{
      data: GameData[];
    }>("games", query, CACHE_CONFIG.games.ttl);

    return response.data || [];
  } catch (error) {
    console.error(`Failed to fetch games for carousel:`, error);
    return [];
  }
}

/**
 * Fetch metadata only (lightweight)
 */
export const fetchCustomPageMetadata = unstable_cache(
  async (path: string): Promise<CustomPageMetadata | null> => {
    try {
      const query = buildMetadataQuery(path);
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
 * Fetch custom page structure only (minimal data)
 */
const fetchCustomPageStructure = async (
  path: string
): Promise<CustomPageData | null> => {
  try {
    const query = buildMinimalStructureQuery(path);
    const response = await strapiClient.fetchWithCache<{
      data: CustomPageData[];
    }>("custom-pages", query, CACHE_CONFIG.structure.ttl);

    return response.data?.[0] || null;
  } catch (error) {
    console.error("Failed to fetch custom page structure:", error);
    return null;
  }
};

/**
 * Fetch custom page with truly split queries
 */
export const fetchCustomPageWithSplitQueries = async (
  path: string,
  casinoCountry?: string,
  localisation: boolean = false
): Promise<CustomPageData | null> => {
  try {
    // Step 1: Fetch minimal page structure
    const pageStructure = await fetchCustomPageStructure(path);
    if (!pageStructure) return null;

    // Step 2: Fetch blocks in parallel based on their types
    const blockPromises =
      pageStructure.blocks?.map(async (block, index) => {
        // For critical above-the-fold blocks, fetch immediately
        const isCritical =
          index < 2 || block.__component === "shared.introduction-with-image";

        if (isCritical) {
          const fullBlock = await fetchBlockData(
            pageStructure.id,
            index,
            block.__component,
            casinoCountry,
            localisation
          );

          // If it's a games carousel, fetch games data
          if (fullBlock && fullBlock.__component === "games.games-carousel") {
            const games = await fetchGamesForCarousel(fullBlock);
            return { ...fullBlock, games };
          }

          return fullBlock;
        }

        // For non-critical blocks, return a placeholder that can be hydrated later
        return {
          ...block,
          _placeholder: true,
          _index: index,
        };
      }) || [];

    const blocks = await Promise.all(blockPromises);

    return {
      ...pageStructure,
      blocks: blocks.filter(Boolean) as BaseCustomPageBlock[],
    };
  } catch (error) {
    console.error("Failed to fetch custom page with split queries:", error);
    return null;
  }
};

/**
 * Fetch remaining blocks (for progressive enhancement)
 */
export const fetchRemainingBlocks = async (
  pageId: number,
  placeholderBlocks: Array<{ _index: number; __component: string }>,
  casinoCountry?: string,
  localisation: boolean = false
): Promise<Record<number, BaseCustomPageBlock>> => {
  const blockPromises = placeholderBlocks.map(async (placeholder) => {
    const fullBlock = await fetchBlockData(
      pageId,
      placeholder._index,
      placeholder.__component,
      casinoCountry,
      localisation
    );

    if (fullBlock && fullBlock.__component === "games.games-carousel") {
      const games = await fetchGamesForCarousel(fullBlock);
      return { index: placeholder._index, block: { ...fullBlock, games } };
    }

    return { index: placeholder._index, block: fullBlock };
  });

  const results = await Promise.all(blockPromises);

  return results.reduce((acc, { index, block }) => {
    if (block) acc[index] = block;
    return acc;
  }, {} as Record<number, BaseCustomPageBlock>);
};

/**
 * Export the cached version with split queries
 */
export const getCustomPageDataSplit = unstable_cache(
  fetchCustomPageWithSplitQueries,
  ["custom-page-data-split"],
  {
    revalidate: 60, // 1 minute base revalidation
    tags: ["custom-page"],
  }
);
