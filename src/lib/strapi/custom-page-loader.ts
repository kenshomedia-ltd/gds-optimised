// src/lib/strapi/custom-page-loader.ts

import { unstable_cache } from "next/cache";
import { strapiClient } from "./strapi-client";
import {
  seoQueryChunk,
  breadcrumbsQueryChunk,
  authorQueryChunk,
  blockQueryChunks,
  getBlockQueryChunk,
} from "./query-chunks/shared-chunks";
import { fetchGamesForCarousel } from "./query-chunks/game-fetchers";
import type { BlockComponent } from "@/types/strapi.types";
import type {
  CustomPageData,
  CustomPageMetadata,
  CustomPageBlock,
  GamesCarouselBlock,
} from "@/types/custom-page.types";
import type { GameData } from "@/types/game.types";

// Cache configuration
const CACHE_CONFIG = {
  page: { ttl: 300, swr: 600, tags: ["custom-page"] }, // 5min/10min
  metadata: { ttl: 600, swr: 1200, tags: ["custom-page-meta"] }, // 10min/20min
};

/**
 * Type guard for game carousel blocks
 */
function isGamesCarouselBlock(
  block: CustomPageBlock | BlockComponent
): block is GamesCarouselBlock {
  return block.__component === "games.games-carousel";
}

/**
 * Normalize path by removing leading and trailing slashes
 */
function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

/**
 * Build metadata query (lightweight for SEO)
 */
function buildMetadataQuery(path: string) {
  return {
    fields: ["title", "urlPath", "publishedAt"],
    populate: {
      seo: {
        fields: ["metaTitle", "metaDescription"],
      },
    },
    filters: {
      urlPath: { $eq: normalizePath(path) },
    },
    pagination: { page: 1, pageSize: 1 },
  };
}

/**
 * Build full page query using shared chunks
 */
