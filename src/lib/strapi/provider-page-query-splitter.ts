// src/lib/strapi/provider-page-query-splitter.ts

import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import { cacheManager } from "@/lib/cache/cache-manager";
import type {
  ProviderPageData,
  ProviderPageMetadata,
  ProviderPageResponse,
} from "@/types/provider.types";
import type { GameData } from "@/types/game.types";

// Cache configuration
const CACHE_CONFIG = {
  structure: { ttl: 300, swr: 600, tags: ["provider-page-structure"] }, // 5min/10min
  games: { ttl: 60, swr: 180, tags: ["provider-games"] }, // 1min/3min
  casinos: { ttl: 180, swr: 360, tags: ["provider-casinos"] }, // 3min/6min
  metadata: { ttl: 600, swr: 1200, tags: ["provider-metadata"] }, // 10min/20min
};

/**
 * Build structure query for provider page
 */
function buildStructureQuery(slug: string) {
  return {
    fields: [
      "id",
      "documentId",
      "title",
      "slug",
      "heading",
      "content1",
      "content2",
      "content3",
      "createdAt",
      "updatedAt",
      "publishedAt",
    ],
    populate: {
      seo: {
        fields: ["metaTitle", "metaDescription", "keywords"],
      },
      images: {
        fields: ["url", "width", "height", "alternativeText"],
      },
      IntroductionWithImage: {
        fields: ["heading", "introduction"],
        populate: {
          image: {
            fields: ["url", "width", "height", "alternativeText"],
          },
        },
      },
      relatedCasinos: {
        fields: [
          "id",
          "documentId",
          "title",
          "slug",
          "ratingAvg",
          "ratingCount",
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
          bonusSection: {
            fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
          },
          termsAndConditions: {
            fields: ["copy", "gambleResponsibly"],
          },
        },
      },
      faqs: {
        fields: ["question", "answer"],
      },
    },
    filters: {
      slug: {
        $eq: slug,
      },
    },
    pagination: {
      page: 1,
      pageSize: 1,
    },
  };
}

/**
 * Build query for provider games
 */
function buildGamesQuery(slug: string) {
  return {
    fields: [
      "id",
      "title",
      "slug",
      "ratingAvg",
      "ratingCount",
      "createdAt",
      "publishedAt",
    ],
    populate: {
      images: {
        fields: ["url", "width", "height", "alternativeText"],
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
          $eq: slug,
        },
      },
    },
    sort: ["ratingAvg:desc"],
    // No pagination to get all games
  };
}

/**
 * Fetch provider games with Redis caching
 */
async function fetchProviderGames(slug: string): Promise<GameData[]> {
  const cacheKey = `provider-games:${slug}`;

  try {
    // Try to get from Redis cache first
    const cached = await cacheManager.get<GameData[]>(cacheKey);
    if (cached.data && !cached.isStale) {
      console.log(`Provider games cache hit for: ${slug}`);
      return cached.data;
    }

    // If stale, we'll fetch fresh data
    if (cached.isStale) {
      console.log(`Provider games cache stale for: ${slug}`);
    }
  } catch (error) {
    console.error("Cache error:", error);
  }

  // Fetch fresh data
  const response = await strapiClient.fetchWithCache<{ data: GameData[] }>(
    "games",
    buildGamesQuery(slug),
    CACHE_CONFIG.games.ttl
  );

  const games = response.data || [];

  // Cache the results
  try {
    await cacheManager.set(cacheKey, games, {
      ttl: CACHE_CONFIG.games.ttl,
      swr: CACHE_CONFIG.games.swr,
    });
  } catch (error) {
    console.error("Failed to cache provider games:", error);
  }

  return games;
}

/**
 * Fetch provider page data with split queries
 */
const getProviderPageDataWithSplitQueries = async (
  slug: string
): Promise<ProviderPageResponse> => {
  try {
    // Check if we have the complete page data in cache
    const pageCacheKey = `provider-page-complete:${slug}`;
    try {
      const cached = await cacheManager.get<ProviderPageResponse>(pageCacheKey);

      if (cached.data && !cached.isStale) {
        console.log(`Complete provider page cache hit for: ${slug}`);
        return cached.data;
      }
    } catch (error) {
      console.error("Cache error:", error);
    }

    // 1. Fetch page structure
    const structureQuery = buildStructureQuery(slug);
    const pageResponse = await strapiClient.fetchWithCache<{
      data: ProviderPageData[];
    }>("slot-providers", structureQuery, CACHE_CONFIG.structure.ttl);

    const pageData = pageResponse.data?.[0];

    if (!pageData) {
      return {
        pageData: null,
        games: [],
        casinos: [],
      };
    }

    // 2. Fetch dynamic content in parallel
    const [games] = await Promise.all([
      // Fetch games for this provider
      fetchProviderGames(slug),
    ]);

    // 3. Combine all data
    const completeData: ProviderPageData = {
      ...pageData,
      games,
      // relatedCasinos already included in pageData from the initial query
    };

    const result = {
      pageData: completeData,
      games,
      casinos: pageData.relatedCasinos || [],
    };

    // Cache the complete result
    try {
      await cacheManager.set(pageCacheKey, result, {
        ttl: Math.min(CACHE_CONFIG.structure.ttl, CACHE_CONFIG.games.ttl),
        swr: Math.min(CACHE_CONFIG.structure.swr, CACHE_CONFIG.games.swr),
      });
    } catch (error) {
      console.error("Failed to cache complete provider page data:", error);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch provider page data:", error);
    return {
      pageData: null,
      games: [],
      casinos: [],
    };
  }
};

/**
 * Get provider page metadata only (for metadata generation)
 */
export const getProviderPageMetadata = unstable_cache(
  async (slug: string): Promise<ProviderPageMetadata | null> => {
    const cacheKey = `provider-metadata:${slug}`;

    try {
      // Try Redis cache first
      const cached = await cacheManager.get<ProviderPageMetadata>(cacheKey);
      if (cached.data) {
        console.log(`Provider metadata cache hit for: ${slug}`);
        return cached.data;
      }
    } catch (error) {
      console.error("Cache error:", error);
    }

    try {
      const query = {
        fields: ["id", "title", "slug", "publishedAt"],
        populate: {
          seo: {
            fields: ["metaTitle", "metaDescription", "keywords"],
          },
        },
        filters: {
          slug: { $eq: slug },
        },
        pagination: { page: 1, pageSize: 1 },
      };

      const response = await strapiClient.fetchWithCache<{
        data: ProviderPageMetadata[];
      }>("slot-providers", query, CACHE_CONFIG.metadata.ttl);

      const metadata = response.data?.[0] || null;

      // Cache the result
      if (metadata) {
        try {
          await cacheManager.set(cacheKey, metadata, {
            ttl: CACHE_CONFIG.metadata.ttl,
            swr: CACHE_CONFIG.metadata.swr,
          });
        } catch (error) {
          console.error("Failed to cache metadata:", error);
        }
      }

      return metadata;
    } catch (error) {
      console.error("Failed to fetch provider page metadata:", error);
      return null;
    }
  },
  ["provider-page-metadata"],
  {
    revalidate: CACHE_CONFIG.metadata.ttl,
    tags: CACHE_CONFIG.metadata.tags,
  }
);

/**
 * Export the cached version of the split query
 */
export const getProviderPageDataSplit = unstable_cache(
  getProviderPageDataWithSplitQueries,
  ["provider-page-data-split"],
  {
    revalidate: 60, // 1 minute base revalidation
    tags: ["provider-page"],
  }
);
