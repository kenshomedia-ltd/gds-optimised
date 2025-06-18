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
import type { GamePageData } from "@/types/game-page.types";

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
  async (slug: string, forceRefresh: boolean = false) => {
    const cacheKey = `game-static-${slug}`;

    console.log(
      `[getGameStaticDataCached] Called for slug: ${slug}, forceRefresh: ${forceRefresh}`
    );

    try {
      // Try to get from Redis cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log(`Game static data cache hit for: ${slug}`);
          // Check if it's the new cache format with data/isStale
          if (cached.data !== undefined) {
            return cached.data;
          }
          return cached;
        }
      } else {
        console.log(
          `[getGameStaticDataCached] Skipping cache check due to forceRefresh`
        );
      }

      // Create and log the query
      const staticQuery = createGameStaticQuery(slug);
      console.log(`[Game Static Query] Fetching for slug: ${slug}`);
      console.log(
        `[Game Static Query] Query:`,
        JSON.stringify(staticQuery, null, 2)
      );

      // Fetch from Strapi - also bypass strapi client cache if forceRefresh
      console.log(
        `[Game Static Query] Calling strapiClient.fetchWithCache with ttl:`,
        forceRefresh ? 0 : REVALIDATE_TIMES.static
      );

      const response = await strapiClient.fetchWithCache<{
        data: GamePageData[];
      }>("games", staticQuery, forceRefresh ? 0 : REVALIDATE_TIMES.static);

      console.log(
        `[Game Static Query] Response received, data length:`,
        response?.data?.length || 0
      );

      if (!response?.data?.[0]) {
        console.log(`[Game Static Query] No data found for slug: ${slug}`);
        return null;
      }

      const staticData = {
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
      };

      console.log(
        `[Game Static Query] Extracted static data fields:`,
        Object.keys(staticData)
      );

      // Cache the result
      await cacheManager.set(cacheKey, staticData, REVALIDATE_TIMES.static);

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
  async (slug: string, forceRefresh: boolean = false) => {
    const cacheKey = `game-dynamic-${slug}`;

    console.log(
      `[getGameDynamicDataCached] Called for slug: ${slug}, forceRefresh: ${forceRefresh}`
    );

    try {
      // Try to get from Redis cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log(`Game dynamic data cache hit for: ${slug}`);
          // Check if it's the new cache format with data/isStale
          if (cached.data !== undefined) {
            return cached.data;
          }
          return cached;
        }
      } else {
        console.log(
          `[getGameDynamicDataCached] Skipping cache check due to forceRefresh`
        );
      }

      // Create and log the query
      const dynamicQuery = createGameDynamicQuery(slug);
      console.log(`[Game Dynamic Query] Fetching for slug: ${slug}`);
      console.log(
        `[Game Dynamic Query] Query:`,
        JSON.stringify(dynamicQuery, null, 2)
      );

      // Fetch from Strapi - also bypass strapi client cache if forceRefresh
      console.log(
        `[Game Dynamic Query] Calling strapiClient.fetchWithCache with ttl:`,
        forceRefresh ? 0 : REVALIDATE_TIMES.dynamic
      );

      const response = await strapiClient.fetchWithCache<{
        data: GamePageData[];
      }>("games", dynamicQuery, forceRefresh ? 0 : REVALIDATE_TIMES.dynamic);

      console.log(
        `[Game Dynamic Query] Response received, data length:`,
        response?.data?.length || 0
      );

      // Debug log the raw response to check embedCode
      if (response?.data?.[0]) {
        console.log(
          `[Game Dynamic Query] Raw response embedCode:`,
          response.data[0].embedCode
        );
        console.log(
          `[Game Dynamic Query] Raw response keys:`,
          Object.keys(response.data[0])
        );
      }

      if (!response?.data?.[0]) {
        console.log(`[Game Dynamic Query] No data found for slug: ${slug}`);
        return null;
      }

      const dynamicData = {
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

      console.log(
        `[Game Dynamic Query] Extracted dynamic data fields:`,
        Object.keys(dynamicData)
      );
      console.log(
        `[Game Dynamic Query] embedCode value:`,
        dynamicData.embedCode
      );
      console.log(
        `[Game Dynamic Query] gamesApiOverride:`,
        dynamicData.gamesApiOverride
      );

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
      await cacheManager.set(cacheKey, dynamicData, REVALIDATE_TIMES.dynamic);

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
  async (slug: string) => {
    return getGameStaticDataCached(slug);
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
  async (slug: string) => {
    return getGameDynamicDataCached(slug);
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

  console.log(`[Game Page Data Loader] Starting fetch for slug: ${slug}`);
  console.log(`[Game Page Data Loader] Options:`, options);
  console.log(`[Game Page Data Loader] Will use cached:`, options.cached);

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

    console.log(
      `[Game Page Data Loader] Results - Static data: ${!!staticData}, Dynamic data: ${!!dynamicData}`
    );

    // Debug log the actual data
    console.log(`[Game Page Data Loader] Static data value:`, staticData);
    console.log(`[Game Page Data Loader] Dynamic data value:`, dynamicData);

    if (!staticData || !dynamicData) {
      console.log(
        `[Game Page Data Loader] Missing data - Static: ${!!staticData}, Dynamic: ${!!dynamicData}`
      );

      // Log what we got back to debug
      if (staticData !== null && staticData !== undefined) {
        console.log(
          `[Game Page Data Loader] Static data type:`,
          typeof staticData
        );
        console.log(
          `[Game Page Data Loader] Static data structure:`,
          Object.keys(staticData)
        );
      }
      if (dynamicData !== null && dynamicData !== undefined) {
        console.log(
          `[Game Page Data Loader] Dynamic data type:`,
          typeof dynamicData
        );
        console.log(
          `[Game Page Data Loader] Dynamic data structure:`,
          Object.keys(dynamicData)
        );
      }

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