function buildFullPageQuery(
  path: string,
  casinoCountry?: string,
  localisation: boolean = false
) {
  const normalizedPath = normalizePath(path);

  // Build block queries dynamically
  const blockQueries = Object.entries(blockQueryChunks).reduce(
    (acc, [key, value]) => {
      const baseQuery = getBlockQueryChunk(key, casinoCountry);

      // Special handling for blocks with dynamic data
      if (typeof baseQuery === "object" && "populate" in baseQuery) {
        const populate = baseQuery.populate as Record<string, unknown>;

        // Handle casino country filtering
        if (key === "casinos.casino-list" && populate.casinosList) {
          const casinosList = populate.casinosList as Record<string, unknown>;
          if (
            casinosList.populate &&
            typeof casinosList.populate === "object"
          ) {
            const casinosPopulate = casinosList.populate as Record<
              string,
              unknown
            >;
            if (typeof casinosPopulate.casino === "function") {
              casinosPopulate.casino = casinosPopulate.casino(
                casinoCountry,
                localisation
              );
            }
          }
        }

        acc[key] = baseQuery;
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, unknown>
  );

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
      blocks: {
        populate: blockQueries,
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
 * Fetch games for carousel blocks using centralized function
 * REPLACES the old enrichGameCarousels function with centralized game fetchers
 */
async function enrichGameCarousels(
  blocks: BlockComponent[]
): Promise<BlockComponent[]> {
  const gameCarouselBlocks = blocks.filter(isGamesCarouselBlock);

  if (gameCarouselBlocks.length === 0) return blocks;

  // Use centralized game fetching for each carousel
  await Promise.all(
    gameCarouselBlocks.map(async (block) => {
      try {
        // Use the centralized fetchGamesForCarousel function
        const games = await fetchGamesForCarousel(block, {
          queryType: "carousel",
          cacheTime: 60, // 1 minute cache for games
        });

        // Inject games directly into the block
        block.games = games;
      } catch (error) {
        console.error(`Failed to fetch games for carousel:`, error);
        block.games = [];
      }
    })
  );

  return blocks;
}

/**
 * Fetch custom page metadata (for SEO/metadata generation)
 */
export const getCustomPageMetadata = unstable_cache(
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
 * Fetch full custom page data (main function to use)
 */
export const getCustomPageData = unstable_cache(
  async (
    path: string,
    casinoCountry?: string,
    localisation: boolean = false
  ): Promise<CustomPageData | null> => {
    try {
      const query = buildFullPageQuery(path, casinoCountry, localisation);

      const response = await strapiClient.fetchWithCache<{
        data: CustomPageData[];
      }>("custom-pages", query, CACHE_CONFIG.page.ttl);

      const pageData = response.data?.[0];

      if (!pageData) {
        return null;
      }

      // Enrich game carousel blocks with actual games using centralized function
      if (pageData.blocks && pageData.blocks.length > 0) {
        // Cast to BlockComponent[] for enrichment, then cast back
        const enrichedBlocks = await enrichGameCarousels(
          pageData.blocks as unknown as BlockComponent[]
        );
        pageData.blocks = enrichedBlocks as unknown as CustomPageBlock[];
      }

      return pageData;
    } catch (error) {
      console.error("Failed to fetch custom page data:", error);
      return null;
    }
  },
  ["custom-page-data"],
  {
    revalidate: CACHE_CONFIG.page.ttl,
    tags: CACHE_CONFIG.page.tags,
  }
);

/**
 * Fetch custom page data with split queries
 */
export const getCustomPageDataSplit = unstable_cache(
  async (
    path: string,
    casinoCountry?: string,
    localisation: boolean = false
  ) => {
    try {
      // Fetch page structure without heavy data
      const structureQuery = {
        ...buildFullPageQuery(path, casinoCountry, localisation),
        populate: {
          seo: seoQueryChunk,
          breadcrumbs: breadcrumbsQueryChunk,
          author: authorQueryChunk,
          blocks: {
            populate: {
              // Only get block structure, not full data
              "games.games-carousel": {
                fields: ["numberOfGames", "sortBy", "showGameFilterPanel"],
                populate: {
                  gameProviders: {
                    populate: {
                      slotProvider: { fields: ["slug"] },
                    },
                  },
                  gameCategories: {
                    populate: {
                      slotCategory: { fields: ["slug"] },
                    },
                  },
                },
              },
              "casinos.casino-list": {
                fields: ["showCasinoTableHeader"],
              },
            },
          },
        },
      };

      const response = await strapiClient.fetchWithCache<{
        data: CustomPageData[];
      }>("custom-pages", structureQuery, CACHE_CONFIG.page.ttl);

      const pageData = response.data?.[0];

      if (!pageData) {
        return {
          pageData: null,
          games: [],
          casinos: [],
          dynamicGamesData: {},
          dynamicCasinosData: {},
        };
      }

      // Extract game carousel blocks for dynamic data fetching
      const gameCarouselBlocks =
        pageData.blocks?.filter(
          (block): block is GamesCarouselBlock =>
            block.__component === "games.games-carousel"
        ) || [];

      // Fetch games for each carousel using centralized function
      const dynamicGamesData: Record<string, { games: GameData[] }> = {};

      if (gameCarouselBlocks.length > 0) {
        await Promise.all(
          gameCarouselBlocks.map(async (block) => {
            try {
              const games = await fetchGamesForCarousel(block, {
                queryType: "carousel",
                cacheTime: 60,
              });
              dynamicGamesData[`block-${block.id}`] = { games };
            } catch (error) {
              console.error(
                `Failed to fetch games for block ${block.id}:`,
                error
              );
              dynamicGamesData[`block-${block.id}`] = { games: [] };
            }
          })
        );
      }

      return {
        pageData,
        games: [], // Deprecated - for backward compatibility
        casinos: [], // Deprecated - for backward compatibility
        dynamicGamesData,
        dynamicCasinosData: {}, // TODO: Implement casino data fetching
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
  },
  ["custom-page-data-split"],
  {
    revalidate: CACHE_CONFIG.page.ttl,
    tags: CACHE_CONFIG.page.tags,
  }
);

/**
 * Get all custom page paths for static generation
 * Used in generateStaticParams or getStaticPaths
 */
export async function getAllCustomPagePaths(): Promise<string[]> {
  try {
    const query = {
      fields: ["urlPath"],
      pagination: {
        page: 1,
        pageSize: 1000, // Adjust based on your needs
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: Array<{ urlPath: string }>;
    }>("custom-pages", query, CACHE_CONFIG.metadata.ttl);

    if (!response.data) {
      return [];
    }

    // Return normalized paths (remove leading/trailing slashes)
    return response.data
      .map((page) => normalizePath(page.urlPath))
      .filter((path) => path.length > 0); // Filter out empty paths
  } catch (error) {
    console.error("Failed to fetch custom page paths:", error);
    return [];
  }
}

/**
 * Generate static params for Next.js 13+ app router
 * Alternative to getAllCustomPagePaths for newer Next.js versions
 */
export async function generateCustomPageParams(): Promise<
  Array<{ slug: string[] }>
> {
  try {
    const paths = await getAllCustomPagePaths();

    return paths.map((path) => ({
      slug: path.split("/").filter((segment) => segment.length > 0),
    }));
  } catch (error) {
    console.error("Failed to generate custom page params:", error);
    return [];
  }
}
