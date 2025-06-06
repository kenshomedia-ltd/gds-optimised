// src/components/games/GameCard/GameCardSkeleton.tsx
"use client";

import { cn } from "@/lib/utils/cn";

interface GameCardSkeletonProps {
  className?: string;
}

/**
 * GameCardSkeleton Component
 *
 * Loading skeleton for GameCard
 * Matches the exact dimensions and layout of GameCard
 */
export function GameCardSkeleton({ className }: GameCardSkeletonProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg aspect-[235/244] w-full animate-pulse",
        className
      )}
    >
      {/* Image placeholder */}
      <div className="absolute inset-0 bg-gray-200 rounded-lg" />

      {/* Content overlay */}
      <div className="relative h-full rounded-lg flex flex-col justify-between">
        {/* Badge placeholder */}
        <div className="p-2">
          <div className="w-16 h-5 bg-gray-300 rounded-full opacity-50" />
        </div>

        {/* Footer content */}
        <div className="p-2 rounded-b-lg bg-gradient-to-t from-background-900/60 to-transparent">
          {/* Title and favorite button */}
          <div className="flex justify-between items-center mb-0.5">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="w-4 h-4 bg-gray-300 rounded" />
          </div>

          {/* Provider and rating */}
          <div className="flex items-center gap-1">
            <div className="h-3 bg-gray-300 rounded w-16" />
            <div className="h-3 bg-gray-300 rounded w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
