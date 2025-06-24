// src/components/widgets/HomeLatestBlogs/HomeLatestBlogs.tsx
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { BlogList } from "@/components/blog/BlogList/BlogList";
import { BlogCardSkeleton } from "@/components/blog/BlogCard/BlogCardSkeleton";
import type { HomeLatestBlogsProps } from "@/types/blog.types";
import { cn } from "@/lib/utils/cn";

/**
 * HomeLatestBlogs Component
 *
 * Features:
 * - Displays latest blog posts on homepage
 * - Responsive grid layout
 * - Progressive enhancement with loading states
 * - View all link
 * - SEO optimized
 * - Performance optimized with lazy loading
 */
export function HomeLatestBlogs({
  block,
  blogs,
  translations = {},
  className,
}: HomeLatestBlogsProps) {
  const displayBlogs = blogs.slice(0, block.numOfBlogs || 6);

  return (
    <section className={cn("py-8 lg:py-12", className)}>
      <div className="xl:container mx-auto">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: block.numOfBlogs || 6 }).map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))}
            </div>
          }
        >
          <BlogList blogs={displayBlogs} translations={translations} />
        </Suspense>

        {/* View all link */}
        {block.link && (
          <div className="text-center mt-8">
            <Link
              href={block.link.url}
              className={cn(
                "inline-flex items-center px-8 py-3",
                "bg-primary text-white font-medium rounded-lg",
                "hover:bg-primary/90 transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              )}
              prefetch={false}
            >
              {block.link.label}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
