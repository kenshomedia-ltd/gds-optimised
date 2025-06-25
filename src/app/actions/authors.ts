// src/app/actions/authors.ts
"use server";

import { strapiClient } from "@/lib/strapi/strapi-client";
import type { GameData } from "@/types/game.types";
import type { BlogData } from "@/types/blog.types";

/**
 * Get more games for an author
 */
export async function getAuthorGames(
  authorId: number,
  page: number = 1,
  pageSize: number = 12
): Promise<{
  games: GameData[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}> {
  try {
    const query = {
      fields: ["title", "slug", "ratingAvg", "ratingCount"],
      populate: {
        images: {
          fields: ["url", "alternativeText", "width", "height"],
        },
        provider: {
          fields: ["slug"],
          populate: {
            images: {
              fields: ["url"],
            },
          },
        },
        categories: {
          fields: ["title"],
        },
      },
      filters: {
        author: {
          id: {
            $eq: authorId,
          },
        },
      },
      pagination: {
        page,
        pageSize,
      },
      sort: ["createdAt:desc"],
    };

    const response = await strapiClient.fetchWithCache<{
      data: GameData[];
      meta: {
        pagination: {
          page: number;
          pageSize: number;
          pageCount: number;
          total: number;
        };
      };
    }>("games", query, 60); // 1 minute cache

    return {
      games: response.data || [],
      pagination: response.meta?.pagination || {
        page,
        pageSize,
        pageCount: 1,
        total: 0,
      },
    };
  } catch (error) {
    console.error("Failed to fetch author games:", error);
    return {
      games: [],
      pagination: {
        page,
        pageSize,
        pageCount: 1,
        total: 0,
      },
    };
  }
}

/**
 * Get more blogs for an author
 */
export async function getAuthorBlogs(
  authorId: number,
  page: number = 1,
  pageSize: number = 6
): Promise<{
  blogs: BlogData[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}> {
  try {
    const query = {
      fields: [
        "title",
        "slug",
        "createdAt",
        "updatedAt",
        "publishedAt",
        "content1",
        "blogBrief",
        "minutesRead",
      ],
      populate: {
        images: {
          fields: ["url", "alternativeText", "width", "height"],
        },
        author: {
          fields: ["firstName", "lastName"],
          populate: {
            photo: {
              fields: ["url"],
            },
          },
        },
        blogCategory: {
          fields: ["blogCategory", "slug"],
        },
      },
      filters: {
        author: {
          id: {
            $eq: authorId,
          },
        },
      },
      pagination: {
        page,
        pageSize,
      },
      sort: ["publishedAt:desc", "createdAt:desc"],
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
    }>("blogs", query, 60); // 1 minute cache

    return {
      blogs: response.data || [],
      pagination: response.meta?.pagination || {
        page,
        pageSize,
        pageCount: 1,
        total: 0,
      },
    };
  } catch (error) {
    console.error("Failed to fetch author blogs:", error);
    return {
      blogs: [],
      pagination: {
        page,
        pageSize,
        pageCount: 1,
        total: 0,
      },
    };
  }
}
