// src/components/blog/BlogCard/BlogCardSkeleton.tsx
"use client";

import { cn } from "@/lib/utils/cn";

interface BlogCardSkeletonProps {
  className?: string;
}

/**
 * BlogCardSkeleton Component
 *
 * Loading skeleton for BlogCard
 * Matches the exact structure and styling of BlogCard
 */
export function BlogCardSkeleton({ className }: BlogCardSkeletonProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col mb-5",
        "shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]",
        "animate-pulse",
        className
      )}
    >
      {/* Image skeleton */}
      <div className="relative h-96 rounded-t overflow-hidden bg-gray-300">
        {/* Overlay skeleton */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-5",
            "bg-white/30 backdrop-blur-[11px]",
            "border-t border-white/36"
          )}
        >
          <div className="h-4 bg-gray-400 rounded w-32 mb-2" />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-5 bg-gray-400 rounded-full w-20" />
              <div className="h-4 bg-gray-400 rounded w-16" />
            </div>
            <div className="h-4 bg-gray-400 rounded w-24" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col flex-grow px-3 py-4 rounded-b bg-white">
        {/* Title skeleton */}
        <div className="mb-3">
          <div className="h-6 bg-gray-300 rounded w-full mb-2" />
          <div className="h-6 bg-gray-300 rounded w-3/4" />
        </div>

        {/* Content skeleton */}
        <div className="flex-grow mb-5">
          <div className="h-4 bg-gray-300 rounded w-full mb-2" />
          <div className="h-4 bg-gray-300 rounded w-full mb-2" />
          <div className="h-4 bg-gray-300 rounded w-2/3" />
        </div>

        {/* Read more skeleton */}
        <div className="mt-auto">
          <div className="h-5 bg-primary rounded w-24" />
        </div>
      </div>
    </div>
  );
}
