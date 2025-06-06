// src/components/common/Image/LazyImage.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Image } from "./Image";
import type { ImageProps } from "@/types/image.types";

interface LazyImageProps extends ImageProps {
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  onInView?: () => void;
  keepPlaceholder?: boolean;
}

/**
 * LazyImage component with Intersection Observer
 *
 * Features:
 * - True lazy loading with Intersection Observer
 * - Progressive enhancement
 * - Smooth transitions between states
 * - Fallback support
 * - Automatic cleanup
 * - Optional placeholder retention during load
 */
export function LazyImage({
  threshold = 0.1,
  rootMargin = "50px",
  fallback,
  onInView,
  keepPlaceholder = false,
  ...imageProps
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up Intersection Observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if Intersection Observer is supported
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

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, onInView]);

  // Handle successful image load
  const handleLoad = useCallback(() => {
    setHasLoaded(true);
    setHasError(false);
    imageProps.onLoad?.();
  }, [imageProps.onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    setHasLoaded(false);
    imageProps.onError?.();
  }, [imageProps.onError]);

  // Calculate dimensions for placeholder
  const placeholderStyle = {
    width: imageProps.fill ? "100%" : imageProps.width,
    height: imageProps.fill ? "100%" : imageProps.height,
    aspectRatio:
      imageProps.width && imageProps.height && !imageProps.fill
        ? `${imageProps.width} / ${imageProps.height}`
        : undefined,
  };

  // Render placeholder before in view
  if (!isInView) {
    return (
      <div
        ref={containerRef}
        className={`relative ${imageProps.className || ""}`}
        style={placeholderStyle}
        aria-hidden="true"
      >
        {fallback || (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative" style={placeholderStyle}>
      {/* Show placeholder while loading if keepPlaceholder is true */}
      {keepPlaceholder && !hasLoaded && !hasError && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {fallback || (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
          )}
        </div>
      )}

      {/* The actual image */}
      <Image
        {...imageProps}
        alt={imageProps.alt || ""}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        priority={false}
        className={`
          ${imageProps.className || ""}
          ${!hasLoaded && keepPlaceholder ? "opacity-0" : "opacity-100"}
          transition-opacity duration-300
        `.trim()}
      />

      {/* Error state overlay */}
      {hasError && (
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
