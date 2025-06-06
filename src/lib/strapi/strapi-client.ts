// src/lib/strapi/strapi-client.ts
import qs from "qs";
import { Redis } from "ioredis";
import type {
  StrapiResponse,
  LayoutData,
  NavigationData,
  TranslationData,
} from "@/types/strapi.types";

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
});

// Cache configuration
const CACHE_TTL = {
  layout: 300, // 5 minutes
  navigation: 600, // 10 minutes
  translations: 1800, // 30 minutes
  games: 60, // 1 minute for list pages
  gameDetail: 300, // 5 minutes for detail pages
};

// Revalidation configuration for ISR
export const REVALIDATE_TIMES = {
  layout: 300,
  games: 60,
  gameDetail: 300,
  static: 3600, // 1 hour for relatively static content
};

class StrapiClient {
  private baseURL: string;
  private token: string;

  constructor() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.PUBLIC_API_URL || "";
    const apiToken =
      process.env.NEXT_PUBLIC_API_TOKEN || process.env.PUBLIC_API_TOKEN || "";

    this.baseURL = apiUrl;
    this.token = apiToken;

    if (process.env.NODE_ENV === "development") {
      console.log("Strapi Client Configuration:");
      console.log("API URL:", apiUrl || "NOT SET");
      console.log(
        "API Token:",
        apiToken ? "***" + apiToken.slice(-4) : "NOT SET"
      );
    }
  }

  /**
   * Generate cache key with proper namespace
   */
  private getCacheKey(
    endpoint: string,
    params: Record<string, any> = {}
  ): string {
    const paramsHash = qs.stringify(params, {
      encodeValuesOnly: true,
      skipNulls: true,
      sort: (a, b) => a.localeCompare(b), // Ensure consistent key order
    });
    return `strapi:${endpoint}:${paramsHash}`;
  }

  /**
   * Fetch with automatic caching and error handling
   */
  private async fetchWithCache<T>(
    endpoint: string,
    query: Record<string, any> = {},
    ttl?: number
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, query);

    // Try to get from cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        if (process.env.NODE_ENV === "development") {
          console.log(`Cache hit for ${endpoint}`);
        }
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }

    // Fetch from API
    const data = await this.fetch<T>(endpoint, query);

    // Cache the result
    if (ttl && ttl > 0) {
      try {
        await redis.setex(cacheKey, ttl, JSON.stringify(data));
      } catch (error) {
        console.warn("Cache write error:", error);
      }
    }

    return data;
  }

  /**
   * Core fetch method with error handling and retries
   */
  private async fetch<T>(
    endpoint: string,
    query: Record<string, any> = {},
    retries = 3
  ): Promise<T> {
    if (!this.baseURL || !this.token) {
      throw new Error(
        "Strapi client is not properly configured. Check your environment variables."
      );
    }

    const queryString = qs.stringify(query, {
      encodeValuesOnly: true,
      addQueryPrefix: false,
      skipNulls: true,
    });

    const url = `${this.baseURL}/api/${endpoint}${
      queryString ? `?${queryString}` : ""
    }`;

    if (process.env.NODE_ENV === "development") {
      console.log("Fetching URL:", url);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
        // Next.js specific caching
        next: {
          revalidate: REVALIDATE_TIMES.layout,
        },
      });

      clearTimeout(timeout);

      // Check content type before parsing
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        let errorMessage = `API call failed: ${response.status} ${response.statusText}`;

        // Try to get error details
        if (contentType?.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage += ` - ${
              errorData.error?.message || JSON.stringify(errorData)
            }`;
          } catch {
            const errorText = await response.text();
            errorMessage += ` - ${errorText}`;
          }
        } else {
          const errorText = await response.text();
          errorMessage += ` - ${errorText.substring(0, 200)}...`; // Limit error text
        }

        throw new Error(errorMessage);
      }

      // Ensure we're getting JSON
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `Expected JSON response but got ${contentType}. Response: ${text.substring(
            0,
            200
          )}...`
        );
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeout);

      // Don't retry JSON parse errors
      if (
        error.message.includes("JSON") ||
        error.message.includes("Expected JSON")
      ) {
        console.error(`Invalid response format from ${endpoint}:`, error);
        throw error;
      }

      // Retry logic for network errors
      if (
        retries > 0 &&
        (error.name === "AbortError" || error.message.includes("fetch"))
      ) {
        console.warn(`Retrying ${endpoint}, attempts left: ${retries}`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
        return this.fetch<T>(endpoint, query, retries - 1);
      }

      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache for specific patterns
   */
  async invalidateCache(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(`strapi:${pattern}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }
  }

  /**
   * Get layout critical data with optimized query
   */
  async getLayoutCritical(): Promise<LayoutData> {
    const query = {
      populate: {
        Logo: {
          fields: ["url", "width", "height"],
        },
        footerImages: {
          fields: ["imageName", "imageLink"],
          populate: {
            image: {
              fields: ["url", "width", "height"],
            },
          },
        },
        homeBreadcrumbs: "*",
      },
    };

    const response = await this.fetchWithCache<{ data: LayoutData }>(
      "layout",
      query,
      CACHE_TTL.layout
    );
    return response.data;
  }

  /**
   * Get navigation data with proper caching
   */
  async getNavigation(): Promise<NavigationData> {
    const query = {
      populate: {
        mainNavigation: {
          fields: ["title", "url"],
          populate: {
            images: {
              fields: ["url", "height", "width"],
            },
            subMenu: {
              fields: ["title", "url"],
            },
          },
        },
        footerNavigation: {
          fields: ["title", "url"],
          populate: {
            images: {
              fields: ["url", "height", "width"],
            },
            subMenu: {
              fields: ["title", "url"],
            },
          },
        },
        footerNavigations: {
          fields: ["title", "url"],
          populate: {
            images: {
              fields: ["url", "height", "width"],
            },
            subMenu: {
              fields: ["title", "url"],
            },
          },
        },
        subNavigation: {
          fields: ["title", "url"],
          populate: {
            images: {
              fields: ["url", "height", "width"],
            },
            subMenu: {
              fields: ["title", "url"],
            },
          },
        },
      },
    };

    const response = await this.fetchWithCache<{ data: NavigationData }>(
      "main-navigation",
      query,
      CACHE_TTL.navigation
    );
    return response.data;
  }

  /**
   * Get translations with extended caching
   */
  async getTranslations(): Promise<TranslationData> {
    const query = {
      populate: "*",
    };

    const response = await this.fetchWithCache<any>(
      "translation",
      query,
      CACHE_TTL.translations
    );

    // The translations are returned directly as an object in the data
    if (!response?.data) {
      console.warn("No translations found");
      return {};
    }

    // If translations come as an array, convert to object
    if (Array.isArray(response.data.translation)) {
      return response.data.translation.reduce(
        (acc: TranslationData, item: any) => {
          if (item.key && item.value) {
            acc[item.key] = item.value;
          }
          return acc;
        },
        {}
      );
    }

    // If already an object, return directly
    return response.data;
  }

  /**
   * Get games with optimized pagination and filtering
   */
  async getGames(
    options: {
      page?: number;
      pageSize?: number;
      sort?: string;
      providers?: string[];
      categories?: string[];
      author?: string;
    } = {}
  ): Promise<any> {
    const {
      page = 1,
      pageSize = 18,
      sort = "ratingAvg:desc",
      providers = [],
      categories = [],
      author = "",
    } = options;

    const query = {
      fields: [
        "title",
        "slug",
        "ratingAvg",
        "ratingCount",
        "createdAt",
        "publishedAt",
      ],
      populate: {
        images: {
          fields: ["url", "alternativeText", "width", "height"],
          pagination: {
            limit: 1, // Only get first image for list view
          },
        },
        provider: {
          fields: ["title", "slug"],
        },
        categories: {
          fields: ["title", "slug"],
          pagination: {
            limit: 3, // Limit categories shown
          },
        },
      },
      pagination: {
        page,
        pageSize,
        withCount: true,
      },
      sort: [sort, "title"],
      filters: {
        ...(providers.length > 0 && {
          provider: {
            slug: {
              $in: providers,
            },
          },
        }),
        ...(categories.length > 0 && {
          categories: {
            slug: {
              $in: categories,
            },
          },
        }),
        ...(author && {
          author: {
            slug: {
              $eq: author,
            },
          },
        }),
      },
    };

    return this.fetchWithCache<any>("games", query, CACHE_TTL.games);
  }

  /**
   * Get single game with full details
   */
  async getGameBySlug(slug: string): Promise<any> {
    const query = {
      fields: [
        "title",
        "heading",
        "slug",
        "introduction",
        "content1",
        "ratingAvg",
        "ratingCount",
        "views",
        "isGameDisabled",
        "gameDisableText",
        "gamesApiOverride",
      ],
      populate: {
        images: {
          fields: ["url", "alternativeText", "width", "height"],
        },
        provider: {
          fields: ["title", "slug"],
        },
        categories: {
          fields: ["title", "slug"],
        },
        author: {
          fields: ["firstName", "lastName", "slug"],
          populate: {
            photo: {
              fields: ["url", "width", "height"],
            },
          },
        },
        embedCode: {
          fields: ["desktopEmbedCode", "mobileEmbedCode"],
        },
        gameInfoTable: {
          fields: [
            "rtp",
            "volatilita",
            "layout",
            "lineeDiPuntata",
            "puntataMinima",
            "puntataMassima",
            "jackpot",
            "freeSpins",
            "bonusGame",
          ],
        },
        seo: {
          fields: ["metaTitle", "metaDescription", "keywords", "canonicalURL"],
        },
        faqs: {
          fields: ["question", "answer"],
        },
        howTo: "*",
        proscons: "*",
        blocks: {
          populate: "*", // Dynamic zones need full population
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

    const response = await this.fetchWithCache<any>(
      "games",
      query,
      CACHE_TTL.gameDetail
    );
    return response.data?.[0] || null;
  }

  /**
   * Get popular games with view-based sorting
   */
  async getPopularGames(limit: number = 10): Promise<any> {
    return this.getGames({
      pageSize: limit,
      sort: "views:desc,ratingAvg:desc",
    });
  }

  /**
   * Get new games from last 14 days
   */
  async getNewGames(limit: number = 10): Promise<any> {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const query = {
      fields: ["title", "slug", "ratingAvg", "createdAt"],
      populate: {
        images: {
          fields: ["url", "width", "height"],
          pagination: {
            limit: 1,
          },
        },
        provider: {
          fields: ["title", "slug"],
        },
      },
      filters: {
        createdAt: {
          $gte: twoWeeksAgo.toISOString(),
        },
      },
      sort: ["createdAt:desc"],
      pagination: {
        pageSize: limit,
      },
    };

    return this.fetchWithCache<any>("games", query, CACHE_TTL.games);
  }

  /**
   * Prefetch critical data for performance
   */
  async prefetchCriticalData(): Promise<void> {
    const promises = [
      this.getLayoutCritical(),
      this.getNavigation(),
      this.getTranslations(),
    ];

    await Promise.all(promises);
  }
}

// Export singleton instance
let strapiClientInstance: StrapiClient | null = null;

export function getStrapiClient(): StrapiClient {
  if (!strapiClientInstance) {
    strapiClientInstance = new StrapiClient();
  }
  return strapiClientInstance;
}

export const strapiClient = getStrapiClient();
