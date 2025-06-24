// src/lib/strapi/casino-provider-query-splitter.ts

import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import type {
  CasinoProviderPageData,
  CasinoProviderPageSplitData,
  CasinoProviderPageResponse,
} from "@/types/casino-provider.types";

// Cache configuration for different parts
const CACHE_CONFIG = {
  structure: { ttl: 600, swr: 1200, tags: ["casino-provider-structure"] }, // 10min/20min
  dynamic: { ttl: 60, swr: 180, tags: ["casino-provider-dynamic"] }, // 1min/3min
  comparison: { ttl: 300, swr: 600, tags: ["casino-comparison"] }, // 5min/10min
};

/**
 * Build the casino provider page query
 */
export function buildCasinoProviderPageQuery(slug: string) {
  return {
    fields: [
      "title",
      "content1",
      "content2",
      "content3",
      "slug",
      "createdAt",
      "updatedAt",
    ],
    populate: {
      seo: {
        fields: ["metaTitle", "metaDescription"],
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
      casinoComparison: {
        fields: [
          "title",
          "slug",
          "playthrough",
          "ratingAvg",
          "ratingCount",
          "authorRatings",
          "publishedAt",
        ],
        populate: {
          noDepositSection: {
            fields: ["bonusAmount", "termsConditions"],
          },
          freeSpinsSection: {
            fields: ["bonusAmount", "termsConditions"],
          },
          bonusSection: {
            fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
          },
          casinoBonus: {
            fields: ["bonusUrl", "bonusLabel", "bonusCode"],
          },
          termsAndConditions: {
            fields: ["copy"],
          },
          images: {
            fields: ["url", "alternativeText", "width", "height"],
          },
          providers: {
            populate: {
              images: {
                fields: ["url", "width", "height"],
              },
            },
          },
        },
      },
      casinoLists: {
        fields: [
          "title",
          "slug",
          "playthrough",
          "ratingAvg",
          "ratingCount",
          "authorRatings",
          "publishedAt",
        ],
        populate: {
          noDepositSection: {
            fields: ["bonusAmount", "termsConditions"],
          },
          freeSpinsSection: {
            fields: ["bonusAmount", "termsConditions"],
          },
          bonusSection: {
            fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
          },
          casinoBonus: {
            fields: ["bonusUrl", "bonusLabel", "bonusCode"],
          },
          termsAndConditions: {
            fields: ["copy"],
          },
          images: {
            fields: ["url", "alternativeText", "width", "height"],
          },
          providers: {
            populate: {
              images: {
                fields: ["url", "width", "height"],
              },
            },
          },
        },
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
 * Split casino provider page data into static and dynamic parts
 */
export function splitCasinoProviderPageData(
  data: CasinoProviderPageData
): CasinoProviderPageSplitData {
  return {
    staticData: {
      id: data.id,
      documentId: data.documentId,
      title: data.title,
      slug: data.slug,
      content1: data.content1,
      content2: data.content2,
      content3: data.content3,
      IntroductionWithImage: data.IntroductionWithImage,
      faqs: data.faqs,
      seo: data.seo,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    },
    dynamicData: {
      casinoComparison: data.casinoComparison,
      casinoLists: data.casinoLists,
    },
  };
}

/**
 * Merge static and dynamic data back together
 */
export function mergeCasinoProviderPageData(
  staticData: CasinoProviderPageSplitData["staticData"],
  dynamicData: CasinoProviderPageSplitData["dynamicData"]
): CasinoProviderPageData {
  return {
    ...staticData,
    ...dynamicData,
  };
}

/**
 * Fetch casino provider page data with split queries
 * This function is internal and not exported directly
 */
async function getCasinoProviderPageDataWithSplitQueries(
  slug: string
): Promise<CasinoProviderPageResponse> {
  try {
    // Fetch the main casino provider data
    const query = buildCasinoProviderPageQuery(slug);

    const response = await strapiClient.fetchWithCache<{
      data: CasinoProviderPageData[];
    }>("casino-providers", query, CACHE_CONFIG.structure.ttl);

    const casinoProviderData = response.data?.[0] || null;

    if (!casinoProviderData) {
      return {
        pageData: null,
        comparisonCasinos: [],
        casinoLists: [],
      };
    }

    // Extract comparison casinos from the casinoComparison field (for hero section)
    // and casinoLists (for main content area)
    const comparisonCasinos = casinoProviderData.casinoComparison || [];
    const casinoLists = casinoProviderData.casinoLists || [];

    return {
      pageData: casinoProviderData,
      comparisonCasinos,
      casinoLists,
    };
  } catch (error) {
    console.error("Failed to fetch casino provider page data:", error);
    return {
      pageData: null,
      comparisonCasinos: [],
      casinoLists: [],
    };
  }
}

/**
 * Export the cached version of the split query
 */
export const getCasinoProviderPageDataSplit = unstable_cache(
  getCasinoProviderPageDataWithSplitQueries,
  ["casino-provider-page-data-split"],
  {
    revalidate: 60, // 1 minute base revalidation
    tags: ["casino-provider-page"],
  }
);

/**
 * Cached metadata fetcher
 */
export const getCasinoProviderPageMetadata = unstable_cache(
  async (slug: string): Promise<CasinoProviderPageData | null> => {
    try {
      const query = {
        fields: ["title", "slug"],
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
        data: CasinoProviderPageData[];
      }>("casino-providers", query, CACHE_CONFIG.structure.ttl);

      return response.data?.[0] || null;
    } catch (error) {
      console.error("Failed to fetch casino provider page metadata:", error);
      return null;
    }
  },
  ["casino-provider-page-metadata"],
  {
    revalidate: CACHE_CONFIG.structure.ttl,
    tags: CACHE_CONFIG.structure.tags,
  }
);
