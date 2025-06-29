// src/lib/strapi/game-page-data-loader.ts

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { strapiClient } from "./strapi-client";
import { cacheManager } from "@/lib/cache/cache-manager";
import { getGameEmbedData } from "@/app/actions/games-api";
import {
  createGameStaticQuery,
  createGameDynamicQuery,
  mergeGamePageData,
} from "./game-page-query-splitter";
import type { GamePageData, GamePageSplitData } from "@/types/game-page.types";

/**
 * Revalidation times for different data types
 */
const REVALIDATE_TIMES = {
  static: 3600, // 1 hour for static content
  dynamic: 60, // 1 minute for dynamic content
} as const;

/**
 * Fetch static game data with caching
 */
const getGameStaticDataCached = cache(
  async (
    slug: string,
    forceRefresh: boolean = false
  ): Promise<GamePageSplitData["staticData"] | null> => {
    const cacheKey = `game-static-${slug}`;

    console.log(
      `[getGameStaticDataCached] Called for slug: ${slug}, forceRefresh: ${forceRefresh}`
    );

    try {
      // Try to get from Redis cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await cacheManager.get(cacheKey);
        if (cached.data !== null && cached.data !== undefined) {
          // Validate the cached data has the expected structure
          if (
            typeof cached.data === "object" &&
            "title" in cached.data &&
            "slug" in cached.data &&
            "id" in cached.data
          ) {
            console.log(`Game static data cache hit for: ${slug}`);
            return cached.data as GamePageSplitData["staticData"];
          } else {
            console.warn(
              `Invalid cached static data for ${slug}, refetching...`
            );
            // Invalid cache data, delete it
            await cacheManager.delete(cacheKey);
          }
        }
      } else {
        console.log(
          `[getGameStaticDataCached] Skipping cache check due to forceRefresh`
        );
      }

      // Create and log the query
      const staticQuery = createGameStaticQuery(slug);

      // Fetch from Strapi - also bypass strapi client cache if forceRefresh
      console.log(
        `[Game Static Query] Calling strapiClient.fetchWithCache with ttl:`,
        forceRefresh ? 0 : REVALIDATE_TIMES.static
      );

      const response = await strapiClient.fetchWithCache<{
        data: GamePageData[];
      }>("games", staticQuery, forceRefresh ? 0 : REVALIDATE_TIMES.static);


      if (!response?.data?.[0]) {
        console.log(`[Game Static Query] No data found for slug: ${slug}`);
        // Don't cache null results
        return null;
      }

      const staticData: GamePageSplitData["staticData"] = {
        id: response.data[0].id,
        documentId: response.data[0].documentId,
        title: response.data[0].title,
        heading: response.data[0].heading,
        slug: response.data[0].slug,
        introduction: response.data[0].introduction,
        content1: response.data[0].content1,
        blocks: response.data[0].blocks,
        author: response.data[0].author,
        howTo: response.data[0].howTo,
        proscons: response.data[0].proscons,
        faqs: response.data[0].faqs,
        gameInfoTable: response.data[0].gameInfoTable,
        seo: response.data[0].seo,
        createdAt: response.data[0].createdAt,
        updatedAt: response.data[0].updatedAt,
        publishedAt: response.data[0].publishedAt,
      };

      // Cache the result
      await cacheManager.set(cacheKey, staticData, {
        ttl: REVALIDATE_TIMES.static,
        swr: REVALIDATE_TIMES.static * 2,
      });

      return staticData;
    } catch (error) {
      console.error(`Failed to fetch static game data for ${slug}:`, error);
      return null;
    }
  }
);

/**
 * Fetch dynamic game data with caching
 */
