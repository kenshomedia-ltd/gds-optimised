// src/components/widgets/Overview/Overview.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Image } from "@/components/common/Image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type {
  OverviewBlockProps,
  OverviewCardProps,
} from "@/types/overview.types";
import { cn } from "@/lib/utils/cn";

/**
 * OverviewCard Component
 *
 * Renders an individual overview card with two different styles
 * Features:
 * - Two visual styles: Version 2 (horizontal) and default (overlay)
 * - Optimized image loading with lazy loading
 * - Hover effects and transitions
 * - Accessible links with proper focus states
 */
function OverviewCard({
  overview,
  overviewType,
  priority = false,
}: OverviewCardProps) {
  // Handle the direct image structure from Strapi
  const imageUrl = overview.card_img?.url;
  const imageAlt = overview.card_img?.alternativeText || overview.title;
  // const imageWidth = overview.card_img?.width;
  // const imageHeight = overview.card_img?.height;

  if (overviewType === "Version 2") {
    return (
      <Link
        href={`${overview.url}/`}
        className={cn(
          "group block",
          "border border-white/30 rounded-lg",
          "bg-primary/20 backdrop-blur-sm",
          "transition-all duration-300",
          "hover:border-white/50 hover:bg-primary/30 hover:scale-105",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        )}
        aria-label={`View ${overview.title}`}
      >
        <div className="flex flex-col gap-5 md:flex-row items-center py-5 md:py-2.5 px-2.5">
          {/* Image */}
          {imageUrl && (
            <div className="flex-shrink-0">
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-md"
                priority={priority}
                quality={85}
              />
            </div>
          )}

          {/* Title */}
          <div className="relative text-center md:text-left flex justify-center h-full items-center text-white text-xs">
            {overview.title}
          </div>
        </div>
      </Link>
    );
  }

  // Default style with background image and overlay
  return (
    <Link
      href={`${overview.url}/`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl",
        "bg-primary/20 backdrop-blur-sm",
        "border border-white/30",
        "shadow-[0px_4px_6px_-1px_rgba(16,24,40,0.1),0px_2px_4px_-2px_rgba(16,24,40,0.1)]",
        "transition-all duration-300",
        "hover:border-white/50 hover:scale-105",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      )}
      aria-label={`View ${overview.title}`}
    >
      {/* Background Image */}
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
            priority={priority}
            quality={75}
          />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(31,18,58,0.6)] to-[rgba(31,18,58,0.8)] z-10" />

      {/* Content */}
      <div className="relative z-20 flex justify-center items-center h-full py-5 md:py-10 px-5">
        <h3
          className={cn(
            "font-bold text-[15px] md:text-[20px] text-white text-center",
            "flex items-center gap-2",
            "[text-shadow:0px_0px_12px_rgba(63,230,252,0.6)]",
            "transition-transform duration-300 group-hover:translate-x-1"
          )}
        >
          {overview.title}
          <FontAwesomeIcon
            icon={faChevronRight}
            className="h-5 w-5 md:h-6 md:w-6"
            aria-hidden="true"
          />
        </h3>
      </div>
    </Link>
  );
}

/**
 * Overview Component
 *
 * Main container for overview cards
 * Features:
 * - Responsive grid layout
 * - Progressive enhancement with loading states
 * - Optimized rendering with React.memo
 * - Proper semantic HTML structure
 */
export function Overview({ data, className }: OverviewBlockProps) {
  // Memoize the overview items to prevent unnecessary re-renders
  const overviewItems = useMemo(() => data?.overviews || [], [data?.overviews]);

  if (!overviewItems.length) {
    return null;
  }

  return (
    <section className={cn("my-10", className)} aria-label="Overview cards">
      <div className="relative xl:container px-2 z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5">
          {overviewItems.map((overview, index) => (
            <OverviewCard
              key={overview.id || index}
              overview={overview}
              overviewType={data.overview_type}
              priority={index < 4} // Prioritize first 4 images for LCP
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Export memoized version for better performance
export default Overview;
