// src/lib/strapi/category-page-query-splitter.ts

import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
// import { cacheManager } from "@/lib/cache/cache-manager";
import type {
  CategoryPageData,
  CategoryPageMetadata,
  CategoryPageSplitData,
} from "@/types/category.types";
import type { GameData, CasinoData } from "@/types/strapi.types";

// Cache configuration for different parts
const CACHE_CONFIG = {
  structure: { ttl: 600, swr: 1200, tags: ["category-page-structure"] }, // 10min/20min
  games: { ttl: 60, swr: 180, tags: ["category-page-games"] }, // 1min/3min
  casinos: { ttl: 300, swr: 600, tags: ["category-page-casinos"] }, // 5min/10min
  metadata: { ttl: 600, swr: 1200, tags: ["category-page-meta"] }, // 10min/20min
};

/**
 * Build structure query for category pages
 */
function buildStructureQuery(slug: string) {
  return {
    fields: [
      "id",
      "title",
      "slug",
      "heading",
      "createdAt",
      "updatedAt",
      "publishedAt",
      "content1",
      "content2",
      "content3",
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
      IntroductionWithImage: {
        fields: ["heading", "introduction"],
        populate: {
          image: {
            fields: ["url", "mime", "width", "height", "alternativeText"],
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
 * Build query for related casinos
 */
function buildCasinosQuery() {
  return {
    fields: ["title", "slug", "ratingAvg", "ratingCount"],
    populate: {
      images: {
        fields: ["url", "width", "height", "alternativeText"],
      },
      casinoBonus: {
        fields: ["bonusUrl", "bonusLabel", "bonusCode"],
      },
      termsAndConditions: {
        fields: ["copy", "gambleResponsibly"],
      },
      providers: {
        fields: ["title"],
        populate: {
          images: {
            fields: ["url", "width", "height", "alternativeText"],
          },
        },
      },
    },
    pagination: {
      page: 1,
      pageSize: 10,
    },
    sort: ["ratingAvg:desc"],
  };
}

/**
 * Build query for category games
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
      categories: {
        slug: {
          $eq: slug,
        },
      },
    },
    pagination: {
      pageSize: 24,
      page: 1,
    },
    sort: ["createdAt:desc"],
  };
}

/**
 * Fetch category page data with split queries
 */
const getCategoryPageDataWithSplitQueries = async (
  slug: string
): Promise<{
  pageData: CategoryPageData | null;
  games: GameData[];
  casinos: CasinoData[];
}> => {
  try {
    // 1. Fetch page structure
    const structureQuery = buildStructureQuery(slug);
    const pageResponse = await strapiClient.fetchWithCache<{
      data: CategoryPageData[];
    }>("slot-categories", structureQuery, CACHE_CONFIG.structure.ttl);

    const pageData = pageResponse.data?.[0];

    if (!pageData) {
      return {
        pageData: null,
        games: [],
        casinos: [],
      };
    }

    // 2. Fetch dynamic content in parallel
    const [gamesResponse, casinosResponse] = await Promise.all([
      // Fetch games for this category
      strapiClient.fetchWithCache<{ data: GameData[] }>(
        "games",
        buildGamesQuery(slug),
        CACHE_CONFIG.games.ttl
      ),
      // Fetch related casinos if needed
      pageData.relatedCasinos
        ? strapiClient.fetchWithCache<{ data: CasinoData[] }>(
            "casinos",
            buildCasinosQuery(),
            CACHE_CONFIG.casinos.ttl
          )
        : Promise.resolve({ data: [] }),
    ]);

    return {
      pageData,
      games: gamesResponse.data || [],
      casinos: casinosResponse.data || [],
    };
  } catch (error) {
    console.error("Failed to fetch category page data:", error);
    return {
      pageData: null,
      games: [],
      casinos: [],
    };
  }
};

/**
 * Split category page data into static and dynamic parts
 */
export function splitCategoryPageData(
  data: CategoryPageData
): CategoryPageSplitData {
  return {
    staticData: {
      id: data.id,
      documentId: data.documentId,
      title: data.title,
      slug: data.slug,
      heading: data.heading,
      content1: data.content1,
      content2: data.content2,
      content3: data.content3,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      publishedAt: data.publishedAt,
      seo: data.seo,
      IntroductionWithImage: data.IntroductionWithImage,
      faqs: data.faqs,
    },
    dynamicData: {
      relatedCasinos: data.relatedCasinos,
    },
  };
}

/**
 * Merge static and dynamic data back together
 */
export function mergeCategoryPageData(
  staticData: CategoryPageSplitData["staticData"],
  dynamicData: CategoryPageSplitData["dynamicData"]
): CategoryPageData {
  return {
    ...staticData,
    ...dynamicData,
  };
}

/**
 * Cached metadata fetcher
 */
export const getCategoryPageMetadata = unstable_cache(
  async (slug: string): Promise<CategoryPageMetadata | null> => {
    try {
      const query = {
        fields: ["title", "slug", "publishedAt"],
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
        data: CategoryPageMetadata[];
      }>("slot-categories", query, CACHE_CONFIG.metadata.ttl);

      return response.data?.[0] || null;
    } catch (error) {
      console.error("Failed to fetch category page metadata:", error);
      return null;
    }
  },
  ["category-page-metadata"],
  {
    revalidate: CACHE_CONFIG.metadata.ttl,
    tags: CACHE_CONFIG.metadata.tags,
  }
);

/**
 * Export the cached version of the split query
 */
export const getCategoryPageDataSplit = unstable_cache(
  getCategoryPageDataWithSplitQueries,
  ["category-page-data-split"],
  {
    revalidate: 60, // 1 minute base revalidation
    tags: ["category-page"],
  }
);
