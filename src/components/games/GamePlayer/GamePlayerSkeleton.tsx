// src/components/games/GamePlayer/GamePlayerSkeleton.tsx

import { Skeleton } from "@/components/ui/Skeleton";

/**
 * GamePlayerSkeleton Component
 *
 * Loading skeleton for the GamePlayer component
 */
export function GamePlayerSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Game Container Skeleton */}
      <div className="relative bg-background-800 rounded-lg overflow-hidden aspect-video">
        <Skeleton className="absolute inset-0" />

        {/* Play Button Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-6 w-32 mx-auto mb-6" />
            <Skeleton className="h-12 w-32 mx-auto rounded-lg" />
          </div>
        </div>
      </div>

      {/* Control Bar Skeleton */}
      <div className="mt-4 bg-background-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Skeleton className="h-6 w-32 hidden md:block" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
