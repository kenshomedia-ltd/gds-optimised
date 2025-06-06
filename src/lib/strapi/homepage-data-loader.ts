// src/lib/strapi/homepage-data-loader.ts
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { strapiClient } from "./strapi-client";
import type {
  Homepage,
  HomepageBlock,
  HomeGameListBlock,
  HomeBlogListBlock,
  // HomeCasinoListBlock,
  HomepageDataResponse,
  ExtractedGameSettings,
} from "@/types/homepage.types";
import type {
  GameData,
  BlogData,
  CasinoData
} from "@/types/strapi.types";

// Revalidation times for different content types
const REVALIDATE_TIMES = {
  homepage: 300, // 5 minutes
  games: 60, // 1 minute for frequently updating content
  blogs: 600, // 10 minutes
  casinos: 600, // 10 minutes
};

// Map sortBy values to Strapi sort parameters
const SORT_BY_MAP: Record<string, string> = {
  Newest: "createdAt:desc",
  Popular: "views:desc,ratingAvg:desc",
  Rating: "ratingAvg:desc",
  Alphabetical: "title:asc",
  nuove: "createdAt:desc",
  az: "title:asc",
  za: "title:desc",
  giocati: "views:desc",
  votate: "ratingAvg:desc",
} as const;

/**
 * Extract game settings from homepage blocks
 * Optimized to reduce iterations and improve type safety
 */
function extractGameSettings(homepage: Homepage): ExtractedGameSettings {
  const gameBlock = homepage.blocks.find(
    (block): block is HomeGameListBlock =>
      block.__component === "homepage.home-game-list"
  );

  if (!gameBlock) {
    return {
      providers: [],
      totalGamesToDisplay: 18, // 6 * 3 default
      gamesQuotaPerProvider: 6,
      sortBy: "createdAt:desc",
    };
  }

  // Extract provider slugs efficiently
  const providers =
    gameBlock.providers
      ?.map((item) => item.slotProvider?.slug)
      .filter((slug): slug is string => Boolean(slug)) || [];

  const gamesQuotaPerProvider = gameBlock.numberOfGames || 6;
  const numProviders = Math.max(providers.length, 1);
  const totalGamesToDisplay = gamesQuotaPerProvider * numProviders;
  const sortBy = SORT_BY_MAP[gameBlock.sortBy || "Newest"] || "createdAt:desc";

  return {
    providers,
    totalGamesToDisplay,
    gamesQuotaPerProvider,
    sortBy,
  };
}

/**
 * Extract blog settings from homepage blocks
 */
function extractBlogSettings(homepage: Homepage): {
  limit: number;
  sort: string;
} {
  const blogBlock = homepage.blocks.find(
    (block): block is HomeBlogListBlock =>
      block.__component === "homepage.home-blog-list"
  );

  return {
    limit: blogBlock?.numOfBlogs || 6,
    sort: "createdAt:desc",
  };
}

/**
 * Fetch games for specific providers with optimized queries
 * Uses batching and minimal field selection for performance
 */
async function fetchGamesForProviders(
  providers: string[],
  totalGamesToDisplay: number,
  sortBy: string,
  gamesPerProvider: number
): Promise<GameData[]> {
  if (providers.length === 0) return [];

  try {
    // Optimized query with minimal fields and efficient filtering
    const query = {
      fields: [
        "title",
        "slug",
        "ratingAvg",
        "ratingCount",
        "createdAt",
        "views",
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
      filters: {
        provider: {
          slug: { $in: providers },
        },
      },
      sort: [sortBy],
      pagination: {
        pageSize: Math.min(totalGamesToDisplay * 2, 100), // Cap at 100 for performance
        page: 1,
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: GameData[];
      meta: { pagination: { total: number } };
    }>(
      "games",
      query,
      REVALIDATE_TIMES.games
    );

    if (!response.data || response.data.length === 0) return [];

    // Efficient grouping using Map
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
      if (allGames.length >= totalGamesToDisplay) break;
    }

    return allGames.slice(0, totalGamesToDisplay);
  } catch (error) {
    console.error("Failed to fetch games for providers:", error);
    return [];
  }
}

/**
 * Build optimized homepage query
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
const getHomepageDataCached = cache(
  async (): Promise<HomepageDataResponse> => {
    try {
      // Fetch homepage structure first
      const homepageQuery = buildHomepageQuery();
      const homepageResponse = await strapiClient.fetchWithCache<{
        data: Homepage;
      }>(
        "homepage",
        homepageQuery,
        REVALIDATE_TIMES.homepage
      );

      const homepage = homepageResponse.data;

      // Extract settings for parallel fetching
      const gameSettings = extractGameSettings(homepage);
      const blogSettings = extractBlogSettings(homepage);
      const hasCasinoBlock = homepage.blocks.some(
        (block: HomepageBlock) =>
          block.__component === "homepage.home-casino-list"
      );

      // Parallel fetch all dynamic content
      const [games, blogsResponse, casinos] = await Promise.all([
        // Fetch games if providers are specified
        gameSettings.providers.length > 0
          ? fetchGamesForProviders(
            gameSettings.providers,
            gameSettings.totalGamesToDisplay,
            gameSettings.sortBy,
            gameSettings.gamesQuotaPerProvider
          )
          : Promise.resolve([]),

        // Fetch blogs
        strapiClient.fetchWithCache<{
          data: BlogData[];
          meta: { pagination: { total: number } };
        }>(
          "blogs",
          {
            fields: [
              "title",
              "slug",
              "blogBrief",
              "createdAt",
              "updatedAt",
              "publishedAt",
              "minutesRead",
            ],
            populate: {
              images: {
                fields: ["url", "alternativeText", "width", "height"],
              },
              author: {
                fields: ["firstName", "lastName"],
                populate: {
                  photo: { fields: ["url", "width", "height"] },
                },
              },
              blogCategory: { fields: ["blogCategory", "slug"] },
            },
            sort: [blogSettings.sort],
            pagination: {
              pageSize: blogSettings.limit,
              page: 1,
            },
          },
          REVALIDATE_TIMES.blogs
        ),

        // Fetch casinos if needed
        hasCasinoBlock
          ? strapiClient.fetchWithCache<{
              data: CasinoData[];
              meta: { pagination: { total: number } };
            }>(
              "casinos",
              {
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
                    fields: [
                      "bonusAmount",
                      "termsConditions",
                      "cashBack",
                      "freeSpin",
                    ],
                  },
                },
                sort: ["ratingAvg:desc"],
                pagination: { pageSize: 10, page: 1 },
              },
              REVALIDATE_TIMES.casinos
            )
          : Promise.resolve({ data: [] }),
      ]);

      return {
        homepage,
        games,
        blogs: blogsResponse.data || [],
        casinos: casinos.data || [],
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
  }
);

/**
 * Next.js unstable_cache for persistent caching with ISR
 */
const getHomepageDataPersistent = unstable_cache(
  async (locale?: string) => {
    return getHomepageDataCached(locale);
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
    locale?: string;
    cached?: boolean;
  } = {}
): Promise<HomepageDataResponse> {
  const { locale = "en", cached = true } = options;

  // Use persistent cache by default
  if (cached) {
    return getHomepageDataPersistent(locale);
  }

  // Direct fetch without persistent cache (still uses React cache)
  return getHomepageDataCached(locale);
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
