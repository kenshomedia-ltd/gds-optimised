// src/lib/cache/cache-manager.ts
import "server-only";
import { Redis } from "ioredis";
import { unstable_cache } from "next/cache";
import { cache } from "react";

// Lazy-initialized Redis instance
let redis: Redis | null = null;

/**
 * Get or create Redis connection
 * This ensures the connection is created after environment variables are available
 */
function getRedisClient(): Redis {
  if (!redis) {
    const redisHost = process.env.REDIS_HOST || "localhost";
    const redisPort = parseInt(process.env.REDIS_PORT || "6379");
    const redisPassword = process.env.REDIS_PASSWORD;

    console.log(`[Redis] Initializing connection to ${redisHost}:${redisPort}`);

    redis = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
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
      // Retry strategy
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
    });

    // Add event handlers for debugging
    redis.on("connect", () => {
      console.log(`[Redis] Connected to ${redisHost}:${redisPort}`);
    });

    redis.on("error", (err) => {
      console.error("[Redis] Connection error:", err);
    });

    redis.on("ready", () => {
      console.log("[Redis] Ready to accept commands");
    });
  }

  return redis;
}

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

// Type for cache entries
interface CacheEntry {
  key: string;
  data: unknown;
  options: Pick<CacheOptions, "ttl" | "swr">;
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
      const client = getRedisClient();
      const cached = await client.get(key);
      if (!cached) {
        return { data: null, isStale: false };
      }

      const { data, timestamp, ttl, swr } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      const isExpired = age > ttl * 1000;
      const isStale = age > swr * 1000;

      if (isStale) {
        // Data is too old, return null
        await client.del(key);
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
      const client = getRedisClient();
      const { ttl = 300, swr = 600 } = options;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
        swr,
      };

      // Set with SWR ttl
      await client.setex(key, swr, JSON.stringify(cacheData));
    } catch (error) {
      console.error(`Cache set error for ${key}:`, error);
    }
  }

  /**
   * Delete from cache
   */
  async delete(pattern: string): Promise<void> {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
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
      const client = getRedisClient();
      const values = await client.mget(keys);
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
  async warmCache(entries: CacheEntry[]): Promise<void> {
    const client = getRedisClient();
    const pipeline = client.pipeline();

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
 * Fixed type constraints for proper TypeScript inference
 */
export function createCachedFunction<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: CacheOptions
): (...args: TArgs) => Promise<TReturn> {
  const wrappedFn = async (...args: TArgs): Promise<TReturn> => {
    const cacheKey = `${options.key}:${JSON.stringify(args)}`;

    // Try to get from cache
    const { data, isStale } = await cacheManager.get<TReturn>(cacheKey);

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

  return wrappedFn;
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
  // Explicitly type the entries array
  const entries: CacheEntry[] = [];

  for (const path of paths) {
    // You can customize this based on your path structure
    if (path === "/") {
      // Example: Prefetch homepage data
      // const homepageData = await fetchHomepageData();
      // entries.push({
      //   key: "homepage:data",
      //   data: homepageData,
      //   options: CACHE_CONFIG.homepage
      // });
    }
    // Add more path-specific prefetching
  }

  if (entries.length > 0) {
    await cacheManager.warmCache(entries);
  }
}

/**
 * Gracefully close Redis connection
 * Call this on application shutdown
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    try {
      await redis.quit();
      console.log("[Redis] Connection closed gracefully");
    } catch (error) {
      console.error("[Redis] Error closing connection:", error);
    }
  }
}
