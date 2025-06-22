// src/lib/strapi/provider-data-loader.ts

import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";

/**
 * Get all provider slugs for static generation
 */
const getAllProviderSlugsUncached = async (): Promise<string[]> => {
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
    }>("slot-providers", query, 300); // 5 minutes cache

    // If there are more than 100 providers, fetch additional pages
    const totalProviders = response.meta?.pagination?.total || 0;
    const slugs = response.data?.map((item) => item.slug) || [];

    if (totalProviders > 100) {
      const totalPages = Math.ceil(totalProviders / 100);
      for (let page = 2; page <= totalPages; page++) {
        const additionalResponse = await strapiClient.fetchWithCache<{
          data: Array<{ slug: string }>;
        }>(
          "slot-providers",
          { ...query, pagination: { ...query.pagination, page } },
          300
        );
        slugs.push(
          ...(additionalResponse.data?.map((item) => item.slug) || [])
        );
      }
    }

    console.log(`Fetched ${slugs.length} provider slugs for static generation`);
    return slugs;
  } catch (error) {
    console.error("Failed to fetch provider slugs:", error);
    return [];
  }
};

/**
 * Cached version of getAllProviderSlugs
 */
export const getAllProviderSlugs = unstable_cache(
  getAllProviderSlugsUncached,
  ["all-provider-slugs"],
  {
    revalidate: 300, // 5 minutes
    tags: ["provider-slugs"],
  }
);

/**
 * Get providers for filter options in game widgets
 */
export const getProviderFilterOptions = unstable_cache(
  async () => {
    try {
      const query = {
        fields: ["id", "title", "slug"],
        sort: ["title:asc"],
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
        data: Array<{
          id: number;
          title: string;
          slug: string;
        }>;
      }>("slot-providers", query, 300);

      return (
        response.data?.map((provider) => ({
          value: provider.slug,
          label: provider.title,
          id: provider.id,
        })) || []
      );
    } catch (error) {
      console.error("Failed to fetch provider filter options:", error);
      return [];
    }
  },
  ["provider-filter-options"],
  {
    revalidate: 300,
    tags: ["provider-filters"],
  }
);
