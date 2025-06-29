// src/lib/utils/image.ts

import type {
  ImageTransformParams,
  // ImageHandlerPayload,
  // ImageEdits,
} from "@/types/image.types";

/**
 * Get the configured basePath from Next.js
 * This ensures consistency across the application
 */
export function getBasePath(): string {
  // Access the basePath from Next.js runtime config
  // In production with basePath: '/it', this will be '/it'
  // In development, this will be an empty string
  return process.env.NODE_ENV === "production" ? "/it" : "";
}

/**
 * Prepend basePath to a URL if it's a local relative path
 * This function is specifically designed for image src handling
 *
 * @param url - The URL to prepend basePath to
 * @returns The URL with basePath prepended if applicable
 */
export function withBasePath(url: string): string {
  // Don't modify external URLs or data URLs
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  const basePath = getBasePath();

  // If no basePath is configured, return original URL
  if (!basePath) {
    return url;
  }

  // Don't double-prepend basePath
  if (url.startsWith(basePath + "/") || url === basePath) {
    return url;
  }

  // Ensure URL starts with / and prepend basePath
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  return `${basePath}${normalizedUrl}`;
}

/**
 * Check if the image is a local file (in public folder)
 * Local files are identified by:
 * - Starting with "/" but not containing "http" or "https"
 * - Not containing a domain name (no .com, .net, etc)
 * - Optional: specific prefix like "/images/" or "/assets/"
 */
export function isLocalImage(url: string): boolean {
  if (!url) return false;

  // Check if it starts with / (indicating public folder)
  if (!url.startsWith("/")) return false;

  // Make sure it's not an external URL that happens to have a path
  if (url.includes("http://") || url.includes("https://")) return false;

  // Check it doesn't contain common domain extensions
  const domainExtensions = [".com", ".net", ".org", ".io", ".dev", ".app"];
  if (domainExtensions.some((ext) => url.includes(ext))) return false;

  return true;
}

/**
 * Get the image handler base URL from environment
 */
export function getImageHandlerUrl(): string {
  return (
    process.env.NEXT_PUBLIC_IMAGE_URL || "https://d1ekh99p753u3m.cloudfront.net"
  );
}

/**
 * Check if the URL is an SVG
 */
export function isSvgUrl(url: string): boolean {
  return url.toLowerCase().endsWith(".svg");
}

/**
 * Check if the URL is external
 */
export function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Extract the base path from a URL
 */
export function extractBasePath(src: string): string {
  if (!src) return "";

  // If it's a full URL with .com, extract the path after .com
  if (src.includes(".com")) {
    return src.substring(src.indexOf(".com") + 4);
  }

  // Otherwise return as is
  return src;
}

/**
 * Normalize image src with basePath handling
 * This is the main function that should be used by Image components
 */
export function normalizeImageSrc(src: string): string {
  if (!src) return src;

  // For local images, add basePath
  if (isLocalImage(src)) {
    return withBasePath(src);
  }

  // For external images, return as-is
  return src;
}

/**
 * Build AWS Image Handler URL with transformations
 */
export function buildImageUrl(
  src: string,
  params: ImageTransformParams
): string {
  // Don't transform SVGs
  if (isSvgUrl(src)) return normalizeImageSrc(src);

  // Don't transform local images - just normalize with basePath
  if (isLocalImage(src)) return normalizeImageSrc(src);

  const basePath = extractBasePath(src);
  const imageHandlerUrl = getImageHandlerUrl();
  const imageKey = basePath.startsWith("/") ? basePath.slice(1) : basePath;

  // New AWS URL format using path segments
  const pathSegments = [];

  // Add size segment e.g., "235x244"
  if (params.width && params.height) {
    pathSegments.push(`${params.width}x${params.height}`);
  }

  // Build and add filters segment e.g., "filters:quality(100)"
  const filterOptions = [];
  if (params.quality) {
    filterOptions.push(`quality(${params.quality})`);
  }
  // You can extend this to add other filters here in the future
  // e.g., if (params.format) filterOptions.push(`format(${params.format})`);

  if (filterOptions.length > 0) {
    pathSegments.push(`filters:${filterOptions.join(":")}`);
  }

  // Add the image key
  pathSegments.push(imageKey);

  // Join the base URL and all path segments, filtering out any empty ones
  const finalUrl = [imageHandlerUrl.replace(/\/$/, ""), ...pathSegments]
    .filter(Boolean)
    .join("/");

  return finalUrl;
}

/**
 * Generate a low-quality placeholder URL for blur effect
 */
export function generateBlurDataURL(
  src: string,
  width: number,
  height: number
): string | undefined {
  if (isSvgUrl(src) || isLocalImage(src)) return undefined;

  const placeholderWidth = 40;
  const placeholderHeight = Math.round((placeholderWidth / width) * height);

  return buildImageUrl(src, {
    width: placeholderWidth,
    height: placeholderHeight,
    quality: 10,
    format: "jpeg",
  });
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  src: string,
  width: number,
  height?: number,
  quality: number = 85
): string {
  if (isSvgUrl(src) || isLocalImage(src)) return "";

  const densities = [1, 2];

  return densities
    .map((density) => {
      const url = buildImageUrl(src, {
        width: width * density,
        height: height ? height * density : undefined,
        quality,
        format: "webp",
      });
      return `${url} ${density}x`;
    })
    .join(", ");
}

/**
 * Calculate responsive sizes attribute
 */
export function calculateSizes(width?: number, customSizes?: string): string {
  if (customSizes) return customSizes;
  if (!width) return "100vw";

  return `(max-width: ${width}px) 100vw, ${width}px`;
}

/**
 * Get optimized image loader for Next.js
 */
export function imageLoader({
  src,
  width,
  quality = 85,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // For local images, normalize with basePath and return
  if (isLocalImage(src)) return normalizeImageSrc(src);

  // For remote images, build the URL
  return buildImageUrl(src, { width, quality, format: "webp" });
}
