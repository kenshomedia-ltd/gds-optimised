// src/lib/utils/favicon.ts

import { existsSync } from "fs";
import { join } from "path";

/**
 * Favicon size configurations for different devices and platforms
 */
const FAVICON_SIZES = [
  { size: "16x16", type: "image/png" },
  { size: "32x32", type: "image/png" },
  { size: "48x48", type: "image/png" },
  { size: "96x96", type: "image/png" },
  { size: "192x192", type: "image/png" },
  { size: "512x512", type: "image/png" },
] as const;

/**
 * Apple-specific icon sizes
 */
const APPLE_ICON_SIZES = [
  "57x57",
  "60x60",
  "72x72",
  "76x76",
  "114x114",
  "120x120",
  "144x144",
  "152x152",
  "180x180",
] as const;

/**
 * Get the favicon file path for a specific site
 * @param siteId - The site identifier (e.g., 'gds', 'csi')
 * @param filename - The favicon filename (e.g., 'favicon.ico', 'favicon-32x32.png')
 * @returns The path to the favicon file
 */
export function getFaviconPath(siteId: string, filename: string): string {
  const faviconPath = `/favicon/favicon-${siteId}-${filename}`;

  // In development or server-side, we can't check file existence
  // Return the expected path and let the browser handle 404s gracefully
  if (typeof window === "undefined") {
    return faviconPath;
  }

  return faviconPath;
}

/**
 * Check if a favicon file exists (server-side only)
 * @param siteId - The site identifier
 * @param filename - The favicon filename
 * @returns True if the file exists, false otherwise
 */
export function faviconExists(siteId: string, filename: string): boolean {
  if (typeof window !== "undefined") {
    // Can't check file existence on client-side
    return true;
  }

  try {
    const publicDir = join(process.cwd(), "public");
    const faviconPath = join(
      publicDir,
      "favicon",
      `favicon-${siteId}-${filename}`
    );
    return existsSync(faviconPath);
  } catch {
    return false;
  }
}

/**
 * Generate favicon link objects for Next.js metadata
 * @param siteId - The site identifier
 * @returns Array of favicon link objects for Next.js metadata
 */
export function generateFaviconLinks(siteId: string) {
  const icons: Array<{
    rel?: string;
    url: string;
    sizes?: string;
    type?: string;
  }> = [];

  // Standard favicon sizes
  FAVICON_SIZES.forEach(({ size, type }) => {
    const filename = size === "16x16" ? "favicon.png" : `favicon-${size}.png`;
    icons.push({
      rel: "icon",
      url: getFaviconPath(siteId, filename),
      sizes: size,
      type,
    });
  });

  // Apple Touch Icons
  APPLE_ICON_SIZES.forEach((size) => {
    icons.push({
      rel: "apple-touch-icon",
      url: getFaviconPath(siteId, `apple-touch-icon-${size}.png`),
      sizes: size,
    });
  });

  // Default apple-touch-icon (180x180)
  icons.push({
    rel: "apple-touch-icon",
    url: getFaviconPath(siteId, "apple-touch-icon.png"),
  });

  // Mask icon for Safari
  icons.push({
    rel: "mask-icon",
    url: getFaviconPath(siteId, "safari-pinned-tab.svg"),
  });

  return icons;
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
        src: getFaviconPath(siteId, "favicon-192x192.png"),
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: getFaviconPath(siteId, "favicon-512x512.png"),
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: getFaviconPath(siteId, "favicon-512x512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

/**
 * Expected favicon file structure for each site:
 *
 * public/
 * └── favicon/
 *     ├── favicon-{SITE_ID}-favicon.ico
 *     ├── favicon-{SITE_ID}-favicon.png (16x16)
 *     ├── favicon-{SITE_ID}-favicon-32x32.png
 *     ├── favicon-{SITE_ID}-favicon-48x48.png
 *     ├── favicon-{SITE_ID}-favicon-96x96.png
 *     ├── favicon-{SITE_ID}-favicon-192x192.png
 *     ├── favicon-{SITE_ID}-favicon-512x512.png
 *     ├── favicon-{SITE_ID}-apple-touch-icon.png (180x180)
 *     ├── favicon-{SITE_ID}-apple-touch-icon-57x57.png
 *     ├── favicon-{SITE_ID}-apple-touch-icon-60x60.png
 *     ├── favicon-{SITE_ID}-apple-touch-icon-72x72.png
 *     ├── favicon-{SITE_ID}-apple-touch-icon-76x76.png
 *     ├── favicon-{SITE_ID}-apple-touch-icon-114x114.png
 *     ├── favicon-{SITE_ID}-apple-touch-icon-120x120.png
 *     ├── favicon-{SITE_ID}-apple-touch-icon-144x144.png
 *     ├── favicon-{SITE_ID}-apple-touch-icon-152x152.png
 *     ├── favicon-{SITE_ID}-apple-touch-icon-180x180.png
 *     ├── favicon-{SITE_ID}-safari-pinned-tab.svg
 *     └── favicon-{SITE_ID}-site.webmanifest
 *
 * Examples:
 * - favicon-gds-favicon.ico
 * - favicon-csi-favicon-32x32.png
 * - favicon-default-apple-touch-icon.png (fallback)
 */

/**
 * Utility to validate required favicon files for a site
 * @param siteId - The site identifier
 * @returns Object with validation results
 */
export function validateSiteFavicons(siteId: string) {
  const requiredFiles = [
    "favicon.ico",
    "favicon.png",
    "favicon-32x32.png",
    "apple-touch-icon.png",
  ];

  const results = {
    siteId,
    valid: true,
    missing: [] as string[],
    existing: [] as string[],
  };

  requiredFiles.forEach((filename) => {
    if (faviconExists(siteId, filename)) {
      results.existing.push(filename);
    } else {
      results.missing.push(filename);
      results.valid = false;
    }
  });

  return results;
}

/**
 * Development helper to generate the required favicon file list
 * @param siteId - The site identifier
 * @returns Array of expected favicon filenames
 */
export function getExpectedFaviconFiles(siteId: string): string[] {
  const files: string[] = [];

  // Standard favicons
  files.push(`favicon-${siteId}-favicon.ico`);
  FAVICON_SIZES.forEach(({ size }) => {
    const filename = size === "16x16" ? "favicon.png" : `favicon-${size}.png`;
    files.push(`favicon-${siteId}-${filename}`);
  });

  // Apple icons
  files.push(`favicon-${siteId}-apple-touch-icon.png`);
  APPLE_ICON_SIZES.forEach((size) => {
    files.push(`favicon-${siteId}-apple-touch-icon-${size}.png`);
  });

  // Additional files
  files.push(`favicon-${siteId}-safari-pinned-tab.svg`);
  files.push(`favicon-${siteId}-site.webmanifest`);

  return files.sort();
}
