// src/components/common/IntroWithImage/IntroWithImage.tsx
"use client";

import { useState } from "react";
import { Image } from "@/components/common/Image";
import { TimeDate } from "@/components/common/TimeDate";
import { HeaderAuthor } from "@/components/common/HeaderAuthor";
import type { IntroWithImageProps } from "@/types/intro-with-image.types";
import { cn } from "@/lib/utils/cn";

/**
 * IntroWithImage Component
 *
 * Features:
 * - Responsive layout with image and content
 * - Progressive loading with optimized images
 * - Mobile-first design with truncation
 * - SEO-friendly heading structure
 * - Accessibility features with proper ARIA labels
 * - Performance optimized with lazy loading
 */
export function IntroWithImage({
  heading,
  introduction,
  image,
  translations = {},
  timeDate,
  authorData,
  isHomePage = false,
  isDateEnabled = true,
}: IntroWithImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Process image data - handle both nested and direct structures
  const imageData = image?.data || image;
  const imageUrl = imageData?.attributes?.url || imageData?.url;
  const imageAlt =
    imageData?.attributes?.alternativeText ||
    imageData?.alternativeText ||
    heading ||
    "";
  const imageMime = imageData?.attributes?.mime || imageData?.mime;
  const hasImage = Boolean(imageUrl);

  // Determine if content should be truncated on mobile
  const shouldTruncate =
    !isHomePage && introduction && introduction.length > 300;

  return (
    <section className="relative z-20" aria-label={heading}>
      <div
        className={cn(
          "relative grid grid-cols-12 gap-4 pb-5 px-4 lg:px-0 lg:gap-8",
          hasImage ? "pt-0 lg:pt-10" : "pt-5",
          "xl:container xl:mx-auto"
        )}
      >
        {/* Content Column */}
        <div
          className={cn(
            "col-span-12 lg:z-20",
            hasImage ? "order-2 lg:order-1 lg:col-span-7" : "lg:col-span-12"
          )}
        >
          <div className="mx-auto lg:mx-0">
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-heading-text mb-4">
              {heading}
            </h1>

            {/* Meta Information */}
            {!isHomePage && isDateEnabled && (timeDate || authorData) && (
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-4">
                {timeDate && (
                  <TimeDate timeDate={timeDate} translations={translations} />
                )}
                {authorData && isDateEnabled && (
                  <HeaderAuthor
                    author={authorData}
                    translations={translations}
                  />
                )}
              </div>
            )}

            {/* Introduction Content with Read More */}
            {introduction && (
              <div className="relative">
                {shouldTruncate ? (
                  <>
                    <div
                      className={cn(
                        "max-w-none text-white",
                        "prose prose-lg prose-invert max-w-none",
                        "[&>p]:mb-4 [&>p:last-child]:mb-0",
                        "[&_a]:text-primary [&_a:hover]:text-primary/80 [&_a]:transition-colors",
                        "[&_strong]:font-semibold [&_strong]:text-heading-text",
                        !isExpanded && "line-clamp-3 lg:line-clamp-none"
                      )}
                      dangerouslySetInnerHTML={{ __html: introduction }}
                    />

                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className={cn(
                        "font-semibold text-sm text-primary",
                        "underline underline-offset-4",
                        "mt-2 transition-opacity",
                        "lg:hidden",
                        isExpanded && "hidden"
                      )}
                      aria-expanded={isExpanded}
                      aria-label={translations.showMore || "Show more"}
                    >
                      {translations.showMore || "Read more"}
                    </button>
                  </>
                ) : (
                  <div
                    className={cn(
                      "max-w-none text-white",
                      "prose prose-lg prose-invert max-w-none",
                      "[&>p]:mb-4 [&>p:last-child]:mb-0",
                      "[&_a]:text-primary [&_a:hover]:text-primary/80 [&_a]:transition-colors",
                      "[&_strong]:font-semibold [&_strong]:text-heading-text"
                    )}
                    dangerouslySetInnerHTML={{ __html: introduction }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Image Column */}
        {hasImage && (
          <div
            className={cn(
              "col-span-12 lg:col-span-5",
              "order-1 lg:order-2",
              "relative flex items-center justify-center lg:justify-end",
              "mb-4 md:mb-0"
            )}
          >
            <div className="relative w-full max-w-[515px] lg:max-w-none">
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={515}
                height={200}
                className="w-full h-auto rounded-lg shadow-xl"
                priority={isHomePage}
                quality={90}
                sizes="(max-width: 1024px) 100vw, 515px"
                placeholder="blur"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
