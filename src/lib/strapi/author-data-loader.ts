// src/lib/strapi/author-data-loader.ts
import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  getAuthorPageData,
  getAuthorsIndexData,
} from "./author-query-splitter";
import type { AuthorPageData, AuthorIndexPageData } from "@/types/author.types";

/**
 * React cache for deduplicating requests within a single render
 */
const getAuthorDataCached = cache(
  async (slug: string): Promise<AuthorPageData | null> => {
    try {
      return await getAuthorPageData(slug);
    } catch (error) {
      console.error("Error fetching author data:", error);
      return null;
    }
  }
);

/**
 * React cache for deduplicating authors index requests
 */
const getAuthorsDataCached = cache(
  async (
    page: number = 1,
    pageSize: number = 12
  ): Promise<AuthorIndexPageData> => {
    try {
      return await getAuthorsIndexData(page, pageSize);
    } catch (error) {
      console.error("Error fetching authors data:", error);
      return {
        authors: [],
        pagination: {
          page: 1,
          pageSize: 12,
          pageCount: 1,
          total: 0,
        },
      };
    }
  }
);

/**
 * Get author page data with multi-layer caching
 * Combines React cache (deduplication) and Next.js cache (persistence)
 */
export const getAuthorData = unstable_cache(
  async (slug: string): Promise<AuthorPageData | null> => {
    return getAuthorDataCached(slug);
  },
  ["author-data"],
  {
    revalidate: 300, // 5 minutes
    tags: ["authors", "author-data"],
  }
);

/**
 * Get authors index data with multi-layer caching
 * Combines React cache (deduplication) and Next.js cache (persistence)
 */
export const getAuthorsData = unstable_cache(
  async (
    page: number = 1,
    pageSize: number = 12
  ): Promise<AuthorIndexPageData> => {
    return getAuthorsDataCached(page, pageSize);
  },
  ["authors-data"],
  {
    revalidate: 600, // 10 minutes
    tags: ["authors", "authors-list"],
  }
);
