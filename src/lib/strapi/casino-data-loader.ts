// src/lib/strapi/casino-data-loader.ts

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { strapiClient } from "./strapi-client";
import {
  splitCasinoPageData,
  mergeCasinoPageData,
} from "./casino-page-query-splitter";
import type {
  CasinoPageData,
  CasinoPageSplitData,
  CasinoPageDataResponse,
} from "@/types/casino-page.types";
import type { GameProvider } from "@/types/game.types";
import type { CasinoData } from "@/types/casino.types";
import type { GameData } from "@/types/game.types";

// Revalidation times for different content types (in seconds)
const REVALIDATE_TIMES = {
  structure: 600, // 10 minutes for static content
  dynamic: 60, // 1 minute for ratings/bonuses
  providers: 300, // 5 minutes for provider lists
  comparison: 300, // 5 minutes for comparison casinos
  games: 300, // 5 minutes for games
};

/**
 * Build static casino query (structure, content, metadata)
 */
function buildStaticCasinoQuery(slug: string) {
  return {
    fields: [
      "title",
      "slug",
      "createdAt",
      "updatedAt",
      "publishedAt",
      "heading",
      "introduction",
      "content1",
      "content2",
      "content3",
      "content4",
    ],
    populate: {
      casinoFeatures: {
        fields: ["feature"],
      },
      howTo: {
        fields: ["title", "description"],
        populate: {
          howToGroup: {
            fields: ["heading", "copy"],
            populate: {
              image: {
                fields: ["url", "width", "height"],
              },
            },
          },
        },
      },
      proscons: {
        fields: ["heading"],
        populate: {
          pros: {
            fields: ["list"],
          },
          cons: {
            fields: ["list"],
          },
          proImage: {
            fields: ["url", "width", "height"],
          },
          conImage: {
            fields: ["url", "width", "height"],
          },
        },
      },
      paymentOptions: {
        fields: [
          "creditCard",
          "skrill",
          "paypal",
          "postepay",
          "wireTransfer",
          "neteller",
          "ukash",
          "paysafe",
        ],
      },
      casinoGeneralInfo: {
        fields: [
          "website",
          "regulationLicense",
          "telephone",
          "societa",
          "email",
          "address",
          "wageringRequirements",
          "downloadApp",
          "vip",
        ],
      },
      testimonial: {
        fields: ["testimonial"],
        populate: {
          approvedBy: {
            fields: ["firstName", "lastName", "jobTitle"],
            populate: {
              photo: {
                fields: ["url", "width", "height"],
              },
            },
          },
        },
      },
      faqs: {
        fields: ["question", "answer"],
      },
      author: {
        fields: [
          "firstName",
          "lastName",
          "linkedInLink",
          "facebookLink",
          "twitterLink",
          "jobTitle",
          "content1",
          "experience",
          "areaOfWork",
          "specialization",
        ],
        populate: {
          photo: {
            fields: ["url", "width", "height"],
          },
        },
      },
      seo: {
        fields: ["metaTitle", "metaDescription", "keywords"],
      },
      paymentChannels: {
        fields: ["name"],
        populate: {
          logo: {
            fields: ["url", "width", "height"],
          },
        },
      },
      blocks: {
        on: {
          "shared.image-carousel": {
            fields: ["carouselTitle"],
            populate: {
              image: {
                fields: ["url", "alternativeText", "mime", "width", "height"],
              },
            },
          },
        },
      },
    },
    filters: {
      slug: { $eq: slug },
    },
    pagination: { page: 1, pageSize: 1 },
  };
}

/**
 * Build dynamic casino query (ratings, bonuses, images)
 */
