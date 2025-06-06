// src/components/widgets/HomeLatestBlogs/HomeLatestBlogsSkeleton.tsx
"use client";

import { BlogCardSkeleton } from "@/components/blog/BlogCard/BlogCardSkeleton";
import { cn } from "@/lib/utils/cn";

interface HomeLatestBlogsSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * HomeLatestBlogsSkeleton Component
 *
 * Loading skeleton for HomeLatestBlogs
 */
export function HomeLatestBlogsSkeleton({
  count = 6,
  className,
}: HomeLatestBlogsSkeletonProps) {
  return (
    <section className={cn("py-8 lg:py-12", className)}>
      <div className="xl:container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>

        {/* Button skeleton */}
        <div className="text-center mt-8">
          <div className="inline-block h-12 w-64 bg-gray-300 rounded-lg animate-pulse" />
        </div>
      </div>
    </section>
  );
}
