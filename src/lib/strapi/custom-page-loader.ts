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
import type { BlockComponent } from "@/types/strapi.types";
import type {
  CustomPageData,
  CustomPageMetadata,
  CustomPageBlock,
  GamesCarouselBlock,
} from "@/types/custom-page.types";
import type { GameData } from "@/types/game.types";
import type { CasinoData } from "@/types/casino.types";

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
 * Fetch games for carousel blocks (post-processing)
 */
async function enrichGameCarousels(
  blocks: BlockComponent[]
): Promise<BlockComponent[]> {
  const gameCarouselBlocks = blocks.filter(isGamesCarouselBlock);

  if (gameCarouselBlocks.length === 0) return blocks;

  // Fetch games for each carousel
  await Promise.all(
    gameCarouselBlocks.map(async (block) => {
      const providers =
        block.gameProviders
          ?.map((p) => p.slotProvider?.slug)
          .filter((slug): slug is string => Boolean(slug)) || [];

      const categories =
        block.gameCategories
          ?.map((c) => c.slotCategory?.slug)
          .filter((slug): slug is string => Boolean(slug)) || [];

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
        sort: [block.sortBy || "createdAt:desc"],
        pagination: {
          pageSize: block.numberOfGames || 24,
          page: 1,
        },
      };

      try {
        const response = await strapiClient.fetchWithCache<{
          data: GameData[];
        }>("games", query, 60); // 1 minute cache for games

        // Inject games directly into the block
        block.games = response.data || [];
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

      // Enrich game carousel blocks with actual games
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
                fields: ["numberOfGames", "sortBy"],
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
      if (!pageData) return { pageData: null, games: [], casinos: [] };

      // Analyze blocks to determine what data is needed
      const needsGames = pageData.blocks?.some(
        (block) => block.__component === "games.games-carousel"
      );
      const needsCasinos = pageData.blocks?.some(
        (block) => block.__component === "casinos.casino-list"
      );

      // Fetch dynamic content in parallel
      const [games, casinos] = await Promise.all([
        needsGames ? fetchGamesForPage(pageData.blocks) : [],
        needsCasinos ? fetchCasinosForPage(pageData.blocks, casinoCountry) : [],
      ]);

      return { pageData, games, casinos };
    } catch (error) {
      console.error(
        "Failed to fetch custom page data with split queries:",
        error
      );
      return { pageData: null, games: [], casinos: [] };
    }
  },
  ["custom-page-data-split"],
  {
    revalidate: CACHE_CONFIG.page.ttl,
    tags: ["custom-page", "custom-page-split"],
  }
);

/**
 * Helper to fetch games for page blocks
 */
async function fetchGamesForPage(
  blocks: CustomPageBlock[]
): Promise<GameData[]> {
  const gameCarouselBlocks = blocks.filter(
    (block): block is GamesCarouselBlock =>
      block.__component === "games.games-carousel"
  );

  if (gameCarouselBlocks.length === 0) return [];

  const allGames: GameData[] = [];

  await Promise.all(
    gameCarouselBlocks.map(async (block) => {
      const providers =
        block.gameProviders
          ?.map((p) => p.slotProvider?.slug)
          .filter((slug): slug is string => Boolean(slug)) || [];

      const categories =
        block.gameCategories
          ?.map((c) => c.slotCategory?.slug)
          .filter((slug): slug is string => Boolean(slug)) || [];

      const query = {
        fields: ["title", "slug", "ratingAvg", "createdAt", "publishedAt"],
        populate: {
          images: { fields: ["url", "alternativeText", "width", "height"] },
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
        sort: [block.sortBy || "createdAt:desc"],
        pagination: {
          pageSize: block.numberOfGames || 24,
          page: 1,
        },
      };

      try {
        const response = await strapiClient.fetchWithCache<{
          data: GameData[];
        }>("games", query, 60);

        if (response.data) {
          allGames.push(...response.data);
        }
      } catch (error) {
        console.error("Failed to fetch games for page:", error);
      }
    })
  );

  return allGames;
}

/**
 * Helper to fetch casinos for page blocks
 */
async function fetchCasinosForPage(
  blocks: CustomPageBlock[],
  casinoCountry?: string
): Promise<CasinoData[]> {
  const casinoListBlocks = blocks.filter(
    (block) => block.__component === "casinos.casino-list"
  );

  if (casinoListBlocks.length === 0) return [];

  try {
    const query = {
      fields: [
        "title",
        "slug",
        "ratingAvg",
        "ratingCount",
        "publishedAt",
        "Badges",
      ],
      populate: {
        images: { fields: ["url", "width", "height"] },
        casinoBonus: { fields: ["bonusUrl", "bonusLabel", "bonusCode"] },
        noDepositSection: { fields: ["bonusAmount", "termsConditions"] },
        freeSpinsSection: { fields: ["bonusAmount", "termsConditions"] },
        termsAndConditions: { fields: ["copy", "gambleResponsibly"] },
        bonusSection: {
          fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
        },
      },
      filters: casinoCountry
        ? { countries: { $containsi: casinoCountry } }
        : undefined,
      sort: ["ratingAvg:desc"],
      pagination: { pageSize: 20, page: 1 },
    };

    const response = await strapiClient.fetchWithCache<{
      data: CasinoData[];
    }>("casinos", query, 300); // 5 minute cache

    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch casinos for page:", error);
    return [];
  }
}

/**
 * Fetch all custom page paths (for static generation)
 */
export const getAllCustomPagePaths = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const query = {
        fields: ["urlPath"],
        pagination: {
          page: 1,
          pageSize: 10000,
        },
      };

      const response = await strapiClient.fetchWithCache<{
        data: Array<{ urlPath: string }>;
      }>("custom-pages", query, 3600); // 1 hour cache

      return response.data?.map((page) => page.urlPath) || [];
    } catch (error) {
      console.error("Failed to fetch custom page paths:", error);
      return [];
    }
  },
  ["custom-page-paths"],
  {
    revalidate: 3600,
    tags: ["custom-page-paths"],
  }
);

/**
 * Revalidate custom page cache
 */
export async function revalidateCustomPageCache(path?: string) {
  const { revalidateTag, revalidatePath } = await import("next/cache");

  // Revalidate tags
  revalidateTag("custom-page");
  revalidateTag("custom-page-meta");

  // Revalidate specific path if provided
  if (path) {
    revalidatePath(path);
  }

  // Clear Redis cache
  await strapiClient.invalidateCache(
    path ? `custom-pages:${path}*` : "custom-pages:*"
  );
}
