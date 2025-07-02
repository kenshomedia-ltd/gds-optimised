// src/components/widgets/GameListWidget/MobileGameFiltersSkeleton.tsx
"use client";

import { cn } from "@/lib/utils/cn";

interface MobileGameFiltersSkeletonProps {
  className?: string;
}

/**
 * MobileGameFiltersSkeleton Component
 *
 * Skeleton loader for the mobile game filters to prevent layout shift
 * Matches the exact height and layout of the actual mobile filters
 */
export function MobileGameFiltersSkeleton({
  className,
}: MobileGameFiltersSkeletonProps) {
  return (
    <div className={cn("mobile-filters-skeleton", className)}>
      {/* Top Menu Bar Skeleton - matches mobile filter layout */}
      <div className="flex gap-2 p-4 bg-gray-800">
        {/* Filter Button Skeleton - 50% width */}
        <div className="w-1/2 h-12 bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded animate-pulse" />
            <div className="w-12 h-4 bg-gray-600 rounded animate-pulse" />
          </div>
        </div>

        {/* Sort Button Skeleton - 50% width */}
        <div className="w-1/2 h-12 bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-16 h-4 bg-gray-600 rounded animate-pulse" />
            <div className="w-4 h-4 bg-gray-600 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
