// src/components/ui/QuicklinksCollapsible/QuicklinksCollapsibleSkeleton.tsx
"use client";

import { cn } from "@/lib/utils/cn";

interface QuicklinksCollapsibleSkeletonProps {
  containerClass?: string;
}

/**
 * QuicklinksCollapsibleSkeleton Component
 *
 * Loading skeleton for QuicklinksCollapsible to prevent layout shift
 */
export function QuicklinksCollapsibleSkeleton({
  containerClass,
}: QuicklinksCollapsibleSkeletonProps) {
  return (
    <div className={cn("w-full bg-gray-900 rounded-lg", containerClass)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4">
        <div className="h-7 bg-gray-700 rounded w-24 animate-pulse" />
        <div className="h-5 w-5 bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Content skeleton - showing as open by default */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {/* Left column */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-4/5 animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
          </div>
          {/* Right column */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-4/5 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