const getGameDynamicDataCached = cache(
  async (
    slug: string,
    forceRefresh: boolean = false
  ): Promise<GamePageSplitData["dynamicData"] | null> => {
    const cacheKey = `game-dynamic-${slug}`;

    console.log(
      `[getGameDynamicDataCached] Called for slug: ${slug}, forceRefresh: ${forceRefresh}`
    );

    try {
      // Try to get from Redis cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await cacheManager.get(cacheKey);
        if (cached.data !== null && cached.data !== undefined) {
          // Validate the cached data has the expected structure
          if (
            typeof cached.data === "object" &&
            "ratingAvg" in cached.data &&
            "ratingCount" in cached.data &&
            "views" in cached.data
          ) {
            console.log(`Game dynamic data cache hit for: ${slug}`);
            return cached.data as GamePageSplitData["dynamicData"];
          } else {
            console.warn(
              `Invalid cached dynamic data for ${slug}, refetching...`
            );
            // Invalid cache data, delete it
            await cacheManager.delete(cacheKey);
          }
        }
      } else {
        console.log(
          `[getGameDynamicDataCached] Skipping cache check due to forceRefresh`
        );
      }

      // Create and log the query
      const dynamicQuery = createGameDynamicQuery(slug);

      // Fetch from Strapi - also bypass strapi client cache if forceRefresh
      console.log(
        `[Game Dynamic Query] Calling strapiClient.fetchWithCache with ttl:`,
        forceRefresh ? 0 : REVALIDATE_TIMES.dynamic
      );

      const response = await strapiClient.fetchWithCache<{
        data: GamePageData[];
      }>("games", dynamicQuery, forceRefresh ? 0 : REVALIDATE_TIMES.dynamic);

      if (!response?.data?.[0]) {
        console.log(`[Game Dynamic Query] No data found for slug: ${slug}`);
        // Don't cache null results
        return null;
      }

      const dynamicData: GamePageSplitData["dynamicData"] = {
        ratingAvg: response.data[0].ratingAvg,
        ratingCount: response.data[0].ratingCount,
        views: response.data[0].views,
        isGameDisabled: response.data[0].isGameDisabled,
        gameDisableText: response.data[0].gameDisableText,
        gamesApiOverride: response.data[0].gamesApiOverride,
        embedCode: response.data[0].embedCode,
        images: response.data[0].images,
        provider: response.data[0].provider,
        categories: response.data[0].categories,
      };

      // If gamesApiOverride is false and embedCode is null, fetch from games API
      if (!dynamicData.gamesApiOverride && !dynamicData.embedCode) {
        console.log(
          `[Game Dynamic Query] Fetching from Games API for slug: ${slug}`
        );
        const gamesApiData = await getGameEmbedData(slug);

        if (gamesApiData && gamesApiData.iframeURL) {
          console.log(`[Game Dynamic Query] Got iframe URL from Games API`);
          // Store the iframe URL in embedCode format
          dynamicData.embedCode = {
            desktopEmbedCode: gamesApiData.iframeURL,
            mobileEmbedCode: gamesApiData.iframeURL,
          };
        } else {
          console.log(`[Game Dynamic Query] No data from Games API`);
        }
      }

      // Cache the result
      await cacheManager.set(cacheKey, dynamicData, {
        ttl: REVALIDATE_TIMES.dynamic,
        swr: REVALIDATE_TIMES.dynamic * 2,
      });

      return dynamicData;
    } catch (error) {
      console.error(`Failed to fetch dynamic game data for ${slug}:`, error);
      return null;
    }
  }
);

/**
 * Next.js unstable_cache for persistent static data
 */
const getGameStaticDataPersistent = unstable_cache(
  async (slug: string): Promise<GamePageSplitData["staticData"] | null> => {
    const result = await getGameStaticDataCached(slug);
    // Ensure we return null if result is falsy
    return result || null;
  },
  ["game-static"],
  {
    revalidate: REVALIDATE_TIMES.static,
    tags: ["games", "game-static"],
  }
);

/**
 * Next.js unstable_cache for persistent dynamic data
 */
const getGameDynamicDataPersistent = unstable_cache(
  async (slug: string): Promise<GamePageSplitData["dynamicData"] | null> => {
    const result = await getGameDynamicDataCached(slug);
    // Ensure we return null if result is falsy
    return result || null;
  },
  ["game-dynamic"],
  {
    revalidate: REVALIDATE_TIMES.dynamic,
    tags: ["games", "game-dynamic"],
  }
);

/**
 * Main game page data loader with split queries
 */
export async function getGamePageData(
  slug: string,
  options: {
    cached?: boolean;
  } = { cached: true }
): Promise<GamePageData | null> {
  const startTime = Date.now();

  try {
    // When cached is false, we want to bypass ALL caches
    const forceRefresh = !options.cached;

    // Fetch static and dynamic data in parallel
    const [staticData, dynamicData] = await Promise.all([
      options.cached
        ? getGameStaticDataPersistent(slug)
        : getGameStaticDataCached(slug, forceRefresh),
      options.cached
        ? getGameDynamicDataPersistent(slug)
        : getGameDynamicDataCached(slug, forceRefresh),
    ]);

    // Type guard to ensure we have the right data
    if (
      !staticData ||
      typeof staticData !== "object" ||
      !("title" in staticData) ||
      !("slug" in staticData)
    ) {
      console.log(`[Game Page Data Loader] Invalid static data structure`);
      return null;
    }

    if (
      !dynamicData ||
      typeof dynamicData !== "object" ||
      !("ratingAvg" in dynamicData)
    ) {
      console.log(`[Game Page Data Loader] Invalid dynamic data structure`);
      return null;
    }

    // Merge the data back together
    const mergedData = mergeGamePageData(staticData, dynamicData);

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Game Page Data Loader] Game page data fetching took: ${
          Date.now() - startTime
        }ms`
      );
      console.log(
        `[Game Page Data Loader] Merged data fields:`,
        Object.keys(mergedData)
      );
    }

    return mergedData;
  } catch (error) {
    console.error(
      `[Game Page Data Loader] Failed to fetch game page data for ${slug}:`,
      error
    );
    return null;
  }
}

/**
 * Prefetch game data for faster navigation
 */
export async function prefetchGameData(slug: string) {
  try {
    await Promise.all([
      getGameStaticDataPersistent(slug),
      getGameDynamicDataPersistent(slug),
    ]);
  } catch (error) {
    console.error(`Failed to prefetch game data for ${slug}:`, error);
  }
}

/**
 * Clear game cache for a specific slug
 */
export async function clearGameCache(slug: string) {
  const staticKey = `game-static-${slug}`;
  const dynamicKey = `game-dynamic-${slug}`;

  await Promise.all([
    cacheManager.delete(staticKey),
    cacheManager.delete(dynamicKey),
  ]);

  console.log(`[Game Cache] Cleared cache for slug: ${slug}`);
}
