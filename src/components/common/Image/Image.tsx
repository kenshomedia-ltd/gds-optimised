// src/components/common/Image/Image.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import NextImage from "next/image";
import DOMPurify from "isomorphic-dompurify";
import type { ImageProps } from "@/types/image.types";
import {
  isSvgUrl,
  isExternalUrl,
  buildImageUrl,
  isLocalImage,
  generateBlurDataURL,
  imageLoader,
  normalizeImageSrc,
} from "@/lib/utils/image";
import { cn } from "@/lib/utils/cn";

// Extended props for the unified component
interface UnifiedImageProps extends ImageProps {
  // Progressive/Lazy loading
  progressive?: boolean;
  lowQualityUrl?: string;
  threshold?: number;
  rootMargin?: string;

  // SVG specific - using more flexible typing
  embedSvg?: boolean;
  svgProps?: React.HTMLAttributes<HTMLDivElement>;

  // LazyImage specific
  fallback?: React.ReactNode;
  onInView?: () => void;
  keepPlaceholder?: boolean;

  // Additional
  responsive?: boolean;
  isLocal?: boolean;
}

/**
 * Unified Image component with all functionality built-in
 *
 * This component consolidates all image functionality into a single, powerful component:
 *
 * Features:
 * - Automatic WebP conversion and optimization
 * - Responsive srcset generation
 * - Blur placeholder support
 * - AWS Image Handler integration
 * - Built-in SVG handling with embedding and sanitization
 * - Progressive loading with LQIP
 * - Intersection Observer lazy loading
 * - Core Web Vitals optimizations
 * - Automatic basePath handling
 * - Error states and fallbacks
 * - Responsive height handling
 *
 * Replaces: Image, LazyImage, and SvgImage components
 */
