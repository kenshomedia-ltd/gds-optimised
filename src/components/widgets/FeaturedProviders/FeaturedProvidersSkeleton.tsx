// src/components/widgets/FeaturedProviders/FeaturedProvidersSkeleton.tsx
"use client";

// import { cn } from "@/lib/utils/cn";

/**
 * FeaturedProvidersSkeleton Component
 *
 * Loading skeleton for FeaturedProviders
 */
export function FeaturedProvidersSkeleton() {
  return (
    <div className="relative flex flex-col justify-center items-center gap-10 xl:container z-10 px-4 py-8">
      {/* Title skeleton */}
      <div className="h-8 w-64 bg-gray-700 rounded animate-pulse mt-10" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3 w-full max-w-7xl">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className="bg-white/20 rounded-lg h-10 animate-pulse"
          />
        ))}
      </div>

      {/* Button skeleton */}
      <div className="h-12 w-48 bg-white/20 rounded-full animate-pulse mt-6" />
    </div>
  );
}
