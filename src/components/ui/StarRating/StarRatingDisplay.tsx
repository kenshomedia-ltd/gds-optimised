// src/components/ui/StarRating/StarRatingDisplayOptimized.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import { cn } from "@/lib/utils/cn";

// This component doesn't need any client-side JavaScript
// It can be used directly in server components

const STAR_SIZE_CLASSES = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-xl",
  lg: "text-3xl",
} as const;

interface StarRatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: keyof typeof STAR_SIZE_CLASSES;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  valuePosition?: "right" | "bottom";
  className?: string;
  compact?: boolean;
}

export function StarRatingDisplay({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  showCount = false,
  count,
  valuePosition = "right",
  className,
  compact = false,
}: StarRatingDisplayProps) {
  const sizeClass = STAR_SIZE_CLASSES[size];

  // Calculate how many full, partial, and empty stars
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1;
  const emptyStars = maxRating - Math.ceil(rating);

  if (compact) {
    return (
      <span
        className={cn("inline-flex items-center gap-1", className)}
        role="img"
        aria-label={`Rating: ${rating.toFixed(1)} out of ${maxRating} stars`}
      >
        <FontAwesomeIcon
          icon={faStar}
          className={cn(sizeClass, "text-accent-100")}
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
      className={cn(
        "inline-flex",
        valuePosition === "bottom"
          ? "flex-col items-center"
          : "flex-row items-center",
        className
      )}
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of ${maxRating} stars${
        showCount && count ? `, ${count} reviews` : ""
      }`}
    >
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <FontAwesomeIcon
            key={`full-${i}`}
            icon={faStar}
            className={cn(sizeClass, "text-accent-100")}
          />
        ))}

        {/* Partial star using CSS gradient */}
        {partialStar > 0 && (
          <div className="relative inline-block">
            <FontAwesomeIcon
              icon={faStar}
              className={cn(sizeClass, "text-gray-300")}
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${partialStar * 100}%` }}
            >
              <FontAwesomeIcon
                icon={faStar}
                className={cn(sizeClass, "text-accent-100")}
              />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <FontAwesomeIcon
            key={`empty-${i}`}
            icon={faStar}
            className={cn(sizeClass, "text-gray-300")}
          />
        ))}
      </div>

      {(showValue || showCount) && (
        <div
          className={cn(
            "flex items-center gap-1",
            valuePosition === "right" ? "ml-2" : "mt-1",
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
