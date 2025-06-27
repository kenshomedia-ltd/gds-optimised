import { strapiClient } from "./strapi-client";
import type { RedirectData, RedirectsResponse } from "@/types/redirect.types";
import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Validate and normalize redirect URL
 */
function normalizeRedirectUrl(url: string): string {
  // Ensure URLs start with / for internal redirects
  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("/")
  ) {
    return `/${url}`;
  }
  return url;
}

/**
 * Remove base path from URL if present
 * This is needed because Next.js automatically prepends the basePath
 */
function removeBasePath(url: string, basePath: string): string {
  if (url.startsWith(basePath)) {
    return url.slice(basePath.length) || "/";
  }
  return url;
}

/**
 * Fetch redirects from Strapi with caching
 * Since redirects don't change frequently, we use a longer cache TTL
 */
export async function fetchRedirects(): Promise<RedirectData[]> {
  try {
    console.log("[Redirects] Fetching redirects from Strapi...");

    const response = await strapiClient.fetchWithCache<RedirectsResponse>(
      "redirects",
      {
        pagination: {
          pageSize: 1000, // Match the Astro implementation
          page: 1,
        },
        fields: ["redirectUrl", "redirectTarget", "redirectMethod"],
        sort: ["createdAt:desc"],
      },
      3600 // Cache for 1 hour since redirects rarely change
    );

    if (!response?.data) {
      console.warn("[Redirects] No redirects found in Strapi response");
      return [];
    }

    console.log(`[Redirects] Fetched ${response.data.length} redirects`);
    return response.data;
  } catch (error) {
    console.error("[Redirects] Failed to fetch redirects from Strapi:", error);
    return [];
  }
}

/**
 * Transform Strapi redirects to Next.js redirect format
 * Handles the basePath configuration properly
 */
export function transformRedirectsForNextJs(
  redirects: RedirectData[]
): Redirect[] {
  const basePath = "/it"; // Your Next.js basePath

  return redirects
    .filter((redirect) => {
      // Filter out invalid redirects
      if (!redirect.redirectUrl || !redirect.redirectTarget) {
        console.warn(
          `[Redirects] Skipping invalid redirect: ${JSON.stringify(redirect)}`
        );
        return false;
      }
      return true;
    })
    .map((redirect): Redirect => {
      // Normalize URLs
      let source = normalizeRedirectUrl(redirect.redirectUrl);
      let destination = redirect.redirectTarget;

      // Check if it's an external URL
      const isExternal =
        destination.startsWith("http://") || destination.startsWith("https://");

      // Remove basePath from source and destination for internal redirects
      // Next.js will automatically handle the basePath
      if (!isExternal) {
        source = removeBasePath(source, basePath);
        destination = removeBasePath(destination, basePath);
      }

      // Log external redirects for debugging
      if (isExternal) {
        console.log(
          `[Redirects] External redirect: ${source} -> ${destination}`
        );
      }

      // Build the redirect object according to Next.js Redirect type
      const redirectObj: Redirect = {
        source,
        destination,
        permanent: redirect.redirectMethod === "permanent",
      };

      // Only add basePath: false for external URLs
      if (isExternal) {
        redirectObj.basePath = false;
      }

      return redirectObj;
    });
}
