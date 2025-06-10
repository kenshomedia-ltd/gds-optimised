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
    return image.data?.attributes;
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
  const hasValidImage = Boolean(imageUrl); // Renamed for clarity

  // Determine if content should be truncated on mobile
  const shouldTruncate =
    !isHomePage && introduction && introduction.length > 300;

  return (
    <section className="relative z-20" aria-label={heading}>
      <div
        className={cn(
          "relative grid grid-cols-12 gap-4 px-4 lg:px-0 lg:gap-8",
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
              : "lg:col-span-12"
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
        {hasValidImage && imageUrl && imageData && (
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
                width={imageData.width || 515}
                height={imageData.height || 290}
                className="w-full h-auto rounded-lg shadow-xl"
                priority={isHomePage}
                progressive={true}
                quality={90}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 515px"
                placeholder="blur"
                responsive={true}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
