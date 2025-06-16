// src/components/widgets/GameListWidget/GameFiltersSkeleton.tsx
"use client";

import { cn } from "@/lib/utils/cn";

interface GameFiltersSkeletonProps {
  className?: string;
}

/**
 * GameFiltersSkeleton Component
 *
 * Skeleton loader for the game filters to prevent layout shift
 * Matches the exact height and layout of the actual filters
 */
export function GameFiltersSkeleton({ className }: GameFiltersSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter Icon and Label Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        </div>

        {/* Sort Dropdown Skeleton */}
        <div className="h-10 w-40 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />

        {/* Provider Filter Skeleton */}
        <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />

        {/* Category Filter Skeleton */}
        <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
