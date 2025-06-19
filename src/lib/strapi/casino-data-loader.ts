// src/lib/strapi/casino-data-loader.ts

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { strapiClient } from "./strapi-client";
import {
  splitCasinoPageData,
  mergeCasinoPageData,
} from "./casino-page-query-splitter";
import type {
  CasinoPageData,
  CasinoPageDataResponse,
  CasinoPageSplitData,
} from "@/types/casino-page.types";
import type { GameProvider } from "@/types/game.types";
import type { CasinoData } from "@/types/casino.types";

// Revalidation times for different content types
const REVALIDATE_TIMES = {
  structure: 600, // 10 minutes for static content
  dynamic: 60, // 1 minute for dynamic content (ratings, bonuses)
  providers: 300, // 5 minutes for provider data
  comparison: 300, // 5 minutes for comparison casinos
};

/**
 * Build static casino query (structure, content, author)
 */
function buildStaticCasinoQuery(slug: string) {
  return {
    fields: [
      "title",
      "slug",
      "createdAt",
      "updatedAt",
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
        populate: {
          pros: true,
          cons: true,
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
        fields: [
          "bonusAmount",
          "availability",
          "speed",
          "cashBack",
          "freeSpin",
        ],
      },
      noDepositSection: {
        fields: ["bonusAmount", "availability", "speed"],
      },
      freeSpinsSection: {
        fields: ["bonusAmount", "availability", "speed"],
      },
      termsAndConditions: {
        fields: ["heading", "copy", "gambleResponsibly"],
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
        fields: [
          "title",
          "slug",
          "ratingAvg",
          "ratingCount",
          "playthrough",
          "publishedAt",
        ],
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
    data: Array<Partial<CasinoPageData>>;
  }>("casinos", staticQuery, REVALIDATE_TIMES.structure);

  const data = response.data?.[0];

  if (!data) return null;

  // Return only static fields
  return {
    id: data.id!,
    documentId: data.documentId!,
    title: data.title!,
    slug: data.slug!,
    heading: data.heading,
    introduction: data.introduction,
    content1: data.content1,
    content2: data.content2,
    content3: data.content3,
    content4: data.content4,
    casinoFeatures: data.casinoFeatures,
    howTo: data.howTo,
    proscons: data.proscons,
    paymentOptions: data.paymentOptions,
    casinoGeneralInfo: data.casinoGeneralInfo,
    testimonial: data.testimonial,
    faqs: data.faqs,
    author: data.author,
    seo: data.seo,
    paymentChannels: data.paymentChannels,
    blocks: data.blocks,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Fetch dynamic casino data
 */
async function fetchDynamicCasinoData(
  slug: string
): Promise<CasinoPageSplitData["dynamicData"] | null> {
  const dynamicQuery = buildDynamicCasinoQuery(slug);

  const response = await strapiClient.fetchWithCache<{
    data: Array<Partial<CasinoPageData>>;
  }>("casinos", dynamicQuery, REVALIDATE_TIMES.dynamic);

  const data = response.data?.[0];

  if (!data) return null;

  // Return only dynamic fields
  return {
    ratingAvg: data.ratingAvg!,
    ratingCount: data.ratingCount!,
    authorRatings: data.authorRatings,
    playthrough: data.playthrough,
    images: data.images!,
    bonusSection: data.bonusSection!,
    noDepositSection: data.noDepositSection,
    freeSpinsSection: data.freeSpinsSection,
    termsAndConditions: data.termsAndConditions!,
    casinoBonus: data.casinoBonus!,
    providers: undefined, // Will be fetched separately
    casinoComparison: undefined, // Will be fetched separately
  };
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

    // Step 3: Use the merger function to combine data
    // Update dynamic data with providers and comparison
    dynamicData.providers = providers;
    dynamicData.casinoComparison = comparisonCasinos;

    // Merge using the splitter's merge function
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

/**
 * Re-export getCasinoMetadata from query splitter for convenience
 */
export { getCasinoPageMetadata as getCasinoMetadata } from "./casino-page-query-splitter";
