// src/components/ui/StarRating/StarRatingInteractive.tsx
"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { StarRating } from "./StarRating";
import { updateRating } from "@/app/actions/ratings";
import { cn } from "@/lib/utils/cn";

interface StarRatingInteractiveProps {
  documentId: string;
  slug?: string;
  initialRating?: number;
  initialCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showCount?: boolean;
  ratingType?: "games" | "casinos";
  onRatingSuccess?: (newAvg: number, newCount: number) => void;
  onRatingError?: (error: string) => void;
  itemTitle?: string; // For better accessibility
}

/**
 * StarRatingInteractive Component
 *
 * Wraps the base StarRating component with server action functionality
 * for updating ratings for both games and casinos
 */
export function StarRatingInteractive({
  documentId,
  slug,
  initialRating = 0,
  initialCount = 0,
  size = "md",
  className,
  showCount = true,
  ratingType = "games",
  onRatingSuccess,
  onRatingError,
  itemTitle,
}: StarRatingInteractiveProps) {
  const [currentRating, setCurrentRating] = useState(initialRating);
  const [currentCount, setCurrentCount] = useState(initialCount);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Update current rating/count when props change
  useEffect(() => {
    setCurrentRating(initialRating);
    setCurrentCount(initialCount);
  }, [initialRating, initialCount]);

  // Check if user has already rated this item (from localStorage)
  useEffect(() => {
    const storageKey = `${ratingType}Ratings`;
    const storedRatings = localStorage.getItem(storageKey);
    if (storedRatings) {
      try {
        const ratings = JSON.parse(storedRatings);
        const existingRating = ratings[documentId];
        if (existingRating) {
          setUserRating(existingRating);
        }
      } catch (e) {
        console.error("Failed to parse stored ratings:", e);
      }
    }
  }, [documentId, ratingType]);

  const handleRatingChange = useCallback(
    async (rating: number) => {
      // Check if user has already rated
      if (userRating !== null) {
        console.log("[StarRating] User has already rated this item");
        return;
      }

      // Optimistically update the UI
      setUserRating(rating);
      setError(null);

      startTransition(async () => {
        try {
          const result = await updateRating({
            documentId,
            ratingType,
            ratingValue: rating,
            slug,
          });

          if (result.success && result.ratingAvg !== undefined) {
            // Update the average rating and count from the server response
            setCurrentRating(result.ratingAvg);
            if (result.ratingCount !== undefined) {
              setCurrentCount(result.ratingCount);
            }

            // Store user's rating in localStorage
            const storageKey = `${ratingType}Ratings`;
            const storedRatings = localStorage.getItem(storageKey) || "{}";
            const ratings = JSON.parse(storedRatings);
            ratings[documentId] = rating;
            localStorage.setItem(storageKey, JSON.stringify(ratings));

            // Call success callback
            onRatingSuccess?.(
              result.ratingAvg,
              result.ratingCount || currentCount
            );
          } else {
            // Revert on error
            setUserRating(null);
            setError(result.error || "Failed to update rating");
            onRatingError?.(result.error || "Failed to update rating");
          }
        } catch (err) {
          // Revert on error
          setUserRating(null);
          const errorMessage =
            err instanceof Error ? err.message : "An error occurred";
          setError(errorMessage);
          onRatingError?.(errorMessage);
        }
      });
    },
    [
      documentId,
      ratingType,
      slug,
      currentCount,
      onRatingSuccess,
      onRatingError,
      userRating,
    ]
  );

  // Determine which rating to display in the stars
  const displayRating = userRating !== null ? userRating : currentRating;
  const ratingKey = userRating !== null ? "user" : "average";

  return (
    <div className={`flex flex-col gap-2 items-center ${className}`}>
      <div className="flex items-center gap-3">
        <StarRating
          key={`${ratingKey}-${documentId}`} // Force re-render when switching between user/average rating
          initialRating={displayRating}
          onRatingChange={handleRatingChange}
          size={size}
          readonly={isPending || userRating !== null}
          showValue={false}
          className={cn(
            isPending && "opacity-50 pointer-events-none",
            userRating !== null &&
              userRating > 0 &&
              "ring-2 ring-accent-100/20 rounded-lg p-1"
          )}
          ariaLabel={`Rate this ${
            ratingType === "casinos" ? "casino" : "game"
          }${
            itemTitle ? ` (${itemTitle})` : ""
          }. Current average: ${currentRating.toFixed(1)} stars${
            userRating !== null ? ". You have already rated this item." : ""
          }`}
        />

        {isPending && (
          <span className="text-sm text-gray-500 animate-pulse">
            Updating...
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs h-4">
        {/* Added fixed height to prevent layout shift */}
        <span className="font-medium text-gray-700">
          {currentRating.toFixed(1)}/5
        </span>
        {showCount && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {currentCount} {currentCount === 1 ? "rating" : "ratings"}
            </span>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
