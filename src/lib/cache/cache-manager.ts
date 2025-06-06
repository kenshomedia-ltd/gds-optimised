// src/lib/cache/cache-manager.ts
import { Redis } from "ioredis";
import { unstable_cache } from "next/cache";
import { cache } from "react";

// Initialize Redis with connection pooling
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  // Connection pool settings for better performance
  lazyConnect: true,
  connectTimeout: 10000,
  disconnectTimeout: 2000,
  commandTimeout: 5000,
  // Enable pipelining for better performance
  enableAutoPipelining: true,
});

// Cache configuration with stale-while-revalidate pattern
export const CACHE_CONFIG = {
  // Content types with different TTLs
  layout: {
    ttl: 300, // 5 minutes
    swr: 600, // Stale for 10 minutes while revalidating
    tags: ["layout", "navigation", "translations"],
  },
  homepage: {
    ttl: 60, // 1 minute
    swr: 300, // Stale for 5 minutes
    tags: ["homepage", "games", "blogs", "casinos"],
  },
  games: {
    ttl: 60, // 1 minute
    swr: 180, // Stale for 3 minutes
    tags: ["games"],
  },
  gameDetail: {
    ttl: 300, // 5 minutes
    swr: 600, // Stale for 10 minutes
    tags: ["games", "game-detail"],
  },
  blogs: {
    ttl: 300, // 5 minutes
    swr: 900, // Stale for 15 minutes
    tags: ["blogs"],
  },
  static: {
    ttl: 3600, // 1 hour
    swr: 7200, // Stale for 2 hours
    tags: ["static"],
  },
};

export interface CacheOptions {
  key: string;
  ttl?: number;
  swr?: number;
  tags?: string[];
  revalidate?: number;
}

/**
 * Enhanced cache manager with stale-while-revalidate pattern
 */
export class CacheManager {
  /**
   * Get from cache with stale-while-revalidate
   */
  async get<T>(key: string): Promise<{ data: T | null; isStale: boolean }> {
    try {
      const cached = await redis.get(key);
      if (!cached) {
        return { data: null, isStale: false };
      }

      const { data, timestamp, ttl, swr } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      const isExpired = age > ttl * 1000;
      const isStale = age > swr * 1000;

      if (isStale) {
        // Data is too old, return null
        await redis.del(key);
        return { data: null, isStale: true };
      }

      return { data, isStale: isExpired };
    } catch (error) {
      console.error(`Cache get error for ${key}:`, error);
      return { data: null, isStale: false };
    }
  }

  /**
   * Set in cache with metadata
   */
  async set<T>(
    key: string,
    data: T,
    options: Pick<CacheOptions, "ttl" | "swr">
  ): Promise<void> {
    try {
      const { ttl = 300, swr = 600 } = options;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
        swr,
      };

      // Set with SWR ttl
      await redis.setex(key, swr, JSON.stringify(cacheData));
    } catch (error) {
      console.error(`Cache set error for ${key}:`, error);
    }
  }

  /**
   * Delete from cache
   */
  async delete(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache delete error for ${pattern}:`, error);
    }
  }

  /**
   * Batch get multiple keys
   */
  async mget<T>(keys: string[]): Promise<Map<string, T>> {
    try {
      const values = await redis.mget(keys);
      const result = new Map<string, T>();

      values.forEach((value, index) => {
        if (value) {
          try {
            const { data } = JSON.parse(value);
            result.set(keys[index], data);
          } catch {
            // Skip invalid entries
          }
        }
      });

      return result;
    } catch (error) {
      console.error("Cache mget error:", error);
      return new Map();
    }
  }

  /**
   * Warm cache with multiple entries
   */
  async warmCache(
    entries: Array<{
      key: string;
      data: unknown;
      options: Pick<CacheOptions, "ttl" | "swr">;
    }>
  ): Promise<void> {
    const pipeline = redis.pipeline();

    for (const { key, data, options } of entries) {
      const { ttl = 300, swr = 600 } = options;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
        swr,
      };
      pipeline.setex(key, swr, JSON.stringify(cacheData));
    }

    try {
      await pipeline.exec();
    } catch (error) {
      console.error("Cache warm error:", error);
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

/**
 * Create a cached function with stale-while-revalidate
 */
export function createCachedFunction<
  T extends (...args: unknown[]) => Promise<unknown>
>(fn: T, options: CacheOptions): T {
  const wrappedFn = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const cacheKey = `${options.key}:${JSON.stringify(args)}`;

    // Try to get from cache
    const { data, isStale } = await cacheManager.get<ReturnType<T>>(cacheKey);

    if (data && !isStale) {
      // Fresh data, return immediately
      return data;
    }

    if (data && isStale) {
      // Stale data, return it but trigger background revalidation
      setImmediate(async () => {
        try {
          const fresh = await fn(...args);
          await cacheManager.set(cacheKey, fresh, {
            ttl: options.ttl,
            swr: options.swr,
          });
        } catch (error) {
          console.error("Background revalidation error:", error);
        }
      });

      return data;
    }

    // No data, fetch and cache
    const fresh = await fn(...args);
    await cacheManager.set(cacheKey, fresh, {
      ttl: options.ttl,
      swr: options.swr,
    });

    return fresh;
  };

  return wrappedFn as T;
}

/**
 * React cache wrapper with Redis backing
 */
export function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions
): () => Promise<T> {
  // Use React cache for request deduplication
  const reactCached = cache(async () => {
    const { data, isStale } = await cacheManager.get<T>(key);

    if (data && !isStale) {
      return data;
    }

    // Fetch fresh data
    const fresh = await fetcher();

    // Cache it
    await cacheManager.set(key, fresh, {
      ttl: options.ttl,
      swr: options.swr,
    });

    return fresh;
  });

  // Use Next.js unstable_cache for persistent caching
  return unstable_cache(reactCached, [key], {
    revalidate: options.revalidate || options.ttl,
    tags: options.tags,
  });
}

/**
 * Prefetch and warm cache for critical data
 */
export async function prefetchCriticalData(paths: string[]): Promise<void> {
  const entries = [];

  for (const path of paths) {
    // You can customize this based on your path structure
    if (path === "/") {
      // Prefetch homepage data
      // This would call your actual data fetching functions
    }
    // Add more path-specific prefetching
  }

  if (entries.length > 0) {
    await cacheManager.warmCache(entries);
  }
}
