// src/components/common/Image/SvgImage.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import DOMPurify from "isomorphic-dompurify";

interface SvgImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  embedSvg?: boolean;
  svgProps?: React.SVGProps<SVGSVGElement>;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * SVG Image component with optional embedding
 *
 * Features:
 * - Can load SVG as img tag or embed inline
 * - Security sanitization with DOMPurify
 * - Maintains aspect ratio
 * - Supports CSS styling when embedded
 * - Caches fetched SVGs
 */
export function SvgImage({
  src,
  alt,
  width,
  height,
  className,
  embedSvg = false,
  svgProps = {},
  onLoad,
  onError,
}: SvgImageProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);

  // Fetch and embed SVG if embedSvg is true
  useEffect(() => {
    if (!embedSvg || !src) return;

    const abortController = new AbortController();

    const fetchSvg = async () => {
      setIsLoading(true);
      setError(false);

      try {
        // Check cache first
        const cacheKey = `svg-${src}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          setSvgContent(cached);
          setIsLoading(false);
          onLoad?.();
          return;
        }

        // Fetch SVG content
        const response = await fetch(src, {
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
          ],
        });

        // Cache the sanitized SVG
        try {
          sessionStorage.setItem(cacheKey, sanitized);
        } catch (e) {
          // Ignore storage errors
          console.log("Error caching SVG:", e);
        }

        setSvgContent(sanitized);
        onLoad?.();
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(true);
          onError?.();
          console.error("Error loading SVG:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSvg();

    return () => {
      abortController.abort();
    };
  }, [src, embedSvg, onLoad, onError]);

  // Apply SVG props to embedded SVG
  useEffect(() => {
    if (!svgContent || !svgRef.current) return;

    const svgElement = svgRef.current.querySelector("svg");
    if (!svgElement) return;

    // Apply width and height
    if (width) svgElement.setAttribute("width", width.toString());
    if (height) svgElement.setAttribute("height", height.toString());

    // Apply className
    if (className) svgElement.setAttribute("class", className);

    // Apply additional SVG props
    Object.entries(svgProps).forEach(([key, value]) => {
      if (value !== undefined) {
        svgElement.setAttribute(key, value.toString());
      }
    });

    // Ensure proper viewBox for scaling
    if (!svgElement.hasAttribute("viewBox") && width && height) {
      svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
  }, [svgContent, width, height, className, svgProps]);

  // Use Next.js Image for non-embedded SVGs
  if (!embedSvg) {
    return (
      <NextImage
        src={src}
        alt={alt}
        width={width || 24}
        height={height || 24}
        className={className}
        onLoad={onLoad}
        onError={onError}
        loading="lazy"
        unoptimized // SVGs don't need Next.js optimization
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`inline-block bg-gray-200 animate-pulse ${className || ""}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gray-100 text-gray-400 ${
          className || ""
        }`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
    );
  }

  // Embedded SVG
  return (
    <div
      ref={svgRef}
      className="inline-block"
      role="img"
      aria-label={alt}
      dangerouslySetInnerHTML={{ __html: svgContent || "" }}
    />
  );
}
