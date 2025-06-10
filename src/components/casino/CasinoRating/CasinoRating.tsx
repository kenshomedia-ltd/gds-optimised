// src/components/casino/CasinoRating/CasinoRating.tsx
"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faStarHalfAlt,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { faStar as faStarSolid } from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import { faChevronRight } from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { cn } from "@/lib/utils/cn";

interface CasinoRatingProps {
  ratingAvg: number;
  ratingCount: number;
  casinoSlug: string;
  casinoTitle: string;
  translations?: Record<string, string>;
  showVotes?: boolean;
  className?: string;
}

/**
 * CasinoRating Component
 *
 * Features:
 * - Star rating display
 * - Vote count
 * - Link to casino review
 */
export function CasinoRating({
  ratingAvg,
  ratingCount,
  casinoSlug,
  casinoTitle,
  translations = {},
  showVotes = true,
  className,
}: CasinoRatingProps) {
  const fullStars = Math.floor(ratingAvg);
  const hasHalfStar = ratingAvg % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const siteId = process.env.NEXT_PUBLIC_SITE_ID || "default";
  const casinoPagePath = process.env.NEXT_PUBLIC_CASINO_PAGE_PATH || "/casinos";

  return (
    <div className={cn("text-center", className)}>
      {/* Star Rating */}
      <div className="flex items-center justify-center gap-0.5 mb-2">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <FontAwesomeIcon
            key={`full-${i}`}
            icon={faStarSolid}
            className="w-6 h-6 text-warning"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <FontAwesomeIcon
            icon={faStarHalfAlt}
            className="w-6 h-6 text-warning"
          />
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <FontAwesomeIcon
            key={`empty-${i}`}
            icon={faStar}
            className="w-6 h-6 text-gray-300"
          />
        ))}
      </div>

      {/* Vote count */}
      {showVotes && (
        <div className="text-xs text-gray-500 mb-2">
          ({ratingCount} {translations.votes || "votes"})
        </div>
      )}

      {/* Review link */}
      <div className="flex items-center justify-center">
        <Link
          href={`${
            siteId === "gds" ? "/it" : ""
          }${casinoPagePath}/${casinoSlug}/`}
          className="casino-name text-[14px] text-grey-500 mr-[11px] hover:text-primary transition-colors"
        >
          <span className="hidden sm:inline-flex sm:pr-1">{casinoTitle}</span>
          <span className="underline">{translations.review || "Review"}</span>
        </Link>
        <FontAwesomeIcon
          icon={faChevronRight}
          className="w-[14px] h-[14px] text-grey-500"
        />
      </div>
    </div>
  );
}
