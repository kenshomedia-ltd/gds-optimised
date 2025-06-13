// src/lib/strapi/custom-page-loader.ts
import { unstable_cache } from "next/cache";
import { strapiClient } from "./strapi-client";
import {
  seoQueryChunk,
  breadcrumbsQueryChunk,
  authorQueryChunk,
  blockQueryChunks,
} from "./query-chunks/shared-chunks";
import type { CustomPageData, SEOData } from "@/types/strapi.types";
import type { CustomPageBlock } from "@/types/custom-page.types";
import type { GameData } from "@/types/strapi.types";

// Cache configuration
const CACHE_CONFIG = {
  page: { ttl: 300, swr: 600, tags: ["custom-page"] }, // 5min/10min
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
 * Typed interfaces for game carousel blocks
 */
interface GameProvider {
  id: number;
  slotProvider?: {
    id: number;
    slug: string;
    title: string;
  };
}

interface GameCategory {
  id: number;
  slotCategory?: {
    id: number;
    slug: string;
    title: string;
  };
}

interface GameCarouselBlock {
  id: number;
  __component: "games.games-carousel";
  gameProviders?: GameProvider[];
  gameCategories?: GameCategory[];
  sortBy?: string;
  numberOfGames?: number;
  games?: GameData[];
}

/**
 * Type guard for game carousel blocks
 */
function isGameCarouselBlock(
  block: CustomPageBlock
): block is GameCarouselBlock {
  return block.__component === "games.games-carousel";
}

/**
 * Type for block query chunks entries
 */
type BlockQueryValue =
  | {
      fields?: string[];
      populate?: Record<string, unknown>;
    }
  | Record<string, unknown>;

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

  // Build dynamic block queries
  const blockQueries = Object.entries(
    blockQueryChunks as Record<string, BlockQueryValue>
  ).reduce((acc, [key, value]) => {
    // Type guard to check if value has populate property
    const hasPopulate = (
      val: BlockQueryValue
    ): val is { populate: Record<string, unknown> } => {
      return typeof val === "object" && val !== null && "populate" in val;
    };

    // Handle casino blocks that need country filtering
    if (
      (key === "casinos.casino-list" || key === "casinos.casinos-comparison") &&
      hasPopulate(value)
    ) {
      // Create a properly typed copy
      const baseQuery = { ...value };

      // Type-safe access to nested properties
      if (baseQuery.populate && typeof baseQuery.populate === "object") {
        const populate = baseQuery.populate as Record<string, unknown>;

        // Handle casinosList
        if (populate.casinosList && typeof populate.casinosList === "object") {
          const casinosList = populate.casinosList as Record<string, unknown>;
          if (
            casinosList.populate &&
            typeof casinosList.populate === "object"
          ) {
            const listPopulate = casinosList.populate as Record<
              string,
              unknown
            >;
            if (typeof listPopulate.casino === "function") {
              listPopulate.casino = listPopulate.casino(
                casinoCountry,
                localisation
              );
            }
          }
        }

        // Handle casinos
        if (populate.casinos && typeof populate.casinos === "object") {
          const casinos = populate.casinos as Record<string, unknown>;
          if (casinos.populate && typeof casinos.populate === "object") {
            const casinosPopulate = casinos.populate as Record<string, unknown>;
            if (typeof casinosPopulate.casino === "function") {
              casinosPopulate.casino = casinosPopulate.casino(
                casinoCountry,
                localisation
              );
            }
          }
        }
      }

      acc[key] = baseQuery;
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);

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
  blocks: CustomPageBlock[]
): Promise<CustomPageBlock[]> {
  const gameCarouselBlocks = blocks.filter(isGameCarouselBlock);

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

      console.log("Fetching page data for:", normalizePath(path));

      const response = await strapiClient.fetchWithCache<{
        data: CustomPageData[];
      }>("custom-pages", query, CACHE_CONFIG.page.ttl);

      const pageData = response.data?.[0];

      if (!pageData) {
        console.log("No page data found for path:", normalizePath(path));
        return null;
      }

      // Enrich game carousel blocks with actual games
      if (pageData.blocks) {
        pageData.blocks = await enrichGameCarousels(
          pageData.blocks as CustomPageBlock[]
        );
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
