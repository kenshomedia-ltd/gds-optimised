// src/lib/api/rating-fetcher.ts
import { unstable_cache } from "next/cache";

interface RatingData {
  ratingAvg: number;
  ratingCount: number;
}

/**
 * Fetch rating data for a game or casino
 * Can be used client-side or server-side
 */
export async function fetchRatingData(
  documentId: string,
  type: "games" | "casinos" = "games"
): Promise<RatingData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL;
    const apiToken =
      process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN;

    if (!apiUrl || !apiToken) {
      console.error("[fetchRatingData] Missing API configuration");
      return null;
    }

    // Build query string
    const params = new URLSearchParams({
      "fields[0]": "ratingAvg",
      "fields[1]": "ratingCount",
    });

    const url = `${apiUrl}/api/${type}/${documentId}?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 60, // Cache for 1 minute
        tags: [`rating-${type}-${documentId}`],
      },
    });

    if (!response.ok) {
      console.error(
        `[fetchRatingData] Error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = (await response.json()) as
      | StrapiResponse<RatingResponseData>
      | RatingResponseData;

    return parseRatingResponse(data);
  } catch (error) {
    console.error("[fetchRatingData] Failed to fetch:", error);
    return null;
  }
}

/**
 * Cached version of fetchRatingData for server components
 */
export const fetchRatingDataCached = unstable_cache(
  fetchRatingData,
  ["rating-data"],
  {
    revalidate: 60, // 1 minute
    tags: ["ratings"],
  }
);

/**
 * Build rating query parameters
 * Utility function for constructing rating-specific queries
 */
export function buildRatingQueryParams(): URLSearchParams {
  return new URLSearchParams({
    "fields[0]": "ratingAvg",
    "fields[1]": "ratingCount",
  });
}

interface StrapiResponse<T> {
  data?: T;
  meta?: Record<string, unknown>;
}

interface RatingResponseData {
  ratingAvg?: number;
  ratingCount?: number;
}

/**
 * Parse rating response from Strapi
 * Handles different response formats
 */
export function parseRatingResponse(
  response: StrapiResponse<RatingResponseData> | RatingResponseData
): RatingData {
  // Handle Strapi v5 response structure
  let data: RatingResponseData;

  if ("data" in response && response.data) {
    data = response.data;
  } else {
    data = response as RatingResponseData;
  }

  return {
    ratingAvg: Number(data.ratingAvg) || 0,
    ratingCount: Number(data.ratingCount) || 0,
  };
}

// Example usage in a React component:
/*
// Client Component
"use client";
import { useEffect, useState } from "react";
import { fetchRatingData } from "@/lib/api/rating-fetcher";

export function LiveRatingDisplay({ documentId, type }) {
  const [rating, setRating] = useState(null);

  useEffect(() => {
    fetchRatingData(documentId, type).then(setRating);
  }, [documentId, type]);

  if (!rating) return <div>Loading...</div>;

  return (
    <div>
      Rating: {rating.ratingAvg.toFixed(1)} ({rating.ratingCount} reviews)
    </div>
  );
}

// Server Component
import { fetchRatingDataCached } from "@/lib/api/rating-fetcher";

export async function ServerRatingDisplay({ documentId, type }) {
  const rating = await fetchRatingDataCached(documentId, type);

  if (!rating) return null;

  return (
    <div>
      Rating: {rating.ratingAvg.toFixed(1)} ({rating.ratingCount} reviews)
    </div>
  );
}
*/
