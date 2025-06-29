// src/lib/strapi/blog-data-loader.ts
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { strapiClient } from "./strapi-client";
import {
  getBlogIndexData as getBlogIndexDataSplit,
  getBlogSingleData as getBlogSingleDataSplit,
  getBlogMetadata as getBlogMetadataQuery,
  type BlogIndexPageData,
  type BlogSinglePageData,
} from "./blog-query-splitter";
import { BlogETagSignature } from "@/types/blog.types";
// Revalidation times for different content types
const REVALIDATE_TIMES = {
  blogList: 300, // 5 minutes
  blogSingle: 300, // 5 minutes
  metadata: 600, // 10 minutes
};

/**
 * React cache for deduplicating blog index requests within a single render
 */
const getBlogIndexDataCached = cache(
  async (
    page: number = 1,
    pageSize: number = 12
  ): Promise<BlogIndexPageData> => {
    try {
      const data = await getBlogIndexDataSplit(page, pageSize);

      return data;
    } catch (error) {
      console.error("[Blog Index Loader] Error:", error);
      // Return empty data on error
      return {
        blogs: [],
        featuredBlog: null,
        pagination: {
          page: 1,
          pageSize,
          pageCount: 0,
          total: 0,
        },
      };
    }
  }
);

/**
 * React cache for deduplicating blog single requests within a single render
 */
const getBlogSingleDataCached = cache(
  async (slug: string): Promise<BlogSinglePageData | null> => {
    try {
      const data = await getBlogSingleDataSplit(slug);

      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error(`[Blog Single Loader] Error for ${slug}:`, error);
      return null;
    }
  }
);

/**
 * Next.js unstable_cache wrapper for persistent caching
 */
const getBlogIndexDataPersistent = unstable_cache(
  getBlogIndexDataCached,
  ["blog-index-data"],
  {
    revalidate: REVALIDATE_TIMES.blogList,
    tags: ["blogs", "blog-index"],
  }
);

/**
 * Next.js unstable_cache wrapper for persistent caching
 */
const getBlogSingleDataPersistent = unstable_cache(
  getBlogSingleDataCached,
  ["blog-single-data"],
  {
    revalidate: REVALIDATE_TIMES.blogSingle,
    tags: ["blogs", "blog-single"],
  }
);

/**
 * Main blog index data loader
 */
export async function getBlogIndexData(
  page: number = 1,
  pageSize: number = 12,
  options: { cached?: boolean } = {}
): Promise<BlogIndexPageData> {
  const { cached = true } = options;

  // Use persistent cache by default
  if (cached) {
    return getBlogIndexDataPersistent(page, pageSize);
  }

  // Direct fetch without persistent cache (still uses React cache)
  return getBlogIndexDataCached(page, pageSize);
}

/**
 * Main blog single data loader
 */
export async function getBlogSingleData(
  slug: string,
  options: { cached?: boolean } = {}
): Promise<BlogSinglePageData | null> {
  const { cached = true } = options;

  // Use persistent cache by default
  if (cached) {
    return getBlogSingleDataPersistent(slug);
  }

  // Direct fetch without persistent cache (still uses React cache)
  return getBlogSingleDataCached(slug);
}

/**
 * Get blog metadata for SEO (lightweight query)
 * Already has unstable_cache in the query splitter
 */
export async function getBlogMetadata(slug: string) {
  return getBlogMetadataQuery(slug);
}

/**
 * Prefetch blog data for specific routes
 * Use in page components or route handlers
 */
export async function prefetchBlogData(
  type: "index" | "single",
  slug?: string
) {
  try {
    if (type === "index") {
      await getBlogIndexData(1, 12, { cached: true });
    } else if (type === "single" && slug) {
      await getBlogSingleData(slug, { cached: true });
    }
  } catch (error) {
    console.error("Blog prefetch error:", error);
  }
}

/**
 * Generate cache tags for CDN invalidation
 */
export function generateBlogCacheTags(
  data: BlogIndexPageData | BlogSinglePageData,
  type: "index" | "single"
): string[] {
  const tags = new Set<string>(["content:blogs"]);

  if (type === "index") {
    const indexData = data as BlogIndexPageData;
    tags.add("page:blog-index");

    // Add category tags
    indexData.blogs.forEach((blog) => {
      if (blog.blogCategory?.slug) {
        tags.add(`category:${blog.blogCategory.slug}`);
      }
    });

    // Add author tags
    indexData.blogs.forEach((blog) => {
      if (blog.author) {
        tags.add(`author:${blog.author.id}`);
      }
    });
  } else {
    const singleData = data as BlogSinglePageData;
    tags.add("page:blog-single");
    tags.add(`blog:${singleData.blog.slug}`);

    if (singleData.blog.blogCategory?.slug) {
      tags.add(`category:${singleData.blog.blogCategory.slug}`);
    }

    if (singleData.blog.author) {
      tags.add(`author:${singleData.blog.author.id}`);
    }
  }

  return Array.from(tags);
}

/**
 * Generate ETag for conditional requests
 * Enables efficient browser caching
 */
export async function generateBlogETag(
  data: BlogIndexPageData | BlogSinglePageData,
  type: "index" | "single"
): Promise<string> {
  let signature: BlogETagSignature;

  if (type === "index") {
    const indexData = data as BlogIndexPageData;
    signature = {
      page: indexData.pagination.page,
      total: indexData.pagination.total,
      blogIds: indexData.blogs.map((b) => b.id),
      featuredId: indexData.featuredBlog?.id,
    };
  } else {
    const singleData = data as BlogSinglePageData;
    signature = {
      blogId: singleData.blog.id,
      updatedAt: singleData.blog.updatedAt || singleData.blog.createdAt,
      relatedIds: singleData.relatedBlogs.map((b) => b.id),
    };
  }

  // Use Web Crypto API for better performance
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(signature));
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return `W/"${hash}"`;
}

/**
 * Revalidate blog cache
 * Use in webhook handlers or server actions
 */
export async function revalidateBlogCache(
  type?: "all" | "index" | "single",
  slug?: string
) {
  const { revalidateTag } = await import("next/cache");

  if (type === "all" || !type) {
    revalidateTag("blogs");
    revalidateTag("blog-index");
    revalidateTag("blog-single");
  } else if (type === "index") {
    revalidateTag("blog-index");
  } else if (type === "single") {
    revalidateTag("blog-single");
    if (slug) {
      revalidateTag(`blog:${slug}`);
    }
  }

  // Also clear Redis cache for immediate updates
  await strapiClient.invalidateCache("blogs");
}
