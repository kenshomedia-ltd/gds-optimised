// src/lib/strapi/homepage-data-loader.ts
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { strapiClient } from "./strapi-client";
import {
  fetchGamesByProviders,
  extractGameSettingsFromBlocks,
} from "./query-chunks/game-fetchers";
import {
  fetchCasinosForHomepage,
  extractCasinoSettingsFromBlocks,
} from "./query-chunks/casino-fetchers";
import {
  fetchBlogsForHomepage,
  extractBlogSettingsFromBlocks,
} from "./query-chunks/blog-fetchers";
import type {
  Homepage,
  HomepageDataResponse,
} from "@/types/homepage.types";

// Revalidation times for different content types
const REVALIDATE_TIMES = {
  homepage: 300, // 5 minutes
  games: 60, // 1 minute for frequently updating content
  blogs: 600, // 10 minutes
  casinos: 600, // 10 minutes
};

/**
 * Build optimized homepage query using shared chunks
 */
function buildHomepageQuery() {
  const baseQuery = {
    fields: ["title", "heading", "updatedAt"],
    populate: {
      blocks: {
        on: {
          "shared.single-content": {
            populate: "*",
          },
          "homepage.home-game-list": {
            fields: ["numberOfGames", "sortBy", "gameListTitle"],
            populate: {
              providers: {
                populate: {
                  slotProvider: {
                    fields: ["title", "slug"],
                    populate: {
                      images: {
                        fields: ["url", "width", "height"],
                      },
                    },
                  },
                },
              },
              link: { fields: ["label", "url"] },
            },
          },
          "homepage.home-casino-list": {
            fields: ["casinoTableTitle"],
            // Note: We'll fetch casinos separately for better caching
          },
          "shared.introduction-with-image": {
            fields: ["heading", "introduction"],
            populate: {
              image: { fields: ["url", "mime", "width", "height"] },
            },
          },
          "homepage.home-providers": {
            populate: {
              providersList: {
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
          "homepage.home-testimonies": {
            fields: ["title"],
            populate: {
              homeTestimonies: {
                fields: [
                  "title",
                  "testimony",
                  "testifierName",
                  "testifierTitle",
                ],
                populate: {
                  provider: {
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
          "homepage.home-featured-providers": {
            fields: ["title"],
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
          "homepage.home-featured-categories": {
            populate: {
              homeCategoriesList: {
                populate: {
                  slot_categories: {
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
          "shared.overview-block": {
            fields: ["overview_type"],
            populate: {
              overviews: {
                fields: ["title", "url"],
                populate: {
                  card_img: {
                    fields: ["url", "width", "height"],
                  },
                },
              },
            },
          },
          "homepage.home-blog-list": {
            fields: ["numOfBlogs"],
            populate: {
              link: { fields: ["label", "url"] },
            },
          },
        },
      },
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
    },
  };

  return baseQuery;
}

/**
 * React cache for deduplicating requests within a single render
 */
const getHomepageDataCached = cache(async (): Promise<HomepageDataResponse> => {
  try {
    // Fetch homepage structure first
    const homepageQuery = buildHomepageQuery();
    const homepageResponse = await strapiClient.fetchWithCache<{
      data: Homepage;
    }>("homepage", homepageQuery, REVALIDATE_TIMES.homepage);

    const homepage = homepageResponse.data;

    // Extract settings for parallel fetching using centralized functions
    const gameSettings = extractGameSettingsFromBlocks(
      homepage.blocks as unknown as Array<{
        __component: string;
        [key: string]: unknown;
      }>
    );
    const blogSettings = extractBlogSettingsFromBlocks(
      homepage.blocks as unknown as Array<{
        __component: string;
        [key: string]: unknown;
      }>
    );
    const casinoSettings = extractCasinoSettingsFromBlocks(
      homepage.blocks as unknown as Array<{
        __component: string;
        [key: string]: unknown;
      }>
    );

    // Parallel fetch all dynamic content
    const [games, blogs, casinos] = await Promise.all([
      // Fetch games using centralized function
      gameSettings.providers.length > 0
        ? fetchGamesByProviders(gameSettings.providers, {
            limit: gameSettings.totalGames,
            sortBy: gameSettings.sortBy,
            queryType: "homepage",
            gamesPerProvider: gameSettings.gamesQuotaPerProvider,
            cacheTime: REVALIDATE_TIMES.games,
          })
        : Promise.resolve([]),

      // Fetch blogs using centralized function
      blogSettings.hasBlogBlock
        ? fetchBlogsForHomepage({
            limit: blogSettings.limit,
            sortBy: blogSettings.sortBy,
            queryType: "homepage",
            cacheTime: REVALIDATE_TIMES.blogs,
          })
        : Promise.resolve([]),

      // Fetch casinos using centralized function
      casinoSettings.hasCasinoBlock
        ? fetchCasinosForHomepage({
            limit: casinoSettings.maxCasinos,
            sortBy: casinoSettings.sortBy,
            queryType: "standard",
            cacheTime: REVALIDATE_TIMES.casinos,
          })
        : Promise.resolve([]),
    ]);

    return {
      homepage,
      games,
      blogs: blogs || [],
      casinos: casinos || [],
    };
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);

    // Return minimal valid response on error
    return {
      homepage: {
        id: 0,
        documentId: "",
        title: "Homepage",
        updatedAt: new Date().toISOString(),
        blocks: [],
      },
      games: [],
      blogs: [],
      casinos: [],
    };
  }
});

/**
 * Next.js unstable_cache for persistent caching with ISR
 */
const getHomepageDataPersistent = unstable_cache(
  async () => {
    return getHomepageDataCached();
  },
  ["homepage-data"],
  {
    revalidate: REVALIDATE_TIMES.homepage,
    tags: ["homepage", "games", "blogs", "casinos"],
  }
);

/**
 * Main homepage data loader with multi-layer caching
 * Combines React cache (deduplication) and Next.js cache (persistence)
 */
export async function getHomepageData(
  options: {
    cached?: boolean;
  } = {}
): Promise<HomepageDataResponse> {
  const { cached = true } = options;

  // Use persistent cache by default
  if (cached) {
    return getHomepageDataPersistent();
  }

  // Direct fetch without persistent cache (still uses React cache)
  return getHomepageDataCached();
}

/**
 * Prefetch homepage data for specific routes
 * Use in page components or route handlers
 */
export async function prefetchHomepageData() {
  try {
    await Promise.all([
      strapiClient.prefetchCriticalData(),
      getHomepageData({ cached: true }),
    ]);
  } catch (error) {
    console.error("Prefetch error:", error);
  }
}

/**
 * Generate cache tags for CDN invalidation
 * Used with Cloudflare or similar CDN services
 */
export function generateHomepageCacheTags(
  data: HomepageDataResponse
): string[] {
  const tags = new Set<string>(["page:home", "type:homepage"]);

  // Add game-related tags
  if (data.games.length > 0) {
    tags.add("content:games");
    data.games.forEach((game) => {
      if (game.provider?.slug) {
        tags.add(`provider:${game.provider.slug}`);
      }
    });
  }

  // Add blog tags
  if (data.blogs.length > 0) {
    tags.add("content:blogs");
  }

  // Add casino tags
  if (data.casinos && data.casinos.length > 0) {
    tags.add("content:casinos");
  }

  // Add version tag
  tags.add(`version:${data.homepage.updatedAt}`);

  return Array.from(tags);
}

/**
 * Generate ETag for conditional requests
 * Enables efficient browser caching
 */
export async function generateHomepageETag(
  data: HomepageDataResponse
): Promise<string> {
  const signature = {
    updatedAt: data.homepage.updatedAt,
    blocksCount: data.homepage.blocks.length,
    gameIds: data.games.slice(0, 10).map((g) => g.id),
    blogIds: data.blogs.slice(0, 10).map((b) => b.id),
    casinoIds: data.casinos?.slice(0, 5).map((c) => c.id) || [],
  };

  // Use Web Crypto API for better performance
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(signature));
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return `W/"${hash}"`;
}

/**
 * Revalidate homepage cache
 * Use in webhook handlers or server actions
 */
export async function revalidateHomepageCache() {
  const { revalidateTag } = await import("next/cache");

  revalidateTag("homepage");
  revalidateTag("games");
  revalidateTag("blogs");
  revalidateTag("casinos");

  // Also clear Redis cache for immediate updates
  await strapiClient.invalidateCache("homepage");
}
