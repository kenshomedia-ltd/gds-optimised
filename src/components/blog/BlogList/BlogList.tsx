// src/components/blog/BlogList/BlogList.tsx

import { BlogCard } from "../BlogCard/BlogCard";
import type { BlogListProps } from "@/types/blog.types";
import { cn } from "@/lib/utils/cn";

/**
 * BlogList Component
 *
 * Features:
 * - Server-side rendered for better performance
 * - Responsive grid layout
 * - Progressive loading
 * - Optimized rendering
 */
export function BlogList({
  blogs,
  translations = {},
  className,
}: BlogListProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {blogs.map((blog, index) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          translations={translations}
          priority={index < 3} // Prioritize first 3 cards for LCP
          index={index}
        />
      ))}
    </div>
  );
}
