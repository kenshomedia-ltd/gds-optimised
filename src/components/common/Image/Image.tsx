// src/components/common/Image/Image.tsx
"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { SvgImage } from "./SvgImage";
import type { ImageProps } from "@/types/image.types";
import {
  isSvgUrl,
  isExternalUrl,
  buildImageUrl,
  generateBlurDataURL,
  imageLoader,
} from "@/lib/utils/image";

/**
 * Optimized Image component with AWS Image Handler support
 *
 * Features:
 * - Automatic WebP conversion
 * - Responsive srcset generation
 * - Blur placeholder support
 * - AWS Image Handler integration
 * - SVG pass-through
 * - Lazy loading by default
 * - CWV optimizations
 */
export function Image({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
  priority = false,
  quality = 85,
  sizes,
  placeholder = "blur",
  blurDataURL,
  onLoad,
  onError,
  fill,
  style,
  unoptimized,
  embedSvg = false,
  svgProps,
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [blurUrl, setBlurUrl] = useState<string | undefined>(blurDataURL);

  const isSvg = isSvgUrl(src);
  const isExternal = isExternalUrl(src);

  // Generate blur data URL if needed
  useEffect(() => {
    if (!blurUrl && placeholder === "blur" && width && height && !isSvg) {
      const url = generateBlurDataURL(src, width, height);
      setBlurUrl(url);
    }
  }, [src, width, height, placeholder, blurUrl, isSvg]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setError(true);
    onError?.();
  };

  // For SVGs, use SvgImage component
  if (isSvg) {
    return (
      <SvgImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        embedSvg={embedSvg}
        svgProps={svgProps}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  // Calculate responsive sizes
  const imageSizes =
    sizes || (width ? `(max-width: ${width}px) 100vw, ${width}px` : "100vw");

  // Build optimized URL for non-Next.js optimized images
  const optimizedSrc =
    isExternal && !unoptimized
      ? buildImageUrl(src, { width, height, quality, format: "webp" })
      : src;

  return (
    <div
      className={`relative inline-block ${fill ? "w-full h-full" : ""}`}
      style={
        !fill && width && height
          ? { width, height, maxWidth: "100%" }
          : undefined
      }
    >
      <NextImage
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={imageSizes}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : loading}
        placeholder={
          placeholder === "blur" && blurUrl
            ? "blur"
            : placeholder === "empty"
            ? "empty"
            : undefined
        }
        blurDataURL={blurUrl}
        loader={isExternal ? imageLoader : undefined}
        unoptimized={unoptimized || isSvg}
        className={`
          ${className || ""}
          ${!isLoaded && placeholder === "blur" ? "blur-sm" : ""}
          ${error ? "opacity-50" : ""}
          transition-all duration-300
        `.trim()}
        style={{
          ...style,
          objectFit: style?.objectFit || "cover",
        }}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Loading skeleton */}
      {!isLoaded && placeholder !== "blur" && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          aria-hidden="true"
        />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
