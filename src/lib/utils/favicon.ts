// src/lib/utils/favicon.ts
import { existsSync } from "fs";
import { join } from "path";

/**
 * Updated favicon utility to work with format: /favicon-{siteId}.png
 * This replaces the previous complex multi-size system with a simpler approach
 */

/**
 * Get the favicon file path for a specific site
 * Now works with your format: /favicon-{siteId}.png
 * @param siteId - The site identifier (e.g., 'gds', 'csi')
 * @param size - Optional size for different favicon types (defaults to main favicon)
 * @returns The path to the favicon file
 */
export function getFaviconPath(siteId: string, size?: string): string {
  // For your format: /favicon-{siteId}.png
  if (!size || size === "default") {
    return `/favicon-${siteId}.png`;
  }

  // For specific sizes we still return the same single file
  return `/favicon-${siteId}.png`;
}

/**
 * Check if a favicon file exists (server-side only)
 * @param siteId - The site identifier
 * @returns True if the file exists, false otherwise
 */
export function faviconExists(siteId: string): boolean {
  if (typeof window !== "undefined") {
    // Can't check file existence on client-side
    return true;
  }

  try {
    const publicDir = join(process.cwd(), "public");
    const faviconPath = join(publicDir, `favicon-${siteId}.png`);
    return existsSync(faviconPath);
  } catch {
    return false;
  }
}

/**
 * Generate favicon link objects for Next.js metadata
 * Simplified to work with your single favicon format
 * @param siteId - The site identifier
 * @returns Array of favicon link objects for Next.js metadata
 */
export function generateFaviconLinks(siteId: string) {
  const faviconUrl = getFaviconPath(siteId);

  const icons: Array<{
    rel?: string;
    url: string;
    sizes?: string;
    type?: string;
  }> = [];

  // Primary favicon - your format
  icons.push({
    rel: "icon",
    url: faviconUrl,
    type: "image/png",
  });

  // Shortcut icon for older browsers
  icons.push({
    rel: "shortcut icon",
    url: faviconUrl,
    type: "image/png",
  });

  // Apple Touch Icon - use same favicon
  icons.push({
    rel: "apple-touch-icon",
    url: faviconUrl,
  });

  // Different sizes referencing the same file
  // Browsers will scale as needed
  icons.push({
    rel: "icon",
    url: faviconUrl,
    sizes: "16x16",
    type: "image/png",
  });

  icons.push({
    rel: "icon",
    url: faviconUrl,
    sizes: "32x32",
    type: "image/png",
  });

  icons.push({
    rel: "icon",
    url: faviconUrl,
    sizes: "192x192",
    type: "image/png",
  });

  return icons;
}

/**
 * Validate that the favicon exists for a site
 * @param siteId - The site identifier
 * @returns Object with validation results
 */
export function validateSiteFavicons(siteId: string) {
  const results = {
    siteId,
    valid: faviconExists(siteId),
    expectedFile: `favicon-${siteId}.png`,
    path: getFaviconPath(siteId),
  };

  return results;
}

/**
 * Generate Web App Manifest with site-specific icons
 * @param siteId - The site identifier
 * @param siteName - The site name
 * @param themeColor - The theme color for the manifest
 * @returns Web app manifest object
 */
export function generateWebAppManifest(
  siteId: string,
  siteName: string,
  themeColor: string = "#000000"
) {
  const faviconUrl = getFaviconPath(siteId);

  return {
    name: siteName,
    short_name: siteName,
    description: `${siteName} - Casino Games & Reviews`,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: themeColor,
    icons: [
      {
        src: faviconUrl,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: faviconUrl,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: faviconUrl,
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

/**
 * Get all available site favicons (async version)
 * Scans the public directory for files matching your format
 * @returns Promise<Array of available site IDs>
 */
export async function getAvailableSites(): Promise<string[]> {
  if (typeof window !== "undefined") {
    // Can't scan directory on client-side
    return [];
  }

  try {
    const fs = await import("fs");
    const publicDir = join(process.cwd(), "public");

    if (!existsSync(publicDir)) {
      return [];
    }

    const files = fs.readdirSync(publicDir);
    const siteIds: string[] = [];

    files.forEach((file: string) => {
      // Match your format: favicon-{siteId}.png
      const match = file.match(/^favicon-(.+)\.png$/);
      if (match) {
        siteIds.push(match[1]);
      }
    });

    return siteIds.sort();
  } catch {
    return [];
  }}