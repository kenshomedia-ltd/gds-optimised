// src/lib/strapi/homepage-query-splitter.ts
import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import { cacheManager } from "@/lib/cache/cache-manager";
import { getStrapiSort } from "@/lib/utils/sort-mappings";
import type {
  Homepage,
  HomeGameListBlock,
  HomeBlogListBlock,
  HomepageDataResponse,
} from "@/types/homepage.types";
import type { GameData, BlogData, CasinoData } from "@/types/strapi.types";

// Cache configuration for different parts
const CACHE_CONFIG = {
  structure: { ttl: 600, swr: 1200, tags: ["homepage-structure"] }, // 10min/20min
  games: { ttl: 60, swr: 180, tags: ["homepage-games"] }, // 1min/3min
  blogs: { ttl: 300, swr: 600, tags: ["homepage-blogs"] }, // 5min/10min
  casinos: { ttl: 300, swr: 600, tags: ["homepage-casinos"] }, // 5min/10min
};

/**
 * Fetch games for each provider separately
 * This ensures proper distribution of games per provider
 */
async function fetchGamesPerProvider(
  providerSlug: string,
  gamesPerProvider: number,
  sortBy: string
): Promise<GameData[]> {
  const cacheKey = `homepage-games:provider-${providerSlug}-sort-${sortBy}-limit-${gamesPerProvider}`;

  try {
    // Try to get from Redis cache first
    const cached = await cacheManager.get<GameData[]>(cacheKey);
    if (cached.data && !cached.isStale) {
      console.log(`Homepage games cache hit for provider: ${providerSlug}`);
      return cached.data;
    }
  } catch (error) {
    console.error("Cache error:", error);
  }

  const query = {
    fields: ["title", "slug", "ratingAvg", "ratingCount", "createdAt", "views"],
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
        slug: {
          $eq: providerSlug,
        },
      },
    },
    sort: [sortBy],
    pagination: {
      pageSize: gamesPerProvider,
      page: 1,
    },
  };

  try {
    const response = await strapiClient.fetchWithCache<{
      data: GameData[];
      meta: { pagination: { total: number } };
    }>("games", query, CACHE_CONFIG.games.ttl);

    const games = response.data || [];

    // Cache the results
    try {
      await cacheManager.set(cacheKey, games, {
        ttl: CACHE_CONFIG.games.ttl,
        swr: CACHE_CONFIG.games.swr,
      });
    } catch (error) {
      console.error("Failed to cache games:", error);
    }

    return games;
  } catch (error) {
    console.error(`Failed to fetch games for provider ${providerSlug}:`, error);
    return [];
  }
}

/**
 * Fetch games for homepage game list block
 */
async function fetchGamesForBlock(
  block: HomeGameListBlock
): Promise<GameData[]> {
  const providers =
    block.providers
      ?.map((item) => item.slotProvider?.slug)
      .filter((slug): slug is string => Boolean(slug)) || [];

  if (providers.length === 0) return [];

  const gamesPerProvider = block.numberOfGames || 6;
  const sortBy = getStrapiSort(block.sortBy) || "createdAt:desc";

  // Fetch games for each provider separately
  const gamePromises = providers.map((providerSlug) =>
    fetchGamesPerProvider(providerSlug, gamesPerProvider, sortBy)
  );

  // Wait for all provider queries to complete
  const gamesPerProviderArray = await Promise.all(gamePromises);

  // Flatten the array of arrays into a single array
  const allGames = gamesPerProviderArray.flat();

  return allGames;
}

/**
 * Fetch blogs for homepage
 */
async function fetchBlogsForBlock(
  block: HomeBlogListBlock
): Promise<BlogData[]> {
  const limit = block.numOfBlogs || 6;
  const cacheKey = `homepage-blogs:limit-${limit}`;

  try {
    // Try to get from Redis cache first
    const cached = await cacheManager.get<BlogData[]>(cacheKey);
    if (cached.data && !cached.isStale) {
      console.log("Homepage blogs cache hit");
      return cached.data;
    }
  } catch (error) {
    console.error("Cache error:", error);
  }

  const query = {
    fields: [
      "title",
      "slug",
      "blogBrief",
      "content1",
      "createdAt",
      "minutesRead",
    ],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"],
      },
      author: {
        fields: ["firstName", "lastName"],
      },
      blogCategory: { fields: ["blogCategory", "slug"] },
    },
    sort: ["createdAt:desc"], // Blogs typically sorted by newest
    pagination: {
      pageSize: limit,
      page: 1,
    },
  };

  const response = await strapiClient.fetchWithCache<{
    data: BlogData[];
    meta: { pagination: { total: number } };
  }>("blogs", query, CACHE_CONFIG.blogs.ttl);

  const blogs = response.data || [];

  // Cache the results
  try {
    await cacheManager.set(cacheKey, blogs, {
      ttl: CACHE_CONFIG.blogs.ttl,
      swr: CACHE_CONFIG.blogs.swr,
    });
  } catch (error) {
    console.error("Failed to cache blogs:", error);
  }

  return blogs;
}

