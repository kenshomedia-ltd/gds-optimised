// src/lib/strapi/author-query-splitter.ts
import { strapiClient } from "./strapi-client";
import { unstable_cache } from "next/cache";
import type {
  AuthorData,
  AuthorCardData,
  AuthorPageData,
  AuthorIndexPageData,
} from "@/types/author.types";
import type { SEOData } from "@/types/strapi.types";
import type { GameData } from "@/types/game.types";
import type { BlogData } from "@/types/blog.types";

// Cache configuration for different parts
const CACHE_CONFIG = {
  structure: { ttl: 600, swr: 1200, tags: ["author-structure"] }, // 10min/20min
  authors: { ttl: 300, swr: 600, tags: ["authors"] }, // 5min/10min
  content: { ttl: 180, swr: 360, tags: ["author-content"] }, // 3min/6min
};

/**
 * Fetch static author structure (basic info, SEO)
 */
async function fetchAuthorStructure(slug: string): Promise<AuthorData | null> {
  // Handle both URL formats:
  // 1. Simple slug (e.g., "gennaro")
  // 2. firstname.lastname format (e.g., "gennaro.donnarumma")

  // If it contains a dot, extract just the first name for the slug lookup
  const querySlug = slug.includes(".") ? slug.split(".")[0] : slug;

  const query = {
    fields: [
      "id",
      "documentId",
      "username",
      "email",
      "firstName",
      "lastName",
      "heading",
      "content1",
      "jobTitle",
      "facebookLink",
      "linkedInLink",
      "slug",
      "twitterLink",
      "experience",
      "areaOfWork",
      "specialization",
      "isAnAuthor",
      "bio",
    ],
    populate: {
      photo: {
        fields: ["url", "alternativeText", "width", "height"],
      },
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
        $eq: querySlug,
      },
      isAnAuthor: {
        $eq: true,
      },
    },
  };

  const response = await strapiClient.fetchWithCache<
    | {
        data: AuthorData[];
      }
    | AuthorData[]
  >("users", query, CACHE_CONFIG.structure.ttl);

  // Handle both possible response structures
  let authorsData: AuthorData[] = [];

  if (Array.isArray(response)) {
    // Direct array response
    authorsData = response;
  } else if (response.data && Array.isArray(response.data)) {
    // Standard Strapi response with data wrapper
    authorsData = response.data;
  }

  return authorsData.length > 0 ? authorsData[0] : null;
}

/**
 * Fetch author's games (dynamic content)
 */
async function fetchAuthorGames(
  authorId: number,
  page: number = 1,
  pageSize: number = 12
) {
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

  const response = await strapiClient.fetchWithCache<
    | {
        data: GameData[];
        meta: {
          pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
          };
        };
      }
    | GameData[]
  >("games", query, CACHE_CONFIG.content.ttl);

  // Handle response structure
  let data: GameData[] = [];
  let meta = {
    pagination: {
      page,
      pageSize,
      pageCount: 1,
      total: 0,
    },
  };

  if (Array.isArray(response)) {
    // Direct array response
    data = response;
    meta.pagination.total = response.length;
  } else if (response && typeof response === "object" && "data" in response) {
    // Standard Strapi response
    data = response.data || [];
    if ("meta" in response && response.meta) {
      meta = response.meta;
    }
  }

  return { data, meta };
}

/**
 * Fetch author's blogs (dynamic content)
 */
async function fetchAuthorBlogs(
  authorId: number,
  page: number = 1,
  pageSize: number = 6
) {
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

  const response = await strapiClient.fetchWithCache<
    | {
        data: BlogData[];
        meta: {
          pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
          };
        };
      }
    | BlogData[]
  >("blogs", query, CACHE_CONFIG.content.ttl);

  // Handle response structure
  let data: BlogData[] = [];
  let meta = {
    pagination: {
      page,
      pageSize,
      pageCount: 1,
      total: 0,
    },
  };

  if (Array.isArray(response)) {
    // Direct array response
    data = response;
    meta.pagination.total = response.length;
  } else if (response && typeof response === "object" && "data" in response) {
    // Standard Strapi response
    data = response.data || [];
    if ("meta" in response && response.meta) {
      meta = response.meta;
    }
  }

  return { data, meta };
}

/**
 * Fetch authors for index page
 */
