// src/components/common/Image/Image.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { SvgImage } from "./SvgImage";
import type { ImageProps } from "@/types/image.types";
import {
  isSvgUrl,
  isExternalUrl,
  buildImageUrl,
  isLocalImage,
  generateBlurDataURL,
  imageLoader,
} from "@/lib/utils/image";
import { cn } from "@/lib/utils/cn";

/**
 * Enhanced Image component with optional progressive loading
 *
 * Features:
 * - Automatic WebP conversion
 * - Responsive srcset generation
 * - Blur placeholder support
 * - AWS Image Handler integration
 * - SVG pass-through
 * - Progressive loading with LQIP (opt-in)
 * - Intersection Observer for truly lazy loading
 * - CWV optimizations
 * - Optional responsive height handling
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
  isLocal,
  // New progressive loading props
  progressive = false,
  lowQualityUrl,
  threshold = 0.1,
  rootMargin = "50px",
  // New responsive prop
  responsive = false,
}: ImageProps & { responsive?: boolean; isLocal?: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [blurUrl, setBlurUrl] = useState<string | undefined>(blurDataURL);
  const [isInView, setIsInView] = useState(priority || !progressive);
  const [currentSrc, setCurrentSrc] = useState(src);
  const containerRef = useRef<HTMLDivElement>(null);

  const isSvg = isSvgUrl(src);
  const isExternal = isExternalUrl(src);
   const isLocalFile = isLocal || isLocalImage(src);

  // Generate low quality URL if progressive and not provided
  useEffect(() => {
    if (progressive && !lowQualityUrl && !isSvg && !isLocalFile) {
      const lqUrl = buildImageUrl(src, {
        width: 40,
        height: height && width ? Math.round((40 / width) * height) : undefined,
        quality: 10,
        format: "webp",
      });
      setCurrentSrc(lqUrl);
    }
  }, [progressive, lowQualityUrl, src, width, height, isSvg, isLocalFile]);

  // Generate blur data URL if needed
  useEffect(() => {
    if (
      !blurUrl &&
      placeholder === "blur" &&
      width &&
      height &&
      !isSvg &&
      !isLocalFile
    ) {
      const url = generateBlurDataURL(src, width, height);
      setBlurUrl(url);
    }
  }, [src, width, height, placeholder, blurUrl, isSvg, isLocalFile]);

  // Intersection Observer for progressive loading
  useEffect(() => {
    if (!progressive || priority || !containerRef.current) {
      setIsInView(true);
      return;
    }

    const element = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [progressive, priority, threshold, rootMargin]);

  // Load high quality image when in view (for progressive loading)
  useEffect(() => {
    if (progressive && isInView && currentSrc !== src) {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
      };
    }
  }, [progressive, isInView, currentSrc, src]);

  // Handle image load
  const handleLoad = () => {
    if (!progressive || currentSrc === src) {
      setIsLoaded(true);
    }
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
    isExternal && !unoptimized && !isLocalFile
      ? buildImageUrl(currentSrc, { width, height, quality, format: "webp" })
      : currentSrc;

  const containerClasses = cn(
    "relative flex overflow-hidden",
    fill ? "w-full h-full" : "",
    className
  );

  const imageClasses = cn(
    "transition-all duration-300",
    progressive && !isLoaded ? "blur-lg scale-110" : "blur-0 scale-100",
    error ? "opacity-50" : "",
    !isLoaded && placeholder === "blur" && !progressive ? "blur-sm" : ""
  );

  // Determine container styles based on responsive prop
  const containerStyles =
    !fill && width && height
      ? responsive
        ? {
            width: "100%",
            maxWidth: width,
            aspectRatio: `${width} / ${height}`,
          }
        : {
            width,
            height,
            maxWidth: "100%",
          }
      : undefined;

  // Build image styles - FIXED: Don't set height when fill is true
  const imageStyles = (() => {
    const baseStyles = {
      ...style,
      objectFit: style?.objectFit || "cover",
    };

    // If fill is true, don't set width or height
    if (fill) {
      return baseStyles;
    }

    // If responsive is true, use responsive width/height
    if (responsive) {
      return {
        ...baseStyles,
        width: "100%",
        height: "auto",
      };
    }

    // Otherwise, use default Next.js Image behavior
    return baseStyles;
  })();

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={containerStyles}
    >
      {!progressive || isInView ? (
        <>
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
              placeholder === "blur" && blurUrl && !progressive
                ? "blur"
                : placeholder === "empty"
                ? "empty"
                : undefined
            }
            blurDataURL={blurUrl}
            loader={isExternal ? imageLoader : undefined}
            unoptimized={unoptimized || isSvg || isLocalFile}
            className={imageClasses}
            style={imageStyles}
            onLoad={handleLoad}
            onError={handleError}
          />

          {/* High quality image overlay for progressive loading */}
          {progressive && isLoaded && currentSrc !== src && (
            <NextImage
              src={src}
              alt={alt}
              width={fill ? undefined : width}
              height={fill ? undefined : height}
              fill={fill}
              sizes={imageSizes}
              quality={quality}
              priority
              className="absolute inset-0 z-10"
              style={imageStyles}
              onLoad={() => setCurrentSrc(src)}
            />
          )}
        </>
      ) : (
        // Placeholder while not in view
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton for non-progressive images */}
      {!progressive && !isLoaded && placeholder !== "blur" && (
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
