// src/components/widgets/CasinoList/MobileCasinoFiltersSkeleton.tsx
"use client";

import { cn } from "@/lib/utils/cn";

interface MobileCasinoFiltersSkeletonProps {
  className?: string;
}

/**
 * MobileCasinoFiltersSkeleton Component
 *
 * Skeleton loader for the mobile casino filters to prevent layout shift
 * Matches the exact height and layout of the actual mobile filters
 */
export function MobileCasinoFiltersSkeleton({
  className,
}: MobileCasinoFiltersSkeletonProps) {
  return (
    <div className={cn("mobile-casino-filters-skeleton", className)}>
      {/* Top Menu Bar Skeleton - matches mobile casino filter layout */}
      <div className="flex gap-2 p-4 bg-white/30 rounded-lg backdrop-blur-sm">
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
            <div className="w-20 h-4 bg-gray-600 rounded animate-pulse" />
            <div className="w-4 h-4 bg-gray-600 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