/**
 * Fetch casinos for homepage
 */
async function fetchCasinos(): Promise<CasinoData[]> {
  const cacheKey = `homepage-casinos`;

  try {
    // Try to get from Redis cache first
    const cached = await cacheManager.get<CasinoData[]>(cacheKey);
    if (cached.data && !cached.isStale) {
      console.log("Homepage casinos cache hit");
      return cached.data;
    }
  } catch (error) {
    console.error("Cache error:", error);
  }

  const query = {
    fields: [
      "title",
      "slug",
      "ratingAvg",
      "ratingCount",
      "Badges",
      "createdAt",
    ],
    populate: {
      images: { fields: ["url", "width", "height"] },
      casinoBonus: { fields: ["bonusUrl", "bonusLabel", "bonusCode"] },
      noDepositSection: { fields: ["bonusAmount", "termsConditions"] },
      freeSpinsSection: { fields: ["bonusAmount", "termsConditions"] },
      bonusSection: {
        fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
      },
      termsAndConditions: { fields: ["copy", "gambleResponsibly"] },
    },
    sort: ["ratingAvg:desc"], // Casinos typically sorted by rating
    pagination: { pageSize: 10, page: 1 },
  };

  const response = await strapiClient.fetchWithCache<{
    data: CasinoData[];
    meta: { pagination: { total: number } };
  }>("casinos", query, CACHE_CONFIG.casinos.ttl);

  const casinos = response.data || [];

  // Cache the results
  try {
    await cacheManager.set(cacheKey, casinos, {
      ttl: CACHE_CONFIG.casinos.ttl,
      swr: CACHE_CONFIG.casinos.swr,
    });
  } catch (error) {
    console.error("Failed to cache casinos:", error);
  }

  return casinos;
}

/**
 * Optimized homepage data fetching with split queries
 */
const getHomepageDataWithSplitQueries =
  async (): Promise<HomepageDataResponse> => {
    // Check if we have the complete page data in cache
    const completeCacheKey = `homepage-complete`;
    try {
      const cached = await cacheManager.get<HomepageDataResponse>(
        completeCacheKey
      );
      if (cached.data && !cached.isStale) {
        console.log("Complete homepage cache hit");
        return cached.data;
      }
    } catch (error) {
      console.error("Cache error:", error);
    }

    // Fetch homepage structure with all block data
    const homepageQuery = {
      fields: ["title", "heading", "updatedAt"],
      populate: {
        blocks: {
          on: {
            "shared.single-content": {
              populate: "*",
            },
            "homepage.home-game-list": {
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
              populate: "*",
            },
            "shared.introduction-with-image": {
              populate: {
                image: {
                  fields: ["url", "mime", "width", "height", "alternativeText"],
                },
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
              populate: {
                overviews: {
                  fields: ["title", "url"],
                  populate: {
                    card_img: {
                      fields: ["url", "width", "height", "alternativeText"],
                    },
                  },
                },
              },
            },
            "homepage.home-blog-list": {
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

    const homepageResponse = await strapiClient.fetchWithCache<{
      data: Homepage;
    }>("homepage", homepageQuery, CACHE_CONFIG.structure.ttl);

    const homepage = homepageResponse.data;

    // Extract settings for dynamic content
    const gameBlock = homepage.blocks.find(
      (block): block is HomeGameListBlock =>
        block.__component === "homepage.home-game-list"
    );

    const blogBlock = homepage.blocks.find(
      (block): block is HomeBlogListBlock =>
        block.__component === "homepage.home-blog-list"
    );

    const hasCasinoBlock = homepage.blocks.some(
      (block) => block.__component === "homepage.home-casino-list"
    );

    // Fetch dynamic content separately in parallel for better caching
    const [games, blogs, casinos] = await Promise.all([
      gameBlock ? fetchGamesForBlock(gameBlock) : Promise.resolve([]),
      blogBlock ? fetchBlogsForBlock(blogBlock) : Promise.resolve([]),
      hasCasinoBlock ? fetchCasinos() : Promise.resolve([]),
    ]);

    const result = {
      homepage,
      games,
      blogs,
      casinos,
    };

    // Cache the complete result
    try {
      await cacheManager.set(completeCacheKey, result, {
        ttl: Math.min(CACHE_CONFIG.structure.ttl, CACHE_CONFIG.games.ttl),
        swr: Math.min(CACHE_CONFIG.structure.swr, CACHE_CONFIG.games.swr),
      });
    } catch (error) {
      console.error("Failed to cache complete homepage:", error);
    }

    return result;
  };

/**
 * Export the cached version of the split query
 * This approach fetches the full homepage structure but separates dynamic content
 */
export const getHomepageDataSplit = unstable_cache(
  getHomepageDataWithSplitQueries,
  ["homepage-data-split"],
  {
    revalidate: 60, // 1 minute base revalidation
    tags: ["homepage"],
  }
);
