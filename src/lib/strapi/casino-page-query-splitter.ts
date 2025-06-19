// src/lib/strapi/casino-page-query-splitter.ts

import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import type {
  CasinoPageData,
  CasinoPageSplitData,
  CasinoPageDataResponse,
} from "@/types/casino-page.types";
import type { GameProvider } from "@/types/game.types";
import type { CasinoData } from "@/types/casino.types";

// Cache configuration for different parts
const CACHE_CONFIG = {
  structure: { ttl: 600, swr: 1200, tags: ["casino-structure"] }, // 10min/20min
  dynamic: { ttl: 60, swr: 180, tags: ["casino-dynamic"] }, // 1min/3min
  providers: { ttl: 300, swr: 600, tags: ["casino-providers"] }, // 5min/10min
};

/**
 * Build the casino page query
 */
export function buildCasinoPageQuery(slug: string) {
  return {
    fields: [
      "title",
      "slug",
      "createdAt",
      "updatedAt",
      "heading",
      "introduction",
      "authorRatings",
      "content1",
      "content2",
      "content3",
      "content4",
      "playthrough",
      "ratingAvg",
      "ratingCount",
    ],
    populate: {
      images: {
        fields: ["url", "width", "height", "alternativeText"],
      },
      casinoFeatures: {
        fields: ["feature"],
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
      noDepositSection: {
        fields: ["bonusAmount", "availability", "speed"],
      },
      freeSpinsSection: {
        fields: ["bonusAmount", "availability", "speed"],
      },
      termsAndConditions: {
        fields: ["heading", "copy", "gambleResponsibly"],
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
      casinoBonus: {
        fields: ["bonusLabel", "bonusUrl", "bonusCode"],
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
      providers: {
        fields: ["title", "slug"],
        populate: {
          images: {
            fields: ["url", "width", "height"],
          },
        },
      },
      seo: {
        fields: ["metaTitle", "metaDescription", "keywords"],
      },
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
 * Split casino page data into static and dynamic parts
 */
export function splitCasinoPageData(data: CasinoPageData): CasinoPageSplitData {
  return {
    staticData: {
      id: data.id,
      documentId: data.documentId,
      title: data.title,
      slug: data.slug,
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
    },
    dynamicData: {
      ratingAvg: data.ratingAvg,
      ratingCount: data.ratingCount,
      authorRatings: data.authorRatings,
      playthrough: data.playthrough,
      images: data.images,
      bonusSection: data.bonusSection,
      noDepositSection: data.noDepositSection,
      freeSpinsSection: data.freeSpinsSection,
      termsAndConditions: data.termsAndConditions,
      casinoBonus: data.casinoBonus,
      providers: data.providers,
      casinoComparison: data.casinoComparison,
    },
  };
}

/**
 * Merge static and dynamic data back together
 */
export function mergeCasinoPageData(
  staticData: CasinoPageSplitData["staticData"],
  dynamicData: CasinoPageSplitData["dynamicData"]
): CasinoPageData {
  return {
    ...staticData,
    ...dynamicData,
  };
}

/**
 * Fetch casino page data with split queries
 */
const getCasinoPageDataWithSplitQueries = async (
  slug: string
): Promise<CasinoPageDataResponse> => {
  try {
    // Fetch the main casino data
    const query = buildCasinoPageQuery(slug);

    const response = await strapiClient.fetchWithCache<{
      data: CasinoPageData[];
    }>("casinos", query, CACHE_CONFIG.structure.ttl);

    const casinoData = response.data?.[0] || null;

    if (!casinoData) {
      return {
        casinoData: null,
        relatedProviders: [],
        comparisonCasinos: [],
      };
    }

    // Extract providers and comparison casinos from the main data
    const relatedProviders = casinoData.providers || [];
    const comparisonCasinos = casinoData.casinoComparison || [];

    return {
      casinoData,
      relatedProviders,
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
};

/**
 * Cached metadata fetcher
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
      }>("casinos", query, CACHE_CONFIG.structure.ttl);

      return response.data?.[0] || null;
    } catch (error) {
      console.error("Failed to fetch casino page metadata:", error);
      return null;
    }
  },
  ["casino-page-metadata"],
  {
    revalidate: CACHE_CONFIG.structure.ttl,
    tags: CACHE_CONFIG.structure.tags,
  }
);
