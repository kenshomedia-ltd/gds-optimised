// src/lib/utils/url-normalization.ts

/**
 * URL Normalization Utilities
 *
 * Handles common URL normalization issues in Next.js applications,
 * particularly with base paths and relative URLs.
 */

/**
 * Get the configured base path from environment or default
 */
export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || "/it";
}

/**
 * Get the site URL from environment
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
}

/**
 * Check if a URL is external (absolute URL)
 * @param url - URL to check
 * @returns True if external, false if internal
 */
export function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Check if a URL is a root path
 * @param url - URL to check
 * @returns True if root path
 */
export function isRootPath(url: string): boolean {
  return url === "/" || url === "";
}

/**
 * Remove base path from URL if present
 * @param url - URL to process
 * @param basePath - Base path to remove (optional, defaults to env var)
 * @returns URL without base path
 */
export function removeBasePath(url: string, basePath?: string): string {
  const currentBasePath = basePath || getBasePath();

  if (url.startsWith(currentBasePath)) {
    const result = url.slice(currentBasePath.length) || "/";
    return result;
  }

  return url;
}

/**
 * Add base path to URL if not present
 * @param url - URL to process
 * @param basePath - Base path to add (optional, defaults to env var)
 * @returns URL with base path
 */
export function addBasePath(url: string, basePath?: string): string {
  const currentBasePath = basePath || getBasePath();

  // Don't add base path to external URLs or if already present
  if (isExternalUrl(url) || url.startsWith(currentBasePath)) {
    return url;
  }

  // Handle root path
  if (isRootPath(url)) {
    return currentBasePath;
  }

  // Ensure URL starts with /
  const normalizedUrl = url.startsWith("/") ? url : "/" + url;

  return currentBasePath + normalizedUrl;
}

/**
 * Normalize internal URL for Next.js Link component
 * Prevents issues like "/it/it" when users input relative paths
 * @param url - URL to normalize
 * @returns Clean internal URL path
 */
export function normalizeInternalUrl(url: string): string {
  // External URLs pass through unchanged
  if (isExternalUrl(url)) {
    return url;
  }

  // Handle root path
  if (isRootPath(url)) {
    return "/";
  }

  let normalizedUrl = url;
  const basePath = getBasePath();

  // Remove leading slash for processing
  if (normalizedUrl.startsWith("/")) {
    normalizedUrl = normalizedUrl.slice(1);
  }

  // Remove base path if it's duplicated
  // This prevents "/it/it" scenarios
  const basePathSegment = basePath.slice(1); // Remove leading slash from base path
  if (normalizedUrl.startsWith(basePathSegment)) {
    normalizedUrl = normalizedUrl.slice(basePathSegment.length);

    // Handle edge case where removing base path results in empty string
    if (!normalizedUrl || normalizedUrl.startsWith("/")) {
      normalizedUrl = normalizedUrl || "/";
    } else {
      normalizedUrl = "/" + normalizedUrl;
    }
  } else {
    // Ensure URL starts with forward slash
    normalizedUrl = "/" + normalizedUrl;
  }

  return normalizedUrl;
}

/**
 * Normalize URL for structured data and SEO
 * Combines with site URL to create absolute URLs
 * @param url - URL to normalize
 * @param siteUrl - Site base URL (optional, defaults to env var)
 * @returns Absolute URL for structured data
 */
export function normalizeStructuredDataUrl(
  url: string,
  siteUrl?: string
): string {
  const currentSiteUrl = (siteUrl || getSiteUrl()).replace(/\/$/, "");

  // External URLs pass through unchanged
  if (isExternalUrl(url)) {
    return url;
  }

  // Handle root path
  if (isRootPath(url)) {
    return currentSiteUrl;
  }

  // Normalize the internal URL first
  const normalizedPath = normalizeInternalUrl(url);

  // Combine with site URL
  return `${currentSiteUrl}${normalizedPath}`;
}

/**
 * Clean and validate breadcrumb URL
 * @param url - Raw URL from data source
 * @returns Clean, validated URL
 */
export function cleanBreadcrumbUrl(
  url: string | null | undefined
): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Trim whitespace
  const cleanUrl = url.trim();

  if (!cleanUrl) {
    return null;
  }

  // Return the cleaned URL
  return cleanUrl;
}

/**
 * Validate and normalize a collection of breadcrumb items
 * @param items - Array of breadcrumb items
 * @returns Validated and normalized breadcrumb items
 */
export function normalizeBreadcrumbItems(
  items: Array<{
    breadCrumbText: string;
    breadCrumbUrl?: string | null | undefined;
  }>
): Array<{ breadCrumbText: string; breadCrumbUrl?: string | null }> {
  return items
    .filter((item) => item.breadCrumbText && item.breadCrumbText.trim())
    .map((item) => ({
      breadCrumbText: item.breadCrumbText.trim(),
      breadCrumbUrl: cleanBreadcrumbUrl(item.breadCrumbUrl),
    }));
}

/**
 * Debug URL normalization - useful for development
 * @param url - URL to debug
 * @param context - Context string for debugging
 */
export function debugUrlNormalization(
  url: string,
  context: string = "URL"
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.group(`🔗 ${context} Normalization Debug`);
  console.log("Original URL:", url);
  console.log("Is External:", isExternalUrl(url));
  console.log("Is Root:", isRootPath(url));
  console.log("Base Path:", getBasePath());
  console.log("Site URL:", getSiteUrl());
  console.log("Normalized Internal:", normalizeInternalUrl(url));
  console.log("Normalized Structured Data:", normalizeStructuredDataUrl(url));
  console.groupEnd();
}

/**
 * Common URL patterns that might cause issues
 */
export const PROBLEMATIC_URL_PATTERNS = {
  DOUBLE_BASE_PATH: /^\/it\/it/,
  MISSING_LEADING_SLASH: /^[^\/http]/,
  TRAILING_SLASH_ONLY: /^\/+$/,
  MULTIPLE_SLASHES: /\/\/+/,
} as const;

/**
 * Detect problematic URL patterns
 * @param url - URL to check
 * @returns Array of detected issues
 */
export function detectUrlIssues(url: string): string[] {
  const issues: string[] = [];

  if (PROBLEMATIC_URL_PATTERNS.DOUBLE_BASE_PATH.test(url)) {
    issues.push("Double base path detected");
  }

  if (PROBLEMATIC_URL_PATTERNS.MULTIPLE_SLASHES.test(url)) {
    issues.push("Multiple consecutive slashes detected");
  }

  if (
    !isExternalUrl(url) &&
    PROBLEMATIC_URL_PATTERNS.MISSING_LEADING_SLASH.test(url)
  ) {
    issues.push("Missing leading slash on internal URL");
  }

  if (PROBLEMATIC_URL_PATTERNS.TRAILING_SLASH_ONLY.test(url) && url !== "/") {
    issues.push("URL consists only of slashes");
  }

  return issues;
}

/**
 * Comprehensive URL sanitization
 * @param url - URL to sanitize
 * @returns Sanitized URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "/";
  }

  let sanitized = url.trim();

  // Remove multiple consecutive slashes
  sanitized = sanitized.replace(PROBLEMATIC_URL_PATTERNS.MULTIPLE_SLASHES, "/");

  // Handle edge cases
  if (
    !sanitized ||
    sanitized === "//" ||
    PROBLEMATIC_URL_PATTERNS.TRAILING_SLASH_ONLY.test(sanitized)
  ) {
    return "/";
  }

  return sanitized;
}
