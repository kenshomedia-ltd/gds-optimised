// src/components/author/AuthorBlogList/AuthorBlogList.tsx
"use client";

import { useState, useCallback } from "react";
import { BlogCard } from "@/components/blog/BlogCard/BlogCard";
import { BlogCardSkeleton } from "@/components/blog/BlogCard/BlogCardSkeleton";
import { getAuthorBlogs } from "@/app/actions/authors";
import type { BlogData } from "@/types/blog.types";
import { cn } from "@/lib/utils/cn";

interface AuthorBlogListProps {
  authorId: number;
  initialBlogs: BlogData[];
  totalBlogs: number;
  translations?: Record<string, string>;
  className?: string;
}

/**
 * AuthorBlogList Component
 *
 * Displays blogs written by an author with load more functionality
 */
export function AuthorBlogList({
  authorId,
  initialBlogs,
  totalBlogs,
  translations = {},
  className,
}: AuthorBlogListProps) {
  const [blogs, setBlogs] = useState<BlogData[]>(initialBlogs);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(totalBlogs > initialBlogs.length);

  const loadMoreBlogs = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const { blogs: newBlogs, pagination } = await getAuthorBlogs(
        authorId,
        nextPage,
        6
      );

      if (newBlogs.length > 0) {
        setBlogs((prev) => [...prev, ...newBlogs]);
        setPage(nextPage);
        setHasMore(blogs.length + newBlogs.length < pagination.total);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more blogs:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [authorId, page, blogs.length, loading, hasMore]);

  return (
    <div className={cn("w-full", className)}>
      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog, index) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            translations={translations}
            priority={index < 3}
            index={index}
          />
        ))}

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <BlogCardSkeleton key={`skeleton-${index}`} />
          ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreBlogs}
            disabled={loading}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              "bg-primary text-white hover:bg-primary-shade",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              loading && "animate-pulse"
            )}
          >
            {loading
              ? translations.loading || "Loading..."
              : translations.loadMoreArticles || "Load More Articles"}
          </button>
        </div>
      )}
    </div>
  );
}
