// src/app/actions/ratings.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { strapiClient } from "@/lib/strapi/strapi-client";
import { cacheManager } from "@/lib/cache/cache-manager";

interface UpdateRatingParams {
  documentId: string;
  ratingType: "games" | "casinos";
  ratingValue: number;
  slug?: string; // Optional slug for path revalidation
}

interface UpdateRatingResponse {
  success: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  error?: string;
}

/**
 * Server action to update ratings for games or casinos
 * Matches the Astro API route pattern but with proper average calculation
 */
export async function updateRating({
  documentId,
  ratingType,
  ratingValue,
  slug,
}: UpdateRatingParams): Promise<UpdateRatingResponse> {
  try {
    // Validate inputs
    if (!documentId || !ratingType || !ratingValue) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    if (ratingValue < 1 || ratingValue > 5) {
      return {
        success: false,
        error: "Rating must be between 1 and 5",
      };
    }

    // Use the same environment variables as Astro
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

    if (!apiUrl || !apiToken) {
      console.error("[updateRating] Missing API configuration");
      return {
        success: false,
        error: "Server configuration error",
      };
    }

    // First, fetch current rating data to calculate the new average
    const currentResponse = await fetch(
      `${apiUrl}/api/${ratingType}/${documentId}?fields[0]=ratingAvg&fields[1]=ratingCount`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (!currentResponse.ok) {
      console.error("[updateRating] Failed to fetch current rating data");
      return {
        success: false,
        error: "Failed to fetch current rating",
      };
    }

    const currentData = await currentResponse.json();
    const current = currentData.data || currentData;

    // Calculate new average properly
    const currentAvg = parseFloat(current.ratingAvg) || 0;
    const currentCount = parseInt(current.ratingCount) || 0;
    const newCount = currentCount + 1;
    const newAvg = (currentAvg * currentCount + ratingValue) / newCount;

    // Match Astro's request structure exactly, but with correct values
    const body = {
      data: {
        ratingAvg: newAvg,
        ratingCount: newCount,
      },
    };

    const opts = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(body),
    };

    // Use the same URL pattern as Astro: /api/${itemPath}/${id}
    const updateUrl = `${apiUrl}/api/${ratingType}/${documentId}`;

    const res = await fetch(updateUrl, opts);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[updateRating] Update failed: ${res.status}`, errorText);
      return {
        success: false,
        error: "Failed to update rating",
      };
    }

    // Automatically publish the updated entry if draft & publish is enabled
    const publishUrl = `${apiUrl}/api/${ratingType}/${documentId}/actions/publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!publishRes.ok) {
      const publishError = await publishRes.text();
      console.error(`[updateRating] Publish failed: ${publishRes.status}`, publishError);
    }

    const responseData = await res.json();
    const updatedItem = responseData.data || responseData;

    // Clear caches after successful update
    if (ratingType === "games") {
      await cacheManager.delete(`game-static-${documentId}`);
      await cacheManager.delete(`game-dynamic-${documentId}`);
      await strapiClient.invalidateCache("games");
      revalidateTag("games");
      revalidateTag(`game-${documentId}`);

      if (slug) {
        revalidatePath(`/slot-machines/${slug}`, "page");
      }
    } else if (ratingType === "casinos") {
      await cacheManager.delete(`casino-static-${documentId}`);
      await cacheManager.delete(`casino-dynamic-${documentId}`);
      await strapiClient.invalidateCache("casinos");
      revalidateTag("casinos");
      revalidateTag(`casino-${documentId}`);

      if (slug) {
        revalidatePath(`/casino/recensione/${slug}`, "page");
      }
    }

    return {
      success: true,
      ratingAvg: updatedItem.ratingAvg || newAvg,
      ratingCount: updatedItem.ratingCount || newCount,
    };
  } catch (error) {
    console.error("[updateRating] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server action to fetch current rating data
 * Used to get the latest rating after an update
 */
export async function getCurrentRating({
  documentId,
  type = "games",
}: {
  documentId: string;
  type: "games" | "casinos";
}): Promise<{ ratingAvg: number; ratingCount: number } | null> {
  try {
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

    if (!apiUrl || !apiToken) {
      console.error("[getCurrentRating] Missing API configuration");
      return null;
    }

    // Build the URL with query string for fields
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
        revalidate: 0, // Don't cache this request
      },
    });

    if (!response.ok) {
      console.error(
        `[getCurrentRating] API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const responseData = await response.json();

    // Handle Strapi v5 response structure
    const ratingData = responseData.data || responseData;

    return {
      ratingAvg: ratingData.ratingAvg || 0,
      ratingCount: ratingData.ratingCount || 0,
    };
  } catch (error) {
    console.error("[getCurrentRating] Error:", error);
    return null;
  }
}
