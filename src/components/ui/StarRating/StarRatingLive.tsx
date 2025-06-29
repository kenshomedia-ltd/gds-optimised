// src/components/ui/StarRating/StarRatingLive.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { StarRatingInteractive } from "./StarRatingInteractive";
import { getCurrentRating } from "@/app/actions/ratings";
import { cn } from "@/lib/utils/cn";

interface StarRatingLiveProps {
  documentId: string;
  slug?: string;
  initialRating?: number;
  initialCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showCount?: boolean;
  ratingType?: "games" | "casinos";
  itemTitle?: string;
  enablePolling?: boolean;
  pollingInterval?: number; // in milliseconds
  onRatingUpdate?: (newAvg: number, newCount: number) => void;
}

/**
 * StarRatingLive Component
 *
 * Enhanced rating component that can optionally poll for rating updates
 * Useful for pages where multiple users might be rating simultaneously
 */
export function StarRatingLive({
  documentId,
  slug,
  initialRating = 0,
  initialCount = 0,
  size = "md",
  className,
  showCount = true,
  ratingType = "games",
  itemTitle,
  enablePolling = false,
  pollingInterval = 30000, // 30 seconds default
  onRatingUpdate,
}: StarRatingLiveProps) {
  const [currentRating, setCurrentRating] = useState(initialRating);
  const [currentCount, setCurrentCount] = useState(initialCount);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch latest rating data
  const fetchLatestRating = useCallback(async () => {
    if (isUpdating) return; // Skip if already updating

    try {
      const latest = await getCurrentRating({ documentId, type: ratingType });
      if (latest) {
        const hasChanged =
          latest.ratingAvg !== currentRating ||
          latest.ratingCount !== currentCount;

        if (hasChanged) {
          setCurrentRating(latest.ratingAvg);
          setCurrentCount(latest.ratingCount);
          onRatingUpdate?.(latest.ratingAvg, latest.ratingCount);
        }
      }
    } catch (error) {
      console.error("Failed to fetch latest rating:", error);
    }
  }, [
    documentId,
    ratingType,
    currentRating,
    currentCount,
    isUpdating,
    onRatingUpdate,
  ]);

  // Set up polling if enabled
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(fetchLatestRating, pollingInterval);
    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, fetchLatestRating]);

  // Handle successful rating submission
  const handleRatingSuccess = useCallback(
    async (newAvg: number, newCount: number) => {
      setIsUpdating(true);
      setCurrentRating(newAvg);
      setCurrentCount(newCount);
      onRatingUpdate?.(newAvg, newCount);

      // Prevent polling for a short time after update
      setTimeout(() => {
        setIsUpdating(false);
      }, 5000);
    },
    [onRatingUpdate]
  );

  return (
    <div className={cn("relative", className)}>
      <StarRatingInteractive
        documentId={documentId}
        slug={slug}
        initialRating={currentRating}
        initialCount={currentCount}
        size={size}
        showCount={showCount}
        ratingType={ratingType}
        itemTitle={itemTitle}
        onRatingSuccess={handleRatingSuccess}
      />

      {enablePolling && (
        <div className="absolute -top-1 -right-1">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isUpdating ? "bg-green-500 animate-pulse" : "bg-gray-300"
            )}
            title={isUpdating ? "Rating updated" : "Live updates enabled"}
          />
        </div>
      )}
    </div>
  );
}
