// src/lib/strapi/optimized-strapi-client.ts
import qs from "qs";
import {
  cacheManager,
  createCachedFunction,
  CACHE_CONFIG,
} from "@/lib/cache/cache-manager";
import type { StrapiResponse } from "@/types/strapi.types";

/**
 * Query optimization strategies for large Strapi queries
 */
export class OptimizedStrapiClient {
  private baseURL: string;
  private token: string;
  private maxQueryLength = 2000; // URL length limit

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "";
    this.token = process.env.NEXT_PUBLIC_API_TOKEN || "";
  }

  /**
   * Split large queries into multiple smaller requests
   */
  private splitQuery(query: Record<string, any>): Record<string, any>[] {
    const baseQuery = {
      fields: query.fields,
      sort: query.sort,
      pagination: query.pagination,
    };

    // Split populate into chunks if it's too large
    if (query.populate && Object.keys(query.populate).length > 10) {
      const chunks: Record<string, any>[] = [];
      const populateKeys = Object.keys(query.populate);
      const chunkSize = 5;

      for (let i = 0; i < populateKeys.length; i += chunkSize) {
        const chunk = populateKeys.slice(i, i + chunkSize);
        const chunkPopulate: Record<string, any> = {};

        chunk.forEach((key) => {
          chunkPopulate[key] = query.populate[key];
        });

        chunks.push({
          ...baseQuery,
          populate: chunkPopulate,
        });
      }

      return chunks;
    }

    return [query];
  }

  /**
   * Optimize populate queries by removing unnecessary fields
   */
  private optimizePopulate(populate: any): any {
    if (!populate) return populate;

    // Define essential fields for common relations
    const essentialFields: Record<string, string[]> = {
      images: ["url", "alternativeText", "width", "height"],
      author: ["firstName", "lastName", "slug"],
      provider: ["title", "slug"],
      categories: ["title", "slug"],
      seo: ["metaTitle", "metaDescription", "keywords"],
    };

    const optimized: Record<string, any> = {};

    for (const [key, value] of Object.entries(populate)) {
      if (typeof value === "object" && value !== null) {
        // If it has a fields property, optimize it
        if ("fields" in value && Array.isArray(value.fields)) {
          optimized[key] = {
            ...value,
            fields: essentialFields[key] || value.fields.slice(0, 5), // Limit fields
          };
        } else if ("populate" in value) {
          // Recursively optimize nested populates
          optimized[key] = {
            ...value,
            populate: this.optimizePopulate(value.populate),
          };
        } else {
          optimized[key] = value;
        }
      } else {
        optimized[key] = value;
      }
    }

    return optimized;
  }

  /**
   * Parallel fetch with query optimization
   */
  private async parallelFetch<T>(
    endpoint: string,
    queries: Record<string, any>[]
  ): Promise<T> {
    const results = await Promise.all(
      queries.map((query) => this.fetch<T>(endpoint, query))
    );

    // Merge results (assuming array responses)
    if (Array.isArray(results[0])) {
      return results.flat() as T;
    }

    // For object responses, merge them
    return Object.assign({}, ...results) as T;
  }

  /**
   * Cached fetch with stale-while-revalidate
   */
  async fetchWithCache<T>(
    endpoint: string,
    query: Record<string, any> = {},
    cacheConfig: keyof typeof CACHE_CONFIG = "static"
  ): Promise<T> {
    const config = CACHE_CONFIG[cacheConfig];
    const cacheKey = `strapi:${endpoint}:${qs.stringify(query, {
      sort: (a, b) => a.localeCompare(b),
    })}`;

    // Create cached version of the fetch
    const cachedFetch = createCachedFunction(
      () => this.fetch<T>(endpoint, query),
      {
        key: cacheKey,
        ttl: config.ttl,
        swr: config.swr,
        tags: config.tags,
      }
    );

    return cachedFetch();
  }

  /**
   * Core fetch method with optimizations
   */
  private async fetch<T>(
    endpoint: string,
    query: Record<string, any> = {}
  ): Promise<T> {
    // Optimize the query
    const optimizedQuery = {
      ...query,
      populate: this.optimizePopulate(query.populate),
    };

    // Check if query is too large
    const queryString = qs.stringify(optimizedQuery, {
      encodeValuesOnly: true,
      skipNulls: true,
    });

    if (queryString.length > this.maxQueryLength) {
      // Split into multiple requests
      const queries = this.splitQuery(optimizedQuery);
      return this.parallelFetch<T>(endpoint, queries);
    }

    const url = `${this.baseURL}/api/${endpoint}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        // Enable compression
        "Accept-Encoding": "gzip, deflate, br",
      },
      // Next.js caching
      next: {
        revalidate:
          CACHE_CONFIG[endpoint as keyof typeof CACHE_CONFIG]?.ttl || 60,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Batch fetch multiple resources
   */
  async batchFetch(
    requests: Array<{ endpoint: string; query?: Record<string, any> }>
  ): Promise<any[]> {
    const promises = requests.map(({ endpoint, query = {} }) =>
      this.fetchWithCache(endpoint, query)
    );

    return Promise.all(promises);
  }

  /**
   * Prefetch data for specific pages
   */
  async prefetchPageData(pathname: string): Promise<void> {
    const prefetchMap: Record<string, () => Promise<void>> = {
      "/": async () => {
        // Prefetch homepage data
        await Promise.all([
          this.fetchWithCache(
            "homepage",
            {
              populate: {
                blocks: { populate: "*" },
                seo: { populate: "*" },
              },
            },
            "homepage"
          ),
          this.fetchWithCache(
            "games",
            {
              pagination: { pageSize: 18 },
              sort: ["ratingAvg:desc"],
            },
            "games"
          ),
        ]);
      },
      "/games": async () => {
        // Prefetch games page
        await this.fetchWithCache(
          "games",
          {
            pagination: { pageSize: 24 },
            populate: { images: "*", provider: "*", categories: "*" },
          },
          "games"
        );
      },
      // Add more pages as needed
    };

    const prefetchFn = prefetchMap[pathname];
    if (prefetchFn) {
      await prefetchFn();
    }
  }
}

// Export singleton instance
export const optimizedStrapiClient = new OptimizedStrapiClient();
