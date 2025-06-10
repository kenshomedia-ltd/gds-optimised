// src/components/ui/StarRating/StarRatingServer.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import { cn } from "@/lib/utils/cn";

// Define size classes
const STAR_SIZE_CLASSES = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-xl",
  lg: "text-3xl",
} as const;

interface StarRatingServerProps {
  rating: number;
  maxRating?: number;
  size?: keyof typeof STAR_SIZE_CLASSES;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  className?: string;
  compact?: boolean;
}

/**
 * StarRatingServer Component
 *
 * Server-side rendered star rating that works without JavaScript
 * Uses CSS-only approach for fractional stars
 */
export function StarRatingServer({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  showCount = false,
  count,
  className,
  compact = false,
}: StarRatingServerProps) {
  const sizeClass = STAR_SIZE_CLASSES[size];
  const percentage = (rating / maxRating) * 100;

  // For compact mode
  if (compact) {
    return (
      <span
        className={cn("inline-flex items-center gap-1", className)}
        role="img"
        aria-label={`Rating: ${rating.toFixed(1)} out of ${maxRating} stars`}
      >
        <FontAwesomeIcon
          icon={faStar}
          className={cn(sizeClass, "text-yellow-400")}
        />
        <span
          className={cn(
            "font-medium tabular-nums",
            size === "xs" ? "text-xs" : "text-sm",
            "text-gray-600"
          )}
        >
          {rating.toFixed(1)}
        </span>
        {showCount && count !== undefined && (
          <span
            className={cn(
              "text-gray-500",
              size === "xs" ? "text-xs" : "text-sm"
            )}
          >
            ({count})
          </span>
        )}
      </span>
    );
  }

  return (
    <div
      className={cn("inline-flex items-center", className)}
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of ${maxRating} stars${
        showCount && count ? `, ${count} reviews` : ""
      }`}
    >
      {/* Star container with CSS mask for fractional display */}
      <div className="relative inline-flex items-center">
        {/* Background stars (gray) */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: maxRating }).map((_, i) => (
            <FontAwesomeIcon
              key={`bg-${i}`}
              icon={faStar}
              className={cn(sizeClass, "text-gray-300")}
            />
          ))}
        </div>

        {/* Foreground stars (yellow) with clip */}
        <div
          className="absolute inset-0 flex items-center gap-0.5 overflow-hidden"
          style={{
            width: `${percentage}%`,
            // Add CSS custom property for better browser support
            clipPath: `inset(0 ${100 - percentage}% 0 0)`,
            WebkitClipPath: `inset(0 ${100 - percentage}% 0 0)`,
          }}
        >
          {Array.from({ length: maxRating }).map((_, i) => (
            <FontAwesomeIcon
              key={`fg-${i}`}
              icon={faStar}
              className={cn(sizeClass, "text-yellow-400")}
            />
          ))}
        </div>
      </div>

      {/* Rating value */}
      {(showValue || showCount) && (
        <div
          className={cn(
            "flex items-center gap-1 ml-2",
            size === "xs" || size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          {showValue && (
            <span className="font-medium text-gray-600 tabular-nums">
              {rating.toFixed(1)}/{maxRating}
            </span>
          )}
          {showValue && showCount && count !== undefined && (
            <span className="text-gray-400">•</span>
          )}
          {showCount && count !== undefined && (
            <span className="text-gray-500">({count})</span>
          )}
        </div>
      )}
    </div>
  );
}
