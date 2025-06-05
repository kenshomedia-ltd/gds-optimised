// src/lib/utils/image.ts

import type {
  ImageTransformParams,
  ImageHandlerPayload,
  ImageEdits,
} from "@/types/image.types";

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
 * Build AWS Image Handler URL with transformations
 */
export function buildImageUrl(
  src: string,
  params: ImageTransformParams
): string {
  // Don't transform SVGs
  if (isSvgUrl(src)) return src;

  const basePath = extractBasePath(src);
  const imageHandlerUrl = getImageHandlerUrl();

  // Build edits object
  const edits: ImageEdits = {
    resize: {
      width: params.width,
      height: params.height,
      fit: params.fit || "cover",
      withoutEnlargement: true,
    },
  };

  // Add format conversion if specified
  if (params.format && params.format !== "auto") {
    edits.toFormat = params.format;
  }

  // Add quality settings
  if (params.quality) {
    if (params.format === "webp" || !params.format) {
      edits.webp = { quality: params.quality };
    } else {
      edits.jpeg = { quality: params.quality };
    }
  }

  // Build the payload
  const payload: ImageHandlerPayload = {
    bucket: "giochigatsby",
    key: basePath.startsWith("/") ? basePath.slice(1) : basePath,
    edits,
  };

  // Encode the payload as base64
  const encodedPayload = btoa(JSON.stringify(payload));

  return `${imageHandlerUrl}/${encodedPayload}`;
}

/**
 * Generate a low-quality placeholder URL for blur effect
 */
export function generateBlurDataURL(
  src: string,
  width: number,
  height: number
): string | undefined {
  if (isSvgUrl(src)) return undefined;

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
  if (isSvgUrl(src)) return "";

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
  return buildImageUrl(src, { width, quality, format: "webp" });
}
