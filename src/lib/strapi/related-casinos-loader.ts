// src/lib/strapi/related-casinos-loader.ts

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { strapiClient } from "./strapi-client";
import { cacheManager } from "@/lib/cache/cache-manager";
import { casinoTableQueryChunk } from "@/lib/strapi/query-chunks/shared-chunks";
import type {
  ProviderWithCasinos,
//   ProviderResponse,
} from "@/types/related-casinos.types";
import type { CasinoData } from "@/types/casino.types";

/**
 * Cache configuration for related casinos
 */
const CACHE_CONFIG = {
  ttl: 600, // 10 minutes
  tags: ["providers", "casinos", "related-casinos"],
};

/**
 * Build query to fetch provider with related casinos
 */
function buildProviderQuery(providerSlug: string) {
  return {
    fields: ["title", "slug"],
    populate: {
      images: {
        fields: ["url", "width", "height", "alternativeText"],
      },
      relatedCasinos: casinoTableQueryChunk(true),
    },
    filters: {
      slug: {
        $eq: providerSlug,
      },
    },
  };
}

/**
 * React cache for deduplicating requests within a single render
 */
const getProviderWithCasinosCached = cache(
  async (providerSlug: string): Promise<ProviderWithCasinos | null> => {
    if (!providerSlug) return null;

    const cacheKey = `provider-casinos:${providerSlug}`;

    try {
      // Try to get from Redis cache first
      const cached = await cacheManager.get<ProviderWithCasinos>(cacheKey);
      if (cached.data) {
        console.log(`Provider casinos cache hit for: ${providerSlug}`);
        return cached.data;
      }

      // Build and execute query
      const query = buildProviderQuery(providerSlug);

      const response = await strapiClient.fetchWithCache<{
        data: ProviderWithCasinos[];
      }>("slot-providers", query, CACHE_CONFIG.ttl);

      const provider = response.data?.[0] || null;

      if (provider) {
        // Cache the result
        await cacheManager.set(cacheKey, provider, {
          ttl: CACHE_CONFIG.ttl,
          swr: CACHE_CONFIG.ttl * 2,
        });
      }

      return provider;
    } catch (error) {
      console.error(
        `Failed to fetch provider ${providerSlug} with casinos:`,
        error
      );
      return null;
    }
  }
);

/**
 * Next.js unstable_cache for persistent caching with ISR
 */
const getProviderWithCasinosPersistent = unstable_cache(
  async (providerSlug: string) => {
    return getProviderWithCasinosCached(providerSlug);
  },
  ["provider-casinos"],
  {
    revalidate: CACHE_CONFIG.ttl,
    tags: CACHE_CONFIG.tags,
  }
);

/**
 * Main loader to fetch provider with related casinos
 */
export async function getProviderWithCasinos(
  providerSlug: string,
  options: { cached?: boolean } = { cached: true }
): Promise<ProviderWithCasinos | null> {
  if (options.cached) {
    return getProviderWithCasinosPersistent(providerSlug);
  }

  return getProviderWithCasinosCached(providerSlug);
}

/**
 * Fetch only the related casinos for a provider
 * This is the main function used by components
 */
export async function getRelatedCasinos(
  providerSlug: string,
  maxCasinos?: number
): Promise<CasinoData[]> {
  const provider = await getProviderWithCasinos(providerSlug);

  if (!provider?.relatedCasinos) {
    return [];
  }

  // Apply limit if specified
  const casinos =
    maxCasinos && maxCasinos > 0
      ? provider.relatedCasinos.slice(0, maxCasinos)
      : provider.relatedCasinos;

  return casinos;
}

/**
 * Prefetch provider data for specific routes
 */
export async function prefetchProviderData(providerSlug: string) {
  try {
    await getProviderWithCasinos(providerSlug, { cached: true });
  } catch (error) {
    console.error(`Prefetch error for provider ${providerSlug}:`, error);
  }
}

/**
 * Revalidate provider cache
 */
export async function revalidateProviderCache(providerSlug?: string) {
  const { revalidateTag } = await import("next/cache");

  // Revalidate Next.js cache tags
  revalidateTag("providers");
  revalidateTag("casinos");
  revalidateTag("related-casinos");

  // Clear Redis cache
  if (providerSlug) {
    await cacheManager.delete(`provider-casinos:${providerSlug}`);
  } else {
    await cacheManager.delete("provider-casinos:*");
  }
}
