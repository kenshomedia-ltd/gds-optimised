// src/lib/strapi/strapi-client.ts
import qs from "qs";
import { cacheManager } from "@/lib/cache/cache-manager"; // Import the centralized cache manager
import type {
  LayoutData,
  NavigationData,
  TranslationData,
  GameData,
  // BlogData,
  GamesListResponse,
  StrapiQuery,
  StrapiDataResponse,
  TranslationResponse,
} from "@/types/strapi.types";

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
  private getCacheKey(endpoint: string, params: StrapiQuery = {}): string {
    const paramsHash = qs.stringify(params, {
      encodeValuesOnly: true,
      skipNulls: true,
      sort: (a, b) => a.localeCompare(b), // Ensure consistent key order
    });
    return `strapi:${endpoint}:${paramsHash}`;
  }

  /**
   * Fetch with automatic caching and error handling
   * --- REFACTORED TO USE cacheManager ---
   */
  async fetchWithCache<T>(
    endpoint: string,
    query: StrapiQuery = {},
    ttl?: number
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, query);
    const cacheOptions = { ttl: ttl || 60, swr: (ttl || 60) * 2 };

    // Try to get from cache first
    const { data: cachedData, isStale } = await cacheManager.get<T>(cacheKey);

    if (cachedData && !isStale) {
      if (process.env.NODE_ENV === "development") {
        console.log(`Cache hit for ${endpoint}`);
      }
      return cachedData;
    }

    // Fetch from API
    const data = await this.fetch<T>(endpoint, query);
    
    // Cache the result
    if (ttl && ttl > 0) {
      await cacheManager.set(cacheKey, data, cacheOptions);
    }

    return data;
  }

  /**
   * Core fetch method with error handling and retries
   */
  private async fetch<T>(
    endpoint: string,
    query: StrapiQuery = {},
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

    // Enhanced logging for game queries
    if (endpoint === "games") {
      console.log(`[STRAPI GAMES API] Fetching from: ${url}`);
      console.log(`[STRAPI GAMES API] Query String:`, queryString);
    } else {
      console.log("url", url);
    }

    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          next: {
            revalidate: 60, // 1 minute default ISR
          },
        });

        if (!response.ok) {
          throw new Error(
            `Strapi API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${i + 1} failed:`, error);

        if (i < retries - 1) {
          // Exponential backoff: 100ms, 200ms, 400ms
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 100)
          );
        }
      }
    }

    throw lastError || new Error("Failed to fetch from Strapi API");
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateCache(pattern: string): Promise<void> {
    await cacheManager.delete(`strapi:${pattern}*`);
  }

  /**
   * Get layout data with critical fields only
   */
  async getLayoutCritical(): Promise<LayoutData> {
    const query: StrapiQuery = {
      fields: ["legalText", "footerContent"],
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

    const response = await this.fetchWithCache<StrapiDataResponse<LayoutData>>(
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
    const query: StrapiQuery = {
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

    const response = await this.fetchWithCache<
      StrapiDataResponse<NavigationData>
    >("main-navigation", query, CACHE_TTL.navigation);
    return response.data;
  }

  /**
   * Get translations with extended caching
   */
  async getTranslations(): Promise<TranslationData> {
    const query: StrapiQuery = {
      populate: "*",
    };

    const response = await this.fetchWithCache<TranslationResponse>(
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
      return response.data.translation.reduce((acc: TranslationData, item) => {
        if (item.key && item.value) {
          acc[item.key] = item.value;
        }
        return acc;
      }, {});
    }

    // If already an object, return directly
    return response.data as unknown as TranslationData;
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
  ): Promise<GamesListResponse> {
    const {
      page = 1,
      pageSize = 18,
      sort = "ratingAvg:desc",
      providers = [],
      categories = [],
      author = "",
    } = options;

    const query: StrapiQuery = {
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

    return this.fetchWithCache<GamesListResponse>(
      "games",
      query,
      CACHE_TTL.games
    );
  }

  /**
   * Get single game with full details
   */
  async getGameBySlug(slug: string): Promise<GameData | null> {
    const query: StrapiQuery = {
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

    const response = await this.fetchWithCache<{
      data: GameData[];
      meta: { pagination: { total: number } };
    }>("games", query, CACHE_TTL.gameDetail);
    return response.data?.[0] || null;
  }

  /**
   * Get popular games with view-based sorting
   */
  async getPopularGames(limit: number = 10): Promise<GamesListResponse> {
    return this.getGames({
      pageSize: limit,
      sort: "views:desc,ratingAvg:desc",
    });
  }

  /**
   * Get new games from last 14 days
   */
  async getNewGames(limit: number = 10): Promise<GamesListResponse> {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const query: StrapiQuery = {
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

    return this.fetchWithCache<GamesListResponse>(
      "games",
      query,
      CACHE_TTL.games
    );
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