function buildDynamicCasinoQuery(slug: string) {
  return {
    fields: ["ratingAvg", "ratingCount", "authorRatings", "playthrough"],
    populate: {
      images: {
        fields: ["url", "width", "height", "alternativeText"],
      },
      bonusSection: {
        fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
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
      casinoBonus: {
        fields: ["bonusLabel", "bonusUrl", "bonusCode"],
      },
    },
    filters: {
      slug: { $eq: slug },
    },
    pagination: { page: 1, pageSize: 1 },
  };
}

/**
 * Fetch casino providers separately
 */
async function fetchCasinoProviders(casinoId: number): Promise<GameProvider[]> {
  const query = {
    fields: ["id"],
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
    filters: {
      id: { $eq: casinoId },
    },
    pagination: { page: 1, pageSize: 1 },
  };

  try {
    const response = await strapiClient.fetchWithCache<{
      data: Array<{ providers?: GameProvider[] }>;
    }>("casinos", query, REVALIDATE_TIMES.providers);

    return response.data?.[0]?.providers || [];
  } catch (error) {
    console.error("Failed to fetch casino providers:", error);
    return [];
  }
}

/**
 * Fetch comparison casinos separately
 */
async function fetchComparisonCasinos(casinoId: number): Promise<CasinoData[]> {
  const query = {
    fields: ["id"],
    populate: {
      casinoComparison: {
        fields: ["title", "slug", "ratingAvg", "ratingCount", "publishedAt"],
        populate: {
          images: {
            fields: ["url", "width", "height"],
          },
          bonusSection: {
            fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
          },
          noDepositSection: {
            fields: ["bonusAmount", "termsConditions"],
          },
          freeSpinsSection: {
            fields: ["bonusAmount", "termsConditions"],
          },
          casinoBonus: {
            fields: ["bonusUrl", "bonusLabel", "bonusCode"],
          },
          providers: {
            fields: ["title", "slug"],
            populate: {
              images: {
                fields: ["url", "width", "height"],
              },
            },
          },
          termsAndConditions: {
            fields: ["copy"],
          },
        },
      },
    },
    filters: {
      id: { $eq: casinoId },
    },
    pagination: { page: 1, pageSize: 1 },
  };

  try {
    const response = await strapiClient.fetchWithCache<{
      data: Array<{ casinoComparison?: CasinoData[] }>;
    }>("casinos", query, REVALIDATE_TIMES.comparison);

    return response.data?.[0]?.casinoComparison || [];
  } catch (error) {
    console.error("Failed to fetch comparison casinos:", error);
    return [];
  }
}

/**
 * Fetch static casino data
 */
async function fetchStaticCasinoData(
  slug: string
): Promise<CasinoPageSplitData["staticData"] | null> {
  const staticQuery = buildStaticCasinoQuery(slug);

  const response = await strapiClient.fetchWithCache<{
    data: CasinoPageData[];
  }>("casinos", staticQuery, REVALIDATE_TIMES.structure);

  const data = response.data?.[0];

  if (!data) {
    return null;
  }

  // Extract static fields
  const { staticData } = splitCasinoPageData(data);
  return staticData;
}

/**
 * Fetch dynamic casino data
 */
async function fetchDynamicCasinoData(
  slug: string
): Promise<CasinoPageSplitData["dynamicData"] | null> {
  const dynamicQuery = buildDynamicCasinoQuery(slug);

  const response = await strapiClient.fetchWithCache<{
    data: CasinoPageData[];
  }>("casinos", dynamicQuery, REVALIDATE_TIMES.dynamic);

  const data = response.data?.[0];

  if (!data) {
    return null;
  }

  // Extract dynamic fields
  const { dynamicData } = splitCasinoPageData(data);
  return dynamicData;
}

/**
 * Fetch games for casino providers
 */
export async function fetchGamesForCasino(
  providerSlugs: string[],
  limit: number = 12
): Promise<GameData[]> {
  if (!providerSlugs.length) return [];

  try {
    const query = {
      fields: ["title", "slug", "ratingAvg", "ratingCount"],
      populate: {
        images: {
          fields: ["url", "width", "height", "alternativeText"],
        },
        provider: {
          fields: ["title", "slug"],
        },
      },
      filters: {
        provider: {
          slug: { $in: providerSlugs },
        },
      },
      sort: ["ratingAvg:desc"],
      pagination: {
        pageSize: limit,
        page: 1,
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: GameData[];
    }>("games", query, REVALIDATE_TIMES.games);

    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch games for casino:", error);
    return [];
  }
}

/**
 * Main casino data fetching function with split queries
 */
async function fetchCasinoDataWithSplitQueries(
  slug: string
): Promise<CasinoPageDataResponse> {
  try {
    // Step 1: Fetch static data first
    const staticData = await fetchStaticCasinoData(slug);

    if (!staticData) {
      return {
        casinoData: null,
        relatedProviders: [],
        comparisonCasinos: [],
      };
    }

    // Step 2: Fetch dynamic data in parallel
    const [dynamicData, providers, comparisonCasinos] = await Promise.all([
      fetchDynamicCasinoData(slug),
      fetchCasinoProviders(staticData.id),
      fetchComparisonCasinos(staticData.id),
    ]);

    if (!dynamicData) {
      return {
        casinoData: null,
        relatedProviders: [],
        comparisonCasinos: [],
      };
    }

    // Step 3: Merge data
    dynamicData.providers = providers;
    dynamicData.casinoComparison = comparisonCasinos;

    const casinoData = mergeCasinoPageData(staticData, dynamicData);

    return {
      casinoData,
      relatedProviders: providers,
      comparisonCasinos,
    };
  } catch (error) {
    console.error("Failed to fetch casino page data:", error);
    return {
      casinoData: null,
      relatedProviders: [],
      comparisonCasinos: [],
    };
  }
}

/**
 * React cache wrapper for request deduplication
 */
const getCasinoDataCached = cache(fetchCasinoDataWithSplitQueries);

/**
 * Persistent cache with ISR
 */
const getCasinoDataPersistent = unstable_cache(
  fetchCasinoDataWithSplitQueries,
  ["casino-page-data"],
  {
    revalidate: REVALIDATE_TIMES.dynamic,
    tags: ["casino-page", "casinos"],
  }
);

/**
 * Main export - fetches casino data with optimal caching
 */
export async function getCasinoPageData(
  slug: string,
  options: { cached?: boolean } = {}
): Promise<CasinoPageDataResponse> {
  const { cached = true } = options;

  // Use persistent cache by default
  if (cached) {
    return getCasinoDataPersistent(slug);
  }

  // Direct fetch without persistent cache (still uses React cache)
  return getCasinoDataCached(slug);
}

/**
 * Get casino page data with games
 * Convenience function that includes games fetching
 */
export async function getCasinoPageDataWithGames(
  slug: string,
  options: { cached?: boolean; gamesLimit?: number } = {}
): Promise<CasinoPageDataResponse & { games: GameData[] }> {
  const { gamesLimit = 12 } = options;

  // Get casino data
  const casinoResponse = await getCasinoPageData(slug, options);

  if (!casinoResponse.casinoData) {
    return {
      ...casinoResponse,
      games: [],
    };
  }

  // Extract provider slugs
  const providerSlugs = casinoResponse.relatedProviders
    .map((provider) => provider.slug)
    .filter(Boolean);

  // Fetch games
  const games = await fetchGamesForCasino(providerSlugs, gamesLimit);

  return {
    ...casinoResponse,
    games,
  };
}

/**
 * Lightweight metadata fetcher
 */
export const getCasinoPageMetadata = unstable_cache(
  async (slug: string): Promise<CasinoPageData | null> => {
    try {
      const query = {
        fields: ["title", "slug", "introduction"],
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
        data: CasinoPageData[];
      }>("casinos", query, REVALIDATE_TIMES.structure);

      return response.data?.[0] || null;
    } catch (error) {
      console.error("Failed to fetch casino page metadata:", error);
      return null;
    }
  },
  ["casino-page-metadata"],
  {
    revalidate: REVALIDATE_TIMES.structure,
    tags: ["casino-metadata"],
  }
);

/**
 * Revalidate casino cache
 * Use in webhook handlers or server actions
 */
export async function revalidateCasinoCache(slug: string) {
  const { revalidateTag } = await import("next/cache");

  revalidateTag("casino-page");
  revalidateTag("casinos");
  revalidateTag(`casino-${slug}`);

  // Also clear Redis cache for immediate updates
  await strapiClient.invalidateCache(`casino:${slug}`);
}

// Re-export the metadata function for convenience
export { getCasinoPageMetadata as getCasinoMetadata };