async function fetchAuthorsForIndex(
  page: number = 1,
  pageSize: number = 12
): Promise<AuthorIndexPageData> {
  const query = {
    fields: [
      "id",
      "documentId",
      "firstName",
      "lastName",
      "content1",
      "facebookLink",
      "linkedInLink",
      "twitterLink",
      "slug",
      "isAnAuthor",
      "jobTitle",
    ],
    populate: {
      photo: {
        fields: ["url", "alternativeText", "width", "height"],
      },
    },
    filters: {
      isAnAuthor: {
        $eq: true,
      },
    },
    pagination: {
      page,
      pageSize,
    },
    sort: ["firstName:asc", "lastName:asc"],
  };

  const response = await strapiClient.fetchWithCache<{
    data: AuthorCardData[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  }>("users", query, CACHE_CONFIG.authors.ttl);

  // Log the response for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("Authors response:", response);
  }

  // Handle both possible response structures
  let authorsData: AuthorCardData[] = [];

  if (Array.isArray(response)) {
    // Direct array response (like in your paste.txt)
    authorsData = response as unknown as AuthorCardData[];
  } else if (response.data && Array.isArray(response.data)) {
    // Standard Strapi response with data wrapper
    authorsData = response.data;
  }

  return {
    authors: authorsData,
    pagination: response.meta?.pagination || {
      page: 1,
      pageSize: 12,
      pageCount: Math.ceil(authorsData.length / 12),
      total: authorsData.length,
    },
  };
}

/**
 * Get complete author page data
 */
export const getAuthorPageData = unstable_cache(
  async (slug: string): Promise<AuthorPageData | null> => {
    const author = await fetchAuthorStructure(slug);

    if (!author) {
      return null;
    }

    // Fetch initial content
    const [gamesResponse, blogsResponse] = await Promise.all([
      fetchAuthorGames(author.id, 1, 12),
      fetchAuthorBlogs(author.id, 1, 6),
    ]);

    return {
      author: {
        ...author,
        games: gamesResponse.data || [],
        blogs: blogsResponse.data || [],
      },
      totalGames: gamesResponse.meta?.pagination?.total || 0,
      totalBlogs: blogsResponse.meta?.pagination?.total || 0,
    };
  },
  ["author-page"],
  {
    revalidate: 300, // 5 minutes
    tags: ["authors", "author-page"],
  }
);

/**
 * Get authors for index page (cached)
 */
export const getAuthorsIndexData = unstable_cache(
  fetchAuthorsForIndex,
  ["authors-index"],
  {
    revalidate: 600, // 10 minutes
    tags: ["authors", "authors-index"],
  }
);

/**
 * Get author metadata for SEO
 */
export const getAuthorMetadata = unstable_cache(
  async (
    slug: string
  ): Promise<{
    title: string;
    description: string;
    seo?: SEOData;
  } | null> => {
    // Handle both URL formats
    const querySlug = slug.includes(".") ? slug.split(".")[0] : slug;

    const query = {
      fields: ["firstName", "lastName", "jobTitle", "bio", "content1"],
      populate: {
        seo: {
          fields: ["metaTitle", "metaDescription", "keywords", "canonicalURL"],
          populate: {
            metaImage: {
              fields: ["url", "width", "height"],
            },
          },
        },
        photo: {
          fields: ["url"],
        },
      },
      filters: {
        slug: {
          $eq: querySlug,
        },
        isAnAuthor: {
          $eq: true,
        },
      },
    };

    const response = await strapiClient.fetchWithCache<
      | {
          data: AuthorData[];
        }
      | AuthorData[]
    >("users", query, 600);

    // Handle both possible response structures
    let authorsData: AuthorData[] = [];

    if (Array.isArray(response)) {
      // Direct array response
      authorsData = response;
    } else if (response.data && Array.isArray(response.data)) {
      // Standard Strapi response with data wrapper
      authorsData = response.data;
    }

    const author = authorsData.length > 0 ? authorsData[0] : null;

    if (!author) {
      return null;
    }

    const fullName = `${author.firstName} ${author.lastName}`;
    const description =
      author.bio ||
      author.content1 ||
      `${fullName} - ${author.jobTitle || "Author"}`;

    return {
      title: fullName,
      description: description.substring(0, 160),
      seo: author.seo,
    };
  },
  ["author-metadata"],
  {
    revalidate: 600, // 10 minutes
    tags: ["author-metadata"],
  }
);
