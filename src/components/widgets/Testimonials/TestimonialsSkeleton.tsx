// src/components/widgets/Testimonials/TestimonialsSkeleton.tsx
"use client";

import { cn } from "@/lib/utils/cn";

interface TestimonialsSkeletonProps {
  className?: string;
}

/**
 * TestimonialsSkeleton Component
 *
 * Loading skeleton for Testimonials component
 * Matches the layout and responsive behavior of the actual component
 */
export function TestimonialsSkeleton({ className }: TestimonialsSkeletonProps) {
  return (
    <section
      className={cn(
        "py-12 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white",
        className
      )}
      aria-label="Loading testimonials"
      aria-busy="true"
    >
      <div className="container mx-auto px-4">
        {/* Title Skeleton */}
        <div className="h-8 md:h-10 bg-gray-200 rounded w-64 mx-auto mb-8 md:mb-12 animate-pulse" />

        {/* Cards Skeleton */}
        <div className="flex space-x-6 overflow-hidden">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3"
            >
              <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Logo Skeleton */}
                <div className="h-16 bg-gray-200 rounded mb-4 animate-pulse" />

                {/* Title Skeleton */}
                <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse" />

                {/* Content Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>

                {/* Author Skeleton */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-1 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Skeleton */}
        <div className="flex justify-center mt-6 space-x-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={cn(
                "h-2 rounded-full bg-gray-200 animate-pulse",
                item === 1 ? "w-8" : "w-2"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
