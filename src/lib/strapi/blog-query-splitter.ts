// src/lib/strapi/blog-query-splitter.ts
import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import type { BlogData, SEOData } from "@/types/strapi.types";
import type { BlogAuthor, BlogCategory } from "@/types/blog.types";

// Cache configuration for different parts
const CACHE_CONFIG = {
  structure: { ttl: 600, swr: 1200, tags: ["blog-structure"] }, // 10min/20min
  blogs: { ttl: 300, swr: 600, tags: ["blogs"] }, // 5min/10min
};

export interface BlogIndexPageData {
  blogs: BlogData[];
  featuredBlog: BlogData | null;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  seo?: SEOData;
}

export interface BlogSinglePageData {
  blog: BlogData;
  relatedBlogs: BlogData[];
}

/**
 * Fetch blogs for the index page with pagination
 */
async function fetchBlogsForIndex(
  page: number = 1,
  pageSize: number = 12
): Promise<BlogIndexPageData> {
  const query = {
    fields: [
      "title",
      "slug",
      "blogBrief",
      "content1",
      "createdAt",
      "publishedAt",
      "minutesRead",
    ],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"],
      },
      author: {
        fields: ["firstName", "lastName", "slug"],
        populate: {
          photo: {
            fields: ["url", "alternativeText", "width", "height"],
          },
        },
      },
      blogCategory: {
        fields: ["blogCategory", "slug"],
      },
    },
    sort: ["publishedAt:desc", "createdAt:desc"],
    pagination: {
      page,
      pageSize,
    },
  };

  const response = await strapiClient.fetchWithCache<{
    data: BlogData[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  }>("blogs", query, CACHE_CONFIG.blogs.ttl);

  // Get featured blog (most recent)
  const featuredBlog = response.data.length > 0 ? response.data[0] : null;

  return {
    blogs: response.data,
    featuredBlog,
    pagination: response.meta.pagination,
  };
}

/**
 * Fetch single blog with full content
 */
async function fetchBlogBySlug(slug: string): Promise<BlogData | null> {
  const query = {
    fields: [
      "title",
      "slug",
      "blogBrief",
      "createdAt",
      "updatedAt",
      "publishedAt",
      "content1",
      "minutesRead",
    ],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"],
      },
      blogCategory: {
        fields: ["blogCategory", "slug"],
        populate: {
          seo: {
            fields: ["metaTitle", "metaDescription"],
          },
        },
      },
      author: {
        fields: [
          "firstName",
          "lastName",
          "linkedInLink",
          "twitterLink",
          "facebookLink",
          "jobTitle",
          "content1",
          "experience",
          "areaOfWork",
          "specialization",
        ],
        populate: {
          photo: {
            fields: ["url", "alternativeText", "width", "height"],
          },
        },
      },
      seo: {
        fields: ["metaTitle", "metaDescription", "keywords", "canonicalURL"],
        populate: {
          metaImage: {
            fields: ["url", "width", "height"],
          },
          metaSocial: {
            fields: ["socialNetwork", "title", "description"],
            populate: {
              image: {
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
  };

  const response = await strapiClient.fetchWithCache<{
    data: BlogData[];
  }>("blogs", query, CACHE_CONFIG.structure.ttl);

  return response.data && response.data.length > 0 ? response.data[0] : null;
}

/**
 * Fetch related blogs based on category
 */
async function fetchRelatedBlogs(
  categorySlug: string | undefined,
  excludeSlug: string,
  limit: number = 3
): Promise<BlogData[]> {
  const query = {
    fields: ["title", "slug", "blogBrief", "createdAt", "minutesRead"],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"],
      },
      author: {
        fields: ["firstName", "lastName"],
      },
      blogCategory: {
        fields: ["blogCategory", "slug"],
      },
    },
    filters: {
      slug: {
        $ne: excludeSlug,
      },
      ...(categorySlug && {
        blogCategory: {
          slug: {
            $eq: categorySlug,
          },
        },
      }),
    },
    sort: ["publishedAt:desc"],
    pagination: {
      pageSize: limit,
      page: 1,
    },
  };

  const response = await strapiClient.fetchWithCache<{
    data: BlogData[];
  }>("blogs", query, CACHE_CONFIG.blogs.ttl);

  return response.data || [];
}

/**
 * Export cached version of blog index data
 */
export const getBlogIndexData = unstable_cache(
  fetchBlogsForIndex,
  ["blog-index"],
  {
    revalidate: 300, // 5 minutes
    tags: ["blogs", "blog-index"],
  }
);

/**
 * Export cached version of single blog data
 */
export const getBlogSingleData = unstable_cache(
  async (slug: string): Promise<BlogSinglePageData | null> => {
    const blog = await fetchBlogBySlug(slug);

    if (!blog) {
      return null;
    }

    const relatedBlogs = await fetchRelatedBlogs(
      blog.blogCategory?.slug,
      blog.slug,
      3
    );

    return {
      blog,
      relatedBlogs,
    };
  },
  ["blog-single"],
  {
    revalidate: 300, // 5 minutes
    tags: ["blogs", "blog-single"],
  }
);

/**
 * Get blog metadata for SEO (lightweight query)
 */
export async function getBlogMetadata(slug: string): Promise<{
  title: string;
  description: string;
  seo?: SEOData;
} | null> {
  const query = {
    fields: ["title", "blogBrief"],
    populate: {
      seo: {
        fields: ["metaTitle", "metaDescription", "keywords", "canonicalURL"],
        populate: {
          metaImage: {
            fields: ["url", "width", "height"],
          },
        },
      },
    },
    filters: {
      slug: {
        $eq: slug,
      },
    },
  };

  const response = await strapiClient.fetchWithCache<{
    data: BlogData[];
  }>("blogs", query, 600); // 10 minutes cache

  const blog =
    response.data && response.data.length > 0 ? response.data[0] : null;

  if (!blog) {
    return null;
  }

  return {
    title: blog.title,
    description: blog.blogBrief || "",
    seo: blog.seo,
  };
}
