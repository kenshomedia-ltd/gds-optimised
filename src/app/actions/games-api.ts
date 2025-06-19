// src/app/actions/games-api.ts
"use server";

import { unstable_cache } from "next/cache";

interface GamesAPIEmbedData {
  iframeURL?: string;
  error?: string;
}

/**
 * Fetch embed data from the centralized games API
 * Internal function without React cache
 */
async function fetchGamesEmbedData(
  slug: string
): Promise<GamesAPIEmbedData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_GAMES_API_URL;
  const apiToken = process.env.NEXT_PUBLIC_GAMES_API_TOKEN;

  if (!apiUrl || !apiToken) {
    console.error("[Games API] Missing configuration");
    return null;
  }

  try {
    const url = `${apiUrl}/api/slots/slug/${slug}/embed-data`;

    console.log(`[Games API] Fetching embed data for: ${slug}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    });

    if (!response.ok) {
      console.error(
        `[Games API] Error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Handle Strapi response structure
    if (data.data) {
      return data.data;
    }

    return data;
  } catch (error) {
    console.error(`[Games API] Failed to fetch embed data:`, error);
    return null;
  }
}

/**
 * Server action to get game embed data
 * Uses Next.js unstable_cache for persistent caching
 */
export const getGameEmbedData = unstable_cache(
  fetchGamesEmbedData,
  ["game-embed-data"],
  {
    revalidate: 300, // 5 minutes
    tags: ["game-embed"],
  }
);
