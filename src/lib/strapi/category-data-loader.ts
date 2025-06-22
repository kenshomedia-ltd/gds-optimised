// src/lib/strapi/category-data-loader.ts

import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import type { CategoryPageData } from "@/types/category.types";

// Cache configuration
const CACHE_CONFIG = {
  page: { ttl: 300, swr: 600, tags: ["category-page-full"] }, // 5min/10min
};

/**
 * Build full query for category pages (legacy - for reference)
 */
export function buildFullCategoryQuery(slug: string) {
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
      relatedCasinos: {
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
 * Fetch full category page data (without split queries)
 * This can be used as a fallback or for simpler implementations
 */
export const getCategoryPageData = unstable_cache(
  async (slug: string): Promise<CategoryPageData | null> => {
    try {
      const query = buildFullCategoryQuery(slug);

      console.log("Fetching category page data for:", slug);

      const response = await strapiClient.fetchWithCache<{
        data: CategoryPageData[];
      }>("slot-categories", query, CACHE_CONFIG.page.ttl);

      const pageData = response.data?.[0];

      if (!pageData) {
        console.log("No category page data found for slug:", slug);
        return null;
      }

      return pageData;
    } catch (error) {
      console.error("Failed to fetch category page data:", error);
      return null;
    }
  },
  ["category-page-data"],
  {
    revalidate: CACHE_CONFIG.page.ttl,
    tags: CACHE_CONFIG.page.tags,
  }
);

/**
 * Get all category slugs for static generation
 */
export const getAllCategorySlugs = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const query = {
        fields: ["slug"],
        pagination: {
          pageSize: 100,
          page: 1,
        },
      };

      const response = await strapiClient.fetchWithCache<{
        data: Array<{ slug: string }>;
      }>("slot-categories", query, 3600); // 1 hour cache

      return response.data?.map((category) => category.slug) || [];
    } catch (error) {
      console.error("Failed to fetch category slugs:", error);
      return [];
    }
  },
  ["category-slugs"],
  {
    revalidate: 3600,
    tags: ["category-slugs"],
  }
);
