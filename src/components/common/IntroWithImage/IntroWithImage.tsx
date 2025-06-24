// src/components/common/IntroWithImage/IntroWithImage.tsx
"use client";

import { useState } from "react";
import { Image } from "@/components/common/Image";
import { TimeDate } from "@/components/common/TimeDate";
import { HeaderAuthor } from "@/components/common/HeaderAuthor";
import type {
  IntroWithImageProps,
  ImageProp,
} from "@/types/intro-with-image.types";
import type { StrapiImage, NestedStrapiImage } from "@/types/strapi.types";
import { cn } from "@/lib/utils/cn";

/**
 * Type guard to check if image has nested structure
 */
function isNestedImage(image: ImageProp): image is NestedStrapiImage {
  return (
    image !== null &&
    typeof image === "object" &&
    "data" in image &&
    !("url" in image)
  ); // This ensures it's not a StrapiImage
}

/**
 * Extract image data from either nested or direct structure
 */
function extractImageData(
  image: ImageProp | undefined
): StrapiImage | undefined {
  if (!image) return undefined;

  if (isNestedImage(image)) {
    // For nested images, we need to combine the id from data with attributes
    if (image.data?.attributes) {
      return {
        id: image.data.id,
        ...image.data.attributes,
      };
    }
    return undefined;
  }

  return image as StrapiImage;
}

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
  const imageData = extractImageData(image);
  const imageUrl = imageData?.url;
  const imageAlt = imageData?.alternativeText || heading || "";
  const hasValidImage = Boolean(imageUrl);

  // Handle empty string introduction - convert to undefined
  const hasIntroduction = introduction && introduction.trim().length > 0;
  const sanitizedIntroduction = hasIntroduction ? introduction : undefined;

  // Determine if content should be truncated on mobile
  const shouldTruncate =
    !isHomePage && sanitizedIntroduction && sanitizedIntroduction.length > 300;

  return (
    <section className="relative z-20" aria-label={heading}>
      <div
        className={cn(
          "relative grid grid-cols-12 gap-4 px-2 lg:px-0 lg:gap-8",
          hasValidImage ? "pt-0 lg:pt-10" : "pt-5",
          "xl:container xl:mx-auto"
        )}
      >
        {/* Content Column */}
        <div
          className={cn(
            "col-span-12 lg:z-20",
            hasValidImage
              ? "order-2 lg:order-1 lg:col-span-7"
              : "lg:col-span-10 lg:col-start-2 text-center mx-auto max-w-4xl"
          )}
        >
          {/* Time and Author Info */}
          {(timeDate || authorData) && (
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {timeDate && isDateEnabled && (
                <TimeDate timeDate={timeDate} translations={translations} />
              )}
              {authorData && (
                <HeaderAuthor author={authorData} translations={translations} />
              )}
            </div>
          )}

          {/* Heading */}
          <h1
            className={cn(
              "font-bold leading-tight tracking-tight",
              "text-white capitalize",
              "mb-4 lg:mb-6"
            )}
          >
            {heading}
          </h1>

          {/* Introduction Text - Only render if there's actual content */}
          {sanitizedIntroduction && (
            <div>
              <div
                className={cn(
                  "text-base lg:text-md text-white",
                  "leading-relaxed",
                  shouldTruncate &&
                    !isExpanded &&
                    "line-clamp-4 lg:line-clamp-none",
                  // Prose styles for content
                  "[&>p]:mb-4 [&>p:last-child]:mb-0",
                  "[&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4",
                  "[&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4",
                  "[&>li]:mb-2"
                )}
                dangerouslySetInnerHTML={{ __html: sanitizedIntroduction }}
              />

              {/* Read More Button (Mobile Only) */}
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    "pt-2 flex items-center gap-2 text-sm font-medium",
                    "text-gray-100 hover:text-white underline justify-self-end",
                    "transition-colors duration-200",
                    "lg:hidden" // Hide on desktop
                  )}
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? translations.showLess || "Show less"
                      : translations.showMore || "Show more"
                  }
                >
                  {isExpanded
                    ? translations.showLess || "Show less"
                    : translations.showMore || "Show more"}
                  <svg
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Image Column */}
        {hasValidImage && imageUrl && (
          <div
            className={cn(
              "col-span-12 lg:col-span-5",
              "order-1 lg:order-2",
              "relative aspect-[16/9] lg:aspect-auto lg:h-full",
              "overflow-hidden rounded-xl lg:rounded-2xl",
              "mix-blend-lighten shadow-lg"
            )}
          >
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={525}
              height={200}
              priority={true}
              className="w-full h-full object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
              placeholder="blur"
            />
          </div>
        )}
      </div>
    </section>
  );
}
