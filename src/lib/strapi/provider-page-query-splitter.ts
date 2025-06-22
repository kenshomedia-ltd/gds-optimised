// src/lib/strapi/provider-page-query-splitter.ts

import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import type {
  ProviderPageData,
  ProviderPageMetadata,
  ProviderPageResponse,
} from "@/types/provider.types";
import type { GameData } from "@/types/game.types";
// import type { CasinoData } from "@/types/casino.types";
// import { cacheManager } from "@/lib/cache/cache-manager";

// Cache configuration
const CACHE_CONFIG = {
  structure: { ttl: 300, tags: ["provider-page-structure"] }, // 5 minutes
  games: { ttl: 60, tags: ["provider-games"] }, // 1 minute
  casinos: { ttl: 180, tags: ["provider-casinos"] }, // 3 minutes
  metadata: { ttl: 600, tags: ["provider-metadata"] }, // 10 minutes
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
 * Fetch provider page data with split queries
 */
const getProviderPageDataWithSplitQueries = async (
  slug: string
): Promise<ProviderPageResponse> => {
  try {
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
    const [gamesResponse] = await Promise.all([
      // Fetch games for this provider
      strapiClient.fetchWithCache<{ data: GameData[] }>(
        "games",
        buildGamesQuery(slug),
        CACHE_CONFIG.games.ttl
      ),
    ]);

    // 3. Combine all data
    const completeData: ProviderPageData = {
      ...pageData,
      games: gamesResponse.data || [],
      // relatedCasinos already included in pageData from the initial query
    };

    return {
      pageData: completeData,
      games: gamesResponse.data || [],
      casinos: pageData.relatedCasinos || [],
    };
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

      return response.data?.[0] || null;
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
