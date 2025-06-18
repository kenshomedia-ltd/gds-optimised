// src/components/ui/StarRating/StarRating.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import { cn } from "@/lib/utils/cn";

// Define size classes outside component
const STAR_SIZE_CLASSES = {
  sm: "text-sm", // ~14px
  md: "text-xl", // ~20px
  lg: "text-3xl", // ~30px
} as const;

interface StarRatingProps {
  maxRating?: number;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: keyof typeof STAR_SIZE_CLASSES;
  readonly?: boolean;
  showValue?: boolean;
  valuePosition?: "right" | "bottom";
  className?: string;
  ariaLabel?: string;
}

/**
 * StarRating Component
 *
 * Features:
 * - Smooth fractional rating with clipping mask
 * - Interactive or readonly modes
 * - Accessible with ARIA labels
 * - Touch-friendly
 * - Smooth animations
 */
export function StarRating({
  maxRating = 5,
  initialRating = 0,
  onRatingChange,
  size = "md",
  readonly = false,
  showValue = true,
  valuePosition = "right",
  className,
  ariaLabel,
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  // Get size class
  const sizeClass = STAR_SIZE_CLASSES[size];

  // Handle mouse move for fractional ratings
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
      if (readonly) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width - 4; // Account for padding
      const percentage = x / width;

      // Make it easier to get full stars - anything above 85% counts as 100%
      const adjustedPercentage =
        percentage > 0.85 ? 1 : Math.max(0.1, Math.min(1, percentage));

      const newRating = starIndex + adjustedPercentage;
      setHoverRating(newRating);
    },
    [readonly]
  );

  const handleMouseLeave = useCallback(() => {
    if (!readonly) setHoverRating(0);
  }, [readonly]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
      if (readonly) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width - 4;
      const percentage = x / width;
      const adjustedPercentage =
        percentage > 0.85 ? 1 : Math.max(0.1, Math.min(1, percentage));

      const starRating = starIndex + adjustedPercentage;
      setRating(starRating);
      onRatingChange?.(starRating);
    },
    [readonly, onRatingChange]
  );

  // Touch handling for mobile
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>, starIndex: number) => {
      if (readonly) return;

      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const width = rect.width - 4;
      const percentage = x / width;
      const adjustedPercentage =
        percentage > 0.85 ? 1 : Math.max(0.1, Math.min(1, percentage));

      const newRating = starIndex + adjustedPercentage;
      setRating(newRating);
      onRatingChange?.(newRating);
    },
    [readonly, onRatingChange]
  );

  const getStarFill = useCallback(
    (starIndex: number) => {
      const currentRating = hoverRating || rating;
      const fillPercentage = Math.max(
        0,
        Math.min(1, currentRating - starIndex)
      );
      return fillPercentage;
    },
    [rating, hoverRating]
  );

  // Memoize star rendering
  const stars = useMemo(() => {
    return Array.from({ length: maxRating }, (_, index) => {
      const starIndex = index;
      const fillPercentage = getStarFill(starIndex);

      return (
        <div
          key={index}
          className={cn(
            "relative cursor-pointer transition-transform hover:scale-110 pr-1",
            readonly && "cursor-default hover:scale-100",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          )}
          onMouseMove={(e) => handleMouseMove(e, starIndex)}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => handleClick(e, starIndex)}
          onTouchStart={(e) => handleTouchStart(e, starIndex)}
          role={readonly ? "img" : "button"}
          aria-label={`${starIndex + 1} out of ${maxRating} stars`}
          tabIndex={readonly ? -1 : 0}
          onKeyDown={(e) => {
            if (!readonly && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              const fullRating = starIndex + 1;
              setRating(fullRating);
              onRatingChange?.(fullRating);
            }
          }}
        >
          {/* Background star (empty) */}
          <FontAwesomeIcon
            icon={faStar}
            className={cn(
              sizeClass,
              "text-gray-400 transition-colors duration-150"
            )}
          />

          {/* Foreground star (filled) with clipping */}
          <div
            className="absolute inset-0 overflow-hidden transition-all duration-150"
            style={{ width: `${fillPercentage * 100}%` }}
          >
            <FontAwesomeIcon
              icon={faStar}
              className={cn(
                sizeClass,
                "text-accent-100 transition-colors duration-150"
              )}
            />
          </div>
        </div>
      );
    });
  }, [
    maxRating,
    getStarFill,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleTouchStart,
    readonly,
    sizeClass,
    onRatingChange,
  ]);

  const displayRating = hoverRating || rating;

  return (
    <div
      className={cn(
        "inline-flex",
        valuePosition === "bottom" ? "flex-col" : "flex-row items-center",
        className
      )}
      role="group"
      aria-label={
        ariaLabel ||
        `Star rating: ${displayRating.toFixed(1)} out of ${maxRating}`
      }
    >
      <div className="flex items-center gap-0.5">{stars}</div>

      {showValue && (
        <span
          className={cn(
            "font-medium text-gray-600 tabular-nums",
            valuePosition === "right"
              ? "text-sm"
              : "text-center text-sm"
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
