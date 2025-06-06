// src/components/common/Image/ProgressiveImage.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ImageProps } from "@/types/image.types";

interface ProgressiveImageProps extends ImageProps {
  lowQualitySrc?: string;
  aspectRatio?: number;
}

/**
 * ProgressiveImage Component
 *
 * Features:
 * - LQIP (Low Quality Image Placeholder) support
 * - Progressive enhancement with blur-up effect
 * - Intersection Observer for truly lazy loading
 * - Optimized for Core Web Vitals
 * - Native loading="lazy" with IntersectionObserver fallback
 */
export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  sizes,
  lowQualitySrc,
  aspectRatio,
  onLoad,
  onError,
  fill,
  style,
  ...props
}: ProgressiveImageProps) {
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) {
      setIsInView(true);
      return;
    }

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
        // Start loading 50px before the image enters viewport
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [priority]);

  // Load high quality image when in view
  useEffect(() => {
    if (isInView && lowQualitySrc && currentSrc === lowQualitySrc) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
      };
    }
  }, [isInView, src, lowQualitySrc, currentSrc]);

  const handleLoad = () => {
    if (currentSrc === src) {
      setIsLoaded(true);
    }
    onLoad?.();
  };

  const containerClasses = cn(
    "relative overflow-hidden",
    fill ? "absolute inset-0" : "inline-block",
    className
  );

  const imageClasses = cn(
    "transition-all duration-700 ease-in-out",
    !isLoaded && lowQualitySrc ? "blur-lg scale-110" : "blur-0 scale-100"
  );

  // Calculate aspect ratio for container
  const paddingBottom = aspectRatio
    ? `${(1 / aspectRatio) * 100}%`
    : height && width
    ? `${(height / width) * 100}%`
    : undefined;

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={
        !fill && paddingBottom
          ? { paddingBottom, height: 0, width: "100%" }
          : undefined
      }
    >
      {isInView ? (
        <>
          {/* Low quality placeholder */}
          {lowQualitySrc && !isLoaded && (
            <NextImage
              src={lowQualitySrc}
              alt={alt}
              fill={fill}
              width={!fill ? width : undefined}
              height={!fill ? height : undefined}
              quality={10}
              className={cn(imageClasses, "absolute inset-0")}
              style={{ ...style, objectFit: style?.objectFit || "cover" }}
              unoptimized
              aria-hidden="true"
            />
          )}

          {/* High quality image */}
          <NextImage
            src={currentSrc}
            alt={alt}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            sizes={sizes}
            quality={quality}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={imageClasses}
            style={{
              ...style,
              objectFit: style?.objectFit || "cover",
              opacity: isLoaded || !lowQualitySrc ? 1 : 0,
            }}
            onLoad={handleLoad}
            onError={onError}
            {...props}
          />
        </>
      ) : (
        // Placeholder while not in view
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