export function Image({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
  priority = false,
  fetchPriority,
  quality = 85,
  sizes,
  placeholder = "blur",
  blurDataURL,
  onLoad,
  onError,
  fill,
  style,
  unoptimized,

  // Progressive/Lazy loading props
  progressive = false,
  lowQualityUrl,
  threshold = 0.1,
  rootMargin = "50px",

  // SVG specific props
  embedSvg = false,
  svgProps = {},

  // LazyImage specific props
  fallback,
  onInView,
  keepPlaceholder = false,

  // Additional props
  responsive = false,
  isLocal,
}: UnifiedImageProps) {
  // State management
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [blurUrl, setBlurUrl] = useState<string | undefined>(blurDataURL);
  const [isInView, setIsInView] = useState(priority || !progressive);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isSvgLoading, setIsSvgLoading] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Image type detection
  const isSvg = isSvgUrl(src);
  const isExternal = isExternalUrl(src);
  const isLocalFile = isLocal || isLocalImage(src);
  const normalizedSrc = normalizeImageSrc(src);
  const normalizedCurrentSrc = normalizeImageSrc(currentSrc);

  // Event handlers - defined with useCallback to maintain stable references
  const handleLoad = useCallback(() => {
    if (!progressive || currentSrc === src) {
      setIsLoaded(true);
    }
    onLoad?.();
  }, [progressive, currentSrc, src, onLoad]);

  const handleError = useCallback(() => {
    setError(true);
    onError?.();
  }, [onError]);

  // Generate low quality URL for progressive loading
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

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!progressive || priority || !containerRef.current) {
      setIsInView(true);
      return;
    }

    const element = containerRef.current;

    // Fallback for browsers without Intersection Observer
    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      onInView?.();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            onInView?.();
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
  }, [progressive, priority, threshold, rootMargin, onInView]);

  // Load high quality image when in view (progressive loading)
  useEffect(() => {
    if (progressive && isInView && currentSrc !== src && !isSvg) {
      const img = new window.Image();
      img.src = normalizedSrc;
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
      };
    }
  }, [progressive, isInView, currentSrc, src, normalizedSrc, isSvg]);

  // Fetch and embed SVG content if requested
  useEffect(() => {
    if (!embedSvg || !normalizedSrc || !isSvg) return;

    const abortController = new AbortController();

    const fetchSvg = async () => {
      setIsSvgLoading(true);
      setError(false);

      try {
        // Check cache first
        const cacheKey = `svg-${normalizedSrc}`;
        const cached = sessionStorage?.getItem(cacheKey);

        if (cached) {
          setSvgContent(cached);
          setIsSvgLoading(false);
          handleLoad();
          return;
        }

        // Fetch SVG content
        const response = await fetch(normalizedSrc, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.statusText}`);
        }

        const text = await response.text();

        // Sanitize SVG content for security
        const sanitized = DOMPurify.sanitize(text, {
          USE_PROFILES: { svg: true },
          ADD_TAGS: ["svg"],
          ADD_ATTR: [
            "viewBox",
            "fill",
            "stroke",
            "xmlns",
            "width",
            "height",
            "class",
            "style",
          ],
        });

        // Make SVG responsive by removing fixed dimensions and ensuring viewBox
        let responsiveSvg = sanitized;

        // Remove fixed width/height attributes to make it responsive
        responsiveSvg = responsiveSvg.replace(
          /\s*width\s*=\s*["'][^"']*["']/gi,
          ""
        );
        responsiveSvg = responsiveSvg.replace(
          /\s*height\s*=\s*["'][^"']*["']/gi,
          ""
        );

        // Add responsive styling
        responsiveSvg = responsiveSvg.replace(
          /<svg([^>]*)>/i,
          `<svg$1 style="width: 100%; height: 100%; display: block;">`
        );

        // Cache the sanitized SVG
        try {
          sessionStorage?.setItem(cacheKey, responsiveSvg);
        } catch (e) {
          console.error("Error caching SVG:", e);
        }

        setSvgContent(responsiveSvg);
        handleLoad();
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(true);
          handleError();
          console.error("Failed to fetch SVG:", err);
        }
      } finally {
        setIsSvgLoading(false);
      }
    };

    fetchSvg();

    return () => {
      abortController.abort();
    };
  }, [embedSvg, normalizedSrc, isSvg, handleLoad, handleError]);

  // Calculate dimensions and styles
  const placeholderStyle = {
    width: fill ? "100%" : width,
    height: fill ? "100%" : height,
    aspectRatio: width && height && !fill ? `${width} / ${height}` : undefined,
  };

  const imageStyles = {
    ...style,
    ...(responsive && width && height
      ? {
          aspectRatio: `${width} / ${height}`,
          height: "auto",
          maxWidth: "100%",
        }
      : {}),
  };

  const containerClasses = cn(
    "relative flex overflow-hidden",
    fill ? "w-full h-full" : "",
    className
  );

  // SVG rendering with embedded content
  if (embedSvg && isSvg) {
    return (
      <div
        ref={svgContainerRef}
        className={containerClasses}
        style={placeholderStyle}
        {...svgProps}
      >
        {isSvgLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
        )}
        {svgContent && (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }

  // Calculate responsive sizes
  const imageSizes =
    sizes || (width ? `(max-width: ${width}px) 100vw, ${width}px` : "100vw");

  const optimizedSrc =
    isExternal && !unoptimized && !isLocalFile
      ? buildImageUrl(normalizedCurrentSrc, {
          width,
          height,
          quality,
          format: "webp",
        })
      : normalizedCurrentSrc;

  const imageClasses = cn(
    "transition-all duration-300",
    progressive && !isLoaded ? "blur-lg scale-110" : "blur-0 scale-100",
    error ? "opacity-50" : "",
    !isLoaded && placeholder === "blur" && !progressive ? "opacity-0" : "",
    keepPlaceholder && !isLoaded ? "opacity-0" : "opacity-100"
  );

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={placeholderStyle}
    >
      {/* Keep placeholder visible while loading if requested */}
      {keepPlaceholder && !isLoaded && !error && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {fallback || (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
          )}
        </div>
      )}

      {/* Main image */}
      <NextImage
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={imageSizes}
        quality={quality}
        priority={priority}
        fetchPriority={fetchPriority || (priority ? "high" : undefined)}
        placeholder={placeholder === "blur" && blurUrl ? "blur" : "empty"}
        blurDataURL={blurUrl}
        loading={priority ? "eager" : loading}
        loader={
          isExternal && !unoptimized && !isLocalFile ? imageLoader : undefined
        }
        unoptimized={unoptimized || isSvg || isLocalFile}
        className={imageClasses}
        style={imageStyles}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* High quality image overlay for progressive loading */}
      {progressive && isLoaded && currentSrc !== src && (
        <NextImage
          src={normalizedSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={imageSizes}
          quality={quality}
          priority
          fetchPriority={fetchPriority}
          className="absolute inset-0 z-10"
          style={imageStyles}
          onLoad={() => setCurrentSrc(src)}
        />
      )}

      {/* Loading skeleton for non-progressive images */}
      {!progressive &&
        !isLoaded &&
        placeholder !== "blur" &&
        !keepPlaceholder && (
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
