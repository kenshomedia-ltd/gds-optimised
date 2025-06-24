// src/lib/strapi/casino-provider-data-loader.ts

import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";

/**
 * Get all casino provider slugs for static generation
 */
const getAllCasinoProviderSlugsUncached = async (): Promise<string[]> => {
  try {
    const query = {
      fields: ["slug"],
      pagination: {
        pageSize: 100,
        page: 1,
      },
      filters: {
        publishedAt: {
          $notNull: true,
        },
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: Array<{ slug: string }>;
      meta: { pagination: { total: number } };
    }>("casino-providers", query, 300); // 5 minutes cache

    // If there are more than 100 casino providers, fetch additional pages
    const totalProviders = response.meta?.pagination?.total || 0;
    const slugs = response.data?.map((item) => item.slug) || [];

    if (totalProviders > 100) {
      const totalPages = Math.ceil(totalProviders / 100);
      for (let page = 2; page <= totalPages; page++) {
        const additionalResponse = await strapiClient.fetchWithCache<{
          data: Array<{ slug: string }>;
        }>(
          "casino-providers",
          { ...query, pagination: { ...query.pagination, page } },
          300
        );
        slugs.push(
          ...(additionalResponse.data?.map((item) => item.slug) || [])
        );
      }
    }

    console.log(
      `Fetched ${slugs.length} casino provider slugs for static generation`
    );
    return slugs;
  } catch (error) {
    console.error("Failed to fetch casino provider slugs:", error);
    return [];
  }
};

/**
 * Cached version of getAllCasinoProviderSlugs
 */
export const getAllCasinoProviderSlugs = unstable_cache(
  getAllCasinoProviderSlugsUncached,
  ["all-casino-provider-slugs"],
  {
    revalidate: 300, // 5 minutes
    tags: ["casino-provider-slugs"],
  }
);
