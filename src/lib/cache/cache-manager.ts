// src/lib/cache/cache-manager.ts
import "server-only";
import { Redis } from "ioredis";
import { unstable_cache } from "next/cache";
import { cache } from "react";

// Lazy-initialized Redis instance
let redis: Redis | null = null;
let connectionAttempted = false;
let connectionFailed = false;

/**
 * Check if we should use Redis caching
 * Skip Redis entirely in development to avoid connection issues
 */
function shouldUseRedis(): boolean {
  // Skip Redis in development environment
  if (process.env.NODE_ENV === "development") {
    return false;
  }

  // In production, require Redis configuration
  return !!process.env.REDIS_HOST;
}

/**
 * Get or create Redis connection
 * This ensures the connection is created after environment variables are available
 */
function getRedisClient(): Redis | null {
  // Early return if we shouldn't use Redis
  if (!shouldUseRedis()) {
    return null;
  }

  // If we've already tried and failed, don't keep retrying
  if (connectionFailed) {
    return null;
  }

  if (!redis && !connectionAttempted) {
    connectionAttempted = true;

    const redisHost = process.env.REDIS_HOST || "localhost";
    const redisPort = parseInt(process.env.REDIS_PORT || "6379");
    const redisPassword = process.env.REDIS_PASSWORD;

    // In production, Redis must be configured
    if (!process.env.REDIS_HOST) {
      console.log(
        "[Redis] No REDIS_HOST configured, skipping Redis initialization"
      );
      connectionFailed = true;
      return null;
    }

    console.log(`[Redis] Initializing connection to ${redisHost}:${redisPort}`);

    try {
      redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: false, // Don't queue commands if not connected
        lazyConnect: false, // Try to connect immediately
        connectTimeout: 5000, // Fail fast during build
        disconnectTimeout: 2000,
        commandTimeout: 5000,
        enableAutoPipelining: true,
        // Retry strategy with limited attempts
        retryStrategy: (times) => {
          if (times > 5) {
            console.error("[Redis] Max retries reached, giving up");
            connectionFailed = true;
            return null; // Stop retrying
          }
          const delay = Math.min(times * 50, 2000);
          console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
          return delay;
        },
      });

      // Add event handlers for debugging
      redis.on("connect", () => {
        console.log(`[Redis] Connected to ${redisHost}:${redisPort}`);
        connectionFailed = false;
      });

      redis.on("error", (err) => {
        console.error("[Redis] Connection error:", err);
        // Don't mark as failed on transient errors if we've connected before
        if (!redis?.status || redis.status === "close") {
          connectionFailed = true;
        }
      });

      redis.on("ready", () => {
        console.log("[Redis] Ready to accept commands");
        connectionFailed = false;
      });

      redis.on("close", () => {
        console.log("[Redis] Connection closed");
      });
    } catch (error) {
      console.error("[Redis] Failed to initialize:", error);
      connectionFailed = true;
      redis = null;
    }
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
 * Automatically skips Redis in development environment
 */
export class CacheManager {
  /**
   * Get from cache with stale-while-revalidate
   */
  async get<T>(key: string): Promise<{ data: T | null; isStale: boolean }> {
    try {
      const client = getRedisClient();
      if (!client) {
        if (process.env.NODE_ENV === "development") {
          console.log(`[Cache] Skipping Redis in development for key: ${key}`);
        }
        return { data: null, isStale: false };
      }

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
      if (!client) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Cache] Skipping Redis set in development for key: ${key}`
          );
        }
        return; // Silently skip if Redis is not available
      }

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
      if (!client) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Cache] Skipping Redis delete in development for pattern: ${pattern}`
          );
        }
        return;
      }

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
      if (!client) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Cache] Skipping Redis mget in development for keys: ${keys.join(
              ", "
            )}`
          );
        }
        return new Map();
      }

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
    if (!client) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Cache] Skipping Redis warm cache in development`);
      }
      return;
    }

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

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    if (!shouldUseRedis()) {
      return false;
    }
    const client = getRedisClient();
    return client !== null && !connectionFailed;
  }

  /**
   * Invalidate cache entries by tags or patterns
   */
  async invalidate(patterns: string[]): Promise<void> {
    const client = getRedisClient();
    if (!client) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Cache] Skipping Redis invalidation in development for patterns: ${patterns.join(
            ", "
          )}`
        );
      }
      return;
    }

    try {
      for (const pattern of patterns) {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(...keys);
          console.log(
            `[Cache] Invalidated ${keys.length} keys for pattern: ${pattern}`
          );
        }
      }
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ totalKeys: number; memory: string }> {
    const client = getRedisClient();
    if (!client) {
      return { totalKeys: 0, memory: "0B (Redis disabled in development)" };
    }

    try {
      const totalKeys = await client.dbsize();
      const info = await client.info("memory");
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch ? memoryMatch[1] : "Unknown";

      return { totalKeys, memory };
    } catch (error) {
      console.error("Cache stats error:", error);
      return { totalKeys: 0, memory: "Error" };
    }
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

/**
 * Create a cache-wrapped function with React cache and Next.js unstable_cache
 * This function now gracefully handles development environment without Redis
 */
export function createCachedFunction<
  T extends (...args: any[]) => Promise<any>
>(fetcher: T, options: CacheOptions): T {
  const { key, ttl = 300, swr = 600, tags = [], revalidate } = options;

  // Create React cache for request-level deduplication
  const reactCached = cache(async (...args: Parameters<T>) => {
    // Try cache first (will skip Redis in development)
    const { data, isStale } = await cacheManager.get<Awaited<ReturnType<T>>>(
      key
    );

    if (data && !isStale) {
      return data;
    }

    // Fetch fresh data
    const fresh = await fetcher(...args);

    // Cache it (will skip Redis in development)
    await cacheManager.set(key, fresh, {
      ttl: ttl,
      swr: swr,
    });

    return fresh;
  });

  // Use Next.js unstable_cache for persistent caching
  return unstable_cache(reactCached, [key], {
    revalidate: revalidate || ttl,
    tags: tags,
  });
}

/**
 * Prefetch and warm cache for critical data
 */
export async function prefetchCriticalData(paths: string[]): Promise<void> {
  // Only attempt if Redis is available
  if (!cacheManager.isAvailable()) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[Cache] Redis not available in development, skipping prefetch"
      );
    } else {
      console.log("[Cache] Redis not available, skipping prefetch");
    }
    return;
  }

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
    } finally {
      redis = null;
      connectionAttempted = false;
      connectionFailed = false;
    }
  }
}
