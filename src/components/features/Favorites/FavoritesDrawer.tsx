// src/components/features/Favorites/FavoritesDrawer.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faHeart,
  faTrash,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { Image } from "@/components/common/Image";
import { StarRatingDisplay } from "@/components/ui/StarRating/StarRatingDisplay";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import type { FavoritesDrawerProps } from "@/types/favorite.types";
import { cn } from "@/lib/utils/cn";

/**
 * FavoritesDrawer Component
 *
 * A slide-out drawer that displays the user's favorited games
 * Features:
 * - Native implementation without external dependencies
 * - Accessible with focus trap
 * - Game cards with images and ratings
 * - Remove functionality for each game
 * - Empty state when no favorites
 * - Responsive design
 */
export function FavoritesDrawer({
  isOpen,
  onClose,
  translations = {},
}: FavoritesDrawerProps) {
  const { favorites, removeFavorite } = useFavorites();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";

      // Focus the close button when drawer opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleRemove = async (gameId: number, gameTitle: string) => {
    try {
      await removeFavorite(gameId);
      // Show success toast with game title
      toast.success(`${gameTitle} ${translations.removeToFav}`);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      toast.error(`Failed to remove ${gameTitle} from favorites`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 z-[90]",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl transition-transform duration-300 z-[100]",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={translations.favouritesTitle || "My Favorite Games"}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon
                icon={faHeart}
                className="h-5 w-5 text-danger"
                swapOpacity
              />
              {translations.favouritesTitle || "My Favorite Games"}
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              className="relative -m-2 p-2 text-gray-400 hover:text-gray-500 transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={onClose}
              aria-label="Close favorites drawer"
            >
              <FontAwesomeIcon icon={faXmark} className="h-6 w-6" swapOpacity />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FontAwesomeIcon
                icon={faHeart}
                className="h-16 w-16 text-gray-300 mb-4"
                swapOpacity
              />
              <p className="text-gray-500 text-lg mb-2">
                {translations.noFavourites || "No favorite games yet"}
              </p>
              <p className="text-gray-400 text-sm">
                {translations.noFavouritesDesc ||
                  "Start adding games to your favorites!"}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {favorites.map((game) => (
                <li key={game.id} className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Game Image */}
                    <Link
                      href={`/slots/${game.slug}`}
                      className="flex-shrink-0 block rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      onClick={onClose}
                    >
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100">
                        {game.images?.url ? (
                          <Image
                            src={game.images.url}
                            alt={game.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 80px, 96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faHeart}
                              className="h-8 w-8 text-gray-300"
                            />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Game Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/slot-machines/${game.slug}`}
                        className="block"
                        onClick={onClose}
                      >
                        <h3 className="text-base font-semibold text-gray-900 truncate hover:text-primary transition-colors">
                          {game.title}
                        </h3>
                      </Link>
                      {game.provider && (
                        <p className="text-sm text-gray-500 truncate">
                          {game.provider.title}
                        </p>
                      )}
                      {game.ratingAvg > 0 && (
                        <div className="mt-1">
                          <StarRatingDisplay
                            rating={game.ratingAvg}
                            size="sm"
                            showValue={true}
                          />
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(game.id, game.title)}
                      className={cn(
                        "flex-shrink-0 p-2 rounded-md",
                        "text-gray-400 hover:text-danger hover:bg-red-50",
                        "transition-colors duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                      )}
                      aria-label={`Remove ${game.title} from favorites`}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="h-5 w-5"
                        swapOpacity
                      />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with count */}
        {favorites.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {favorites.length}
                {translations.numberInFavs || "in favorites"}
              </p>
              <Link href="/my-favorites" onClick={onClose}>
                <Button variant="default" size="sm">
                  {translations.viewAll || "View All"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
