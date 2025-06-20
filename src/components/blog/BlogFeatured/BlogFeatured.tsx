// src/components/blog/BlogFeatured/BlogFeatured.tsx

import Link from "next/link";
import { Image } from "@/components/common/Image";
import { TimeDate } from "@/components/common/TimeDate";
import type { BlogData } from "@/types/strapi.types";
import { cn } from "@/lib/utils/cn";

interface BlogFeaturedProps {
  blog: BlogData;
  className?: string;
}

/**
 * BlogFeatured Component
 *
 * Features:
 * - Hero-style featured blog post
 * - Large image with content overlay
 * - Responsive design
 * - Author and category metadata
 * - Optimized image loading
 * - Server-side rendered
 */
export function BlogFeatured({ blog, className }: BlogFeaturedProps) {
  const {
    title,
    slug,
    blogBrief,
    content1,
    createdAt,
    minutesRead,
    images,
    author,
    blogCategory,
  } = blog;

  // Get excerpt
  const getExcerpt = (content: string, maxLength: number = 200): string => {
    const stripped = content.replace(/<[^>]*>/g, "");
    return stripped.length > maxLength
      ? stripped.substring(0, maxLength).trim() + "..."
      : stripped;
  };

  const excerpt = getExcerpt(blogBrief || content1 || "");

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
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-r from-gray-900 to-gray-800",
        className
      )}
    >
      <div className="grid lg:grid-cols-2 min-h-[500px]">
        {/* Content Section */}
        <div className="flex flex-col justify-center p-8 lg:p-12 text-white">
          {/* Category Badge */}
          {blogCategory && (
            <Link
              href={categoryUrl}
              className={cn(
                "inline-block mb-4",
                "px-4 py-1 rounded-full",
                "bg-white/10 backdrop-blur-sm",
                "text-sm font-medium",
                "hover:bg-white/20 transition-colors"
              )}
              prefetch={false}
            >
              {blogCategory.blogCategory}
            </Link>
          )}

          {/* Title */}
          <h1 className="mb-4">
            <Link
              href={blogUrl}
              className={cn(
                "text-3xl lg:text-4xl font-bold",
                "hover:text-gray-200 transition-colors",
                "line-clamp-3"
              )}
              prefetch={false}
            >
              {title}
            </Link>
          </h1>

          {/* Excerpt */}
          {excerpt && (
            <p className="mb-6 text-lg text-gray-300 line-clamp-3">{excerpt}</p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {author && (
              <div className="flex items-center gap-2">
                {author.photo?.url && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={author.photo.url}
                      alt={`${author.firstName} ${author.lastName}`}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                )}
                <Link
                  href={authorUrl}
                  className="hover:text-white transition-colors"
                  prefetch={false}
                >
                  {author.firstName} {author.lastName}
                </Link>
              </div>
            )}

            <TimeDate timeDate={createdAt} />

            {minutesRead && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {minutesRead} min read
              </span>
            )}
          </div>

          {/* Read More Button */}
          <div className="mt-8">
            <Link
              href={blogUrl}
              className={cn(
                "inline-flex items-center gap-2",
                "px-6 py-3 rounded-lg",
                "bg-white text-gray-900 font-medium",
                "hover:bg-gray-100 transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              )}
              prefetch={false}
            >
              Read Article
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative h-full min-h-[300px] lg:min-h-[500px]">
          {images?.url ? (
            <Image
              src={images.url}
              alt={images.alternativeText || title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              quality={85}
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <svg
                className="w-24 h-24 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-transparent lg:hidden" />
        </div>
      </div>
    </article>
  );
}
