// src/components/blog/BlogCard/BlogCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Image } from "@/components/common/Image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type { BlogCardProps } from "@/types/blog.types";
import { cn } from "@/lib/utils/cn";

/**
 * BlogCard Component
 *
 * Features:
 * - Responsive card layout with image overlay
 * - Author and category metadata
 * - Reading time indicator
 * - Optimized image loading with blur placeholder
 * - Hover effects
 * - Accessibility compliant
 * - Date formatting
 * - Content excerpt with HTML stripping
 */
export function BlogCard({
  blog,
  translations = {},
  isFeatured = false,
  priority = false,
  className,
  index = 0,
}: BlogCardProps) {
  const [imageError, setImageError] = useState(false);

  // Extract blog data
  const {
    title,
    slug,
    content1 = "",
    blogBrief = "",
    createdAt,
    minutesRead,
    images,
    author,
    blogCategory,
  } = blog;

  // Get excerpt from content1 or blogBrief
  const getExcerpt = (content: string, maxLength: number = 150): string => {
    // Strip HTML tags
    const stripped = content.replace(/<[^>]*>/g, "");
    // Truncate and add ellipsis
    return stripped.length > maxLength
      ? stripped.substring(0, maxLength).trim() + "..."
      : stripped;
  };

  const excerpt = getExcerpt(content1 || blogBrief);

  // Format date
  const formatDate = (
    date: string
  ): { day: string; month: string; year: string } => {
    const dateObj = new Date(date);
    return {
      day: dateObj.getDate().toString(),
      month: dateObj.toLocaleDateString("en", { month: "short" }),
      year: dateObj.getFullYear().toString(),
    };
  };

  const { day, month, year } = formatDate(createdAt);

  // Generate URLs
  const blogUrl = `/blog/${slug}/`;
  const authorSlug = author
    ? `${author.firstName.toLowerCase()}.${author.lastName.toLowerCase()}`
    : "";
  const authorUrl = authorSlug ? `/author/${authorSlug}/` : "#";
  const categoryUrl = blogCategory?.slug
    ? `/blog/category/${blogCategory.slug}/`
    : "#";

  return (
    <article
      className={cn(
        "group relative flex flex-col mb-5",
        "shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]",
        "hover:shadow-[0px_1px_35px_0px_rgba(0,0,0,0.2)]",
        "transition-all duration-300",
        "rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Image container with overlay */}
      <div className="relative h-96 rounded-t overflow-hidden bg-blue-900">
        <figure className="h-full m-0 p-0 overflow-hidden">
          {!imageError && images?.url ? (
            <Image
              src={images.url}
              alt={images.alternativeText || title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
              quality={80}
              className={cn(
                "object-cover opacity-90",
                "transition-all duration-300",
                "group-hover:opacity-70 group-hover:scale-110"
              )}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </figure>

        {/* Overlay with metadata */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-5",
            "text-white text-sm",
            "backdrop-blur-[11px] bg-white/30",
            "border-t border-white/36"
          )}
        >
          {/* Author name */}
          {author && (
            <div className="mb-2">
              <Link
                href={authorUrl}
                className="hover:text-secondary-tint transition-colors"
                prefetch={false}
              >
                {author.firstName} {author.lastName}
              </Link>
            </div>
          )}

          {/* Category, read time, and date */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {blogCategory && (
                <Link
                  href={categoryUrl}
                  className="inline-block"
                  prefetch={false}
                >
                  <span
                    className={cn(
                      "inline-block text-[10px] text-white font-bold",
                      "rounded-full px-1.5 py-0.5",
                      "bg-gradient-to-b from-accent-500 to-accent-700",
                      "shadow-[0px_2px_8px_rgba(0,188,212,0.4)]"
                    )}
                  >
                    {blogCategory.blogCategory ||
                      translations.general ||
                      "General"}
                  </span>
                </Link>
              )}
              {minutesRead && (
                <span>
                  {minutesRead} {translations.minsRead || "mins read"}
                </span>
              )}
            </div>
            <time dateTime={createdAt}>
              {day} {month}, {year}
            </time>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div
        className={cn(
          "flex flex-col flex-grow px-3 py-4 rounded-b",
          isFeatured ? "bg-primary text-white" : "bg-white"
        )}
      >
        <h4 className="mb-3">
          <Link
            href={blogUrl}
            className={cn(
              "text-xl font-bold line-clamp-2 no-underline transition-colors",
              isFeatured
                ? "text-white hover:text-secondary-tint"
                : "text-black hover:text-primary"
            )}
            prefetch={false}
          >
            {title}
          </Link>
        </h4>

        <div
          className={cn(
            "flex-grow mb-5",
            isFeatured ? "text-grey-300" : "text-body-text"
          )}
        >
          <p className="line-clamp-3 m-0">{excerpt}</p>
        </div>

        <div className="mt-auto">
          <Link
            href={blogUrl}
            className={cn(
              "inline-flex items-center gap-1 font-medium transition-colors",
              isFeatured
                ? "text-secondary hover:text-secondary-tint"
                : "text-primary hover:text-blue-700"
            )}
            prefetch={false}
          >
            {translations.readMore || "Read More"}
            <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
