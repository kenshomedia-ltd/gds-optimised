// src/lib/strapi/query-chunks/blog-fetchers.ts

import { strapiClient } from "../strapi-client";
import { blogQueryChunk, imageQueryChunk } from "./shared-chunks";
import { QueryBuilder } from "./query-builder";
import type { BlogData } from "@/types/strapi.types";

/**
 * Blog fetching options interface
 */
interface BlogFetchOptions {
  limit?: number;
  sortBy?: string;
  queryType?: "basic" | "standard" | "detailed" | "homepage";
  cacheTime?: number;
}

/**
 * Filter options for blogs
 */
interface BlogFilters {
  categories?: string[];
  authors?: string[];
  excludeDrafts?: boolean;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

/**
 * Enhanced blog query chunks to match different use cases
 */
export const enhancedBlogQueryChunk = {
  // Basic for simple lists and cards
  basic: {
    fields: ["title", "slug", "blogBrief", "publishedAt"],
    populate: {
      images: { fields: ["url", "width", "height"] },
      author: { fields: ["firstName", "lastName"] },
    },
  },

  // Standard for homepage and most listings (matches current homepage pattern)
  standard: {
    fields: [
      "title",
      "slug",
      "blogBrief",
      "createdAt",
      "updatedAt",
      "publishedAt",
      "minutesRead",
    ],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"],
      },
      author: {
        fields: ["firstName", "lastName"],
        populate: {
          photo: { fields: ["url", "width", "height"] },
        },
      },
      blogCategory: { fields: ["blogCategory", "slug"] },
    },
  },

  // Detailed for full blog pages (uses existing blogQueryChunk + content)
  detailed: {
    ...blogQueryChunk,
    fields: [
      ...blogQueryChunk.fields,
      "content1", // Add content field for full pages
    ],
    populate: {
      ...blogQueryChunk.populate,
      // Enhanced author info for detailed view
      author: {
        fields: [
          "firstName",
          "lastName",
          "slug",
          "linkedInLink",
          "twitterLink",
          "facebookLink",
          "jobTitle",
          "experience",
        ],
        populate: {
          photo: imageQueryChunk,
        },
      },
    },
  },

  // For homepage specifically (matches current implementation exactly)
  homepage: {
    fields: [
      "title",
      "slug",
      "blogBrief",
      "createdAt",
      "updatedAt",
      "publishedAt",
      "minutesRead",
    ],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"],
      },
      author: {
        fields: ["firstName", "lastName"],
        populate: {
          photo: { fields: ["url", "width", "height"] },
        },
      },
      blogCategory: { fields: ["blogCategory", "slug"] },
    },
  },
};

/**
 * Centralized function to fetch blogs for homepage
 * Replaces the inline blog query in homepage-data-loader.ts
 * Now uses Query Builder for cleaner, type-safe queries
 */
export async function fetchBlogsForHomepage(
  options: BlogFetchOptions = {}
): Promise<BlogData[]> {
  const {
    limit = 6,
    sortBy = "createdAt:desc",
    queryType = "homepage",
    cacheTime = 600, // 10 minutes default for blogs
  } = options;

  try {
    // Use Query Builder for cleaner query construction
    const query = QueryBuilder.blogs()
      .variant(queryType)
      .where({ excludeDrafts: true })
      .orderBy(sortBy)
      .paginate(1, limit)
      .build();

    const response = await strapiClient.fetchWithCache<{
      data: BlogData[];
      meta: { pagination: { total: number } };
    }>("blogs", query, cacheTime);

    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch blogs for homepage:", error);
    return [];
  }
}

/**
 * Centralized function to fetch blogs with flexible filtering
 * For use in blog pages and advanced filtering scenarios
 * Now uses Query Builder for cleaner, type-safe queries
 */
export async function fetchBlogsWithFilters(
  filters: BlogFilters,
  options: BlogFetchOptions = {}
): Promise<BlogData[]> {
  const {
    limit = 12,
    sortBy = "publishedAt:desc",
    queryType = "standard",
    cacheTime = 600,
  } = options;

  const {
    categories = [],
    authors = [],
    excludeDrafts = true,
    dateRange,
  } = filters;

  try {
    // Use Query Builder for cleaner query construction
    const query = QueryBuilder.blogs()
      .variant(queryType)
      .where({
        categories: categories.length > 0 ? categories : undefined,
        authors: authors.length > 0 ? authors : undefined,
        excludeDrafts,
        dateRange,
      })
      .orderBy(sortBy)
      .paginate(1, limit)
      .build();

    const response = await strapiClient.fetchWithCache<{
      data: BlogData[];
    }>("blogs", query, cacheTime);

    return response.data || [];
  } catch (error) {
    console.error(`Failed to fetch blogs with filters:`, error);
    return [];
  }
}

/**
 * Fetch related blogs for a single blog page
 * Used in blog detail pages to show related content
 */
export async function fetchRelatedBlogs(
  currentBlogSlug: string,
  category?: string,
  options: Pick<BlogFetchOptions, "limit" | "queryType" | "cacheTime"> = {}
): Promise<BlogData[]> {
  const { limit = 4, queryType = "standard", cacheTime = 600 } = options;

  try {
    // Build filters for related blogs
    const queryFilters: Record<string, unknown> = {
      slug: { $ne: currentBlogSlug }, // Exclude current blog
    };

    if (category) {
      queryFilters.blogCategory = { slug: { $eq: category } };
    }

    const baseQuery = enhancedBlogQueryChunk[queryType];

    const query = {
      ...baseQuery,
      filters: queryFilters,
      sort: ["publishedAt:desc"],
      pagination: {
        pageSize: limit,
        page: 1,
      },
    };

    const response = await strapiClient.fetchWithCache<{
      data: BlogData[];
    }>("blogs", query, cacheTime);

    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch related blogs:", error);
    return [];
  }
}

/**
 * Utility function to extract blog settings from homepage blocks
 * Similar to game and casino settings extractors
 */
export function extractBlogSettingsFromBlocks(
  blocks: Array<{ __component: string; [key: string]: unknown }>
): {
  hasBlogBlock: boolean;
  limit: number;
  sortBy: string;
} {
  const blogBlocks = blocks.filter(
    (block) => block.__component === "homepage.home-blog-list"
  );

  if (blogBlocks.length === 0) {
    return {
      hasBlogBlock: false,
      limit: 6,
      sortBy: "createdAt:desc",
    };
  }

  // Aggregate from all blog blocks
  let limit = 6;
  let sortBy = "createdAt:desc";

  for (const block of blogBlocks) {
    if (typeof block.numOfBlogs === "number") {
      limit = Math.max(limit, block.numOfBlogs);
    }

    if (typeof block.sortBy === "string") {
      sortBy = block.sortBy;
    }
  }

  return {
    hasBlogBlock: true,
    limit,
    sortBy,
  };
}
