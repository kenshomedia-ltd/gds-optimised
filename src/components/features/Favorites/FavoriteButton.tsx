// src/components/features/Favorites/FavoriteButton.tsx
"use client";

import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { faHeart as faHeartSolid } from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import { useFavorites } from "@/contexts/FavoritesContext";
import type { FavoriteButtonProps } from "@/types/favorite.types";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

/**
 * FavoriteButton Component
 *
 * Features:
 * - Optimistic UI updates
 * - Loading states with transitions
 * - Accessible button with ARIA labels
 * - Toast notifications
 * - Responsive sizes
 * - Fixed dimensions to prevent overflow
 */
export function FavoriteButton({
  gameId,
  gameTitle,
  game,
  translations = {},
  className,
  size = "sm",
}: FavoriteButtonProps) {
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const [isPending, startTransition] = useTransition();
  const [isAnimating, setIsAnimating] = useState(false);

  const favorited = isFavorited(gameId);

  const handleToggleFavorite = () => {
    if (!game) {
      console.error("Game data is required to add to favorites");
      return;
    }

    setIsAnimating(true);

    startTransition(async () => {
      try {
        if (favorited) {
          await removeFavorite(gameId);
          toast.success(
            translations.removeFromFavorites || "Removed from favorites"
          );
        } else {
          await addFavorite(game);
          toast.success(translations.addToFavorites || "Added to favorites");
        }
      } catch {
        toast.error(translations.favoriteError || "Failed to update favorites");
      } finally {
        setTimeout(() => setIsAnimating(false), 300);
      }
    });
  };

  // Fixed size classes for better containment
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isPending}
      className={cn(
        "relative inline-flex items-center justify-center",
        "rounded-full",
        "hover:bg-white/20 active:scale-95",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-all duration-200",
        sizeClasses[size],
        className
      )}
      aria-label={
        favorited
          ? `Remove ${gameTitle} from favorites`
          : `Add ${gameTitle} to favorites`
      }
      aria-pressed={favorited}
    >
      <span className="sr-only">
        {favorited ? "Remove from" : "Add to"} favorites
      </span>

      <FontAwesomeIcon
        icon={favorited ? faHeartSolid : faHeart}
        className={cn(
          "transition-all duration-200",
          iconSizeClasses[size],
          favorited ? "text-danger" : "text-white",
          isAnimating && "animate-ping",
          "group-hover:scale-110"
        )}
      />

      {/* Loading spinner overlay */}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}
