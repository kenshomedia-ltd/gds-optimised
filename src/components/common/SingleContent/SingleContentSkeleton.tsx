// src/components/common/SingleContent/SingleContentSkeleton.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import type { SingleContentSkeletonProps } from "@/types/single-content.types";

/**
 * SingleContentSkeleton Component
 *
 * Loading skeleton for SingleContent component
 * Features:
 * - Matches the content structure with title and paragraphs
 * - Smooth pulse animation
 * - Accessible with proper ARIA labels
 */
export function SingleContentSkeleton({
  className,
}: SingleContentSkeletonProps) {
  return (
    <div
      className={cn(
        "single-content-skeleton",
        "animate-pulse",
        "min-h-[200px]",
        className
      )}
      role="status"
      aria-label="Loading content"
    >
      {/* Title skeleton */}
      <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-4" />

      {/* Paragraph skeletons */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>

      {/* Another paragraph */}
      <div className="space-y-3 mt-6">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>

      {/* Screen reader only text */}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}
