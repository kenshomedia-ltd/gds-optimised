// src/lib/strapi/build-time-redirects.ts
/**
 * This file is used at build time to fetch and cache redirects
 * It's separate from the main loader to avoid runtime dependencies
 */
import {
  fetchRedirects,
  transformRedirectsForNextJs,
} from "./redirects-loader";

/**
 * Get redirects for Next.js config at build time
 * This function is called during the build process
 * We don't specify return type to let TypeScript infer it
 */
export async function getBuildTimeRedirects() {
  try {
    // Fetch redirects from Strapi
    const strapiRedirects = await fetchRedirects();

    // Transform to Next.js format
    const nextRedirects = transformRedirectsForNextJs(strapiRedirects);

    // Log summary for debugging during build
    console.log(`[Build] Processing ${nextRedirects.length} redirects`);

    const internalCount = nextRedirects.filter(
      (r) => !("basePath" in r) || r.basePath !== false
    ).length;
    const externalCount = nextRedirects.filter(
      (r) => r.basePath === false
    ).length;

    console.log(`[Build] Internal redirects: ${internalCount}`);
    console.log(`[Build] External redirects: ${externalCount}`);

    // Optionally log all redirects in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[Build] Sample redirects:",
        JSON.stringify(nextRedirects.slice(0, 5), null, 2)
      );
    }

    return nextRedirects;
  } catch (error) {
    console.error("[Build] Failed to process redirects:", error);
    // Return empty array to prevent build failure
    return [];
  }
}
