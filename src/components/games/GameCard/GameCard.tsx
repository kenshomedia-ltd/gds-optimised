// src/components/games/GameCard/GameCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Image } from "@/components/common/Image";
import { FavoriteButton } from "@/components/features/Favorites/FavoriteButton";
import type { GameCardProps } from "@/types/game.types";
import { cn } from "@/lib/utils/cn";

/**
 * GameCard Component
 *
 * Features:
 * - Optimized image loading with blur placeholder
 * - Hover effects with CSS-only transitions
 * - Accessibility compliant
 * - Mobile-first responsive design
 * - Badge system for new/hot games
 * - Lazy loading by default
 * - Fixed favorite button positioning
 */
export function GameCard({
  game,
  translations = {},
  priority = false,
  loading = "lazy",
  className,
}: GameCardProps) {
  const [imageError, setImageError] = useState(false);

  // Get the first image from the array
  const gameImage = Array.isArray(game.images) ? game.images[0] : game.images;
  const hasImage = gameImage && gameImage.url;

  // Calculate if game is new (within 14 days)
  const isNewGame = () => {
    if (!game.createdAt) return false;
    const createdDate = new Date(game.createdAt);
    const daysDiff = Math.floor(
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff <= 14;
  };

  const isHotGame = game.ratingAvg > 4.5;

  // Badge configuration
  const badgeConfig = isHotGame
    ? {
        text: translations.hotSlot || "HOT SLOT",
        className:
          "bg-gradient-to-b from-accent-100 to-secondary shadow-[0px_2px_8px_rgba(255,91,20,0.4)]",
      }
    : isNewGame()
    ? {
        text: translations.newSlot || "NEW SLOT",
        className:
          "bg-gradient-to-b from-accent-500 to-accent-700 shadow-[0px_2px_8px_rgba(0,188,212,0.4)]",
      }
    : null;

  // Generate URLs
  const gamePagePath = process.env.NEXT_PUBLIC_GAME_PAGE_PATH || "/slot-machines";
  const providerPagePath =
    process.env.NEXT_PUBLIC_PROVIDER_PAGE_PATH || "/providers";
  const gameUrl = `${gamePagePath}/${game.slug}`;
  const providerUrl = game.provider
    ? `${providerPagePath}/${game.provider.slug}`
    : "#";

  return (
    <article
      className={cn(
        "relative rounded-lg aspect-[235/244] w-full",
        "transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02]",
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        className
      )}
      data-game-id={game.id}
    >
      {/* Mobile touch target */}
      <Link
        href={gameUrl}
        className="absolute inset-0 z-10 md:hidden"
        aria-label={`Play ${game.title}`}
        prefetch={false}
      />

      {/* Game image container */}
      <div className="absolute inset-0 overflow-hidden rounded-lg bg-gray-200">
        {!imageError && hasImage ? (
          <Image
            src={gameImage.url}
            alt={gameImage.alternativeText || `${game.title} slot game`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            loading={loading}
            priority={priority}
            quality={75}
            progressive={true}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Game overlay and content */}
      <div
        className={cn(
          "group relative h-full rounded-lg flex flex-col justify-between",
          "pointer-events-none md:pointer-events-auto",
          "transition-[background] duration-300",
          "hover:bg-gradient-to-b hover:from-transparent hover:to-background-900/60"
        )}
      >
        {/* Badge */}
        {badgeConfig && (
          <div className="p-2">
            <span
              className={cn(
                "inline-block text-[10px] leading-4 text-white font-bold",
                "px-1.5 py-0.5 uppercase rounded-full",
                badgeConfig.className
              )}
            >
              {badgeConfig.text}
            </span>
          </div>
        )}

        {/* Desktop play button */}
        <div
          className={cn(
            "action-buttons absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "opacity-0 scale-75",
            "transition-all duration-300",
            "group-hover:opacity-100 group-hover:scale-100",
            "hidden md:flex flex-col items-center gap-3"
          )}
        >
          <Link
            href={gameUrl}
            className={cn(
              "px-8 py-2 rounded font-bold text-sm whitespace-nowrap",
              "bg-secondary text-secondary-text uppercase",
              "hover:bg-secondary-tint transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            )}
            prefetch={false}
          >
            {translations.playFunBtn || "Play Free"}
          </Link>
        </div>

        {/* Game info footer - Fixed positioning */}
        <div className="game-info mt-auto rounded-b-lg bg-gradient-to-t from-background-900/60 to-transparent">
          {/* Main info section with proper padding and height constraints */}
          <div className="p-2 pb-1">
            <div
              className={cn(
                "flex items-start justify-between gap-1",
                "transition-transform duration-300",
                "translate-y-5 group-hover:translate-y-0"
              )}
            >
              {/* Title with constrained width */}
              <h3 className="text-white text-sm font-bold m-0 min-w-0 flex-1">
                <Link
                  href={gameUrl}
                  className="hover:text-secondary-tint transition-colors block truncate"
                  prefetch={false}
                >
                  {game.title}
                </Link>
              </h3>

              {/* Favorite button with fixed dimensions */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <FavoriteButton
                  gameId={game.id}
                  gameTitle={game.title}
                  game={game}
                  translations={translations}
                  size="sm"
                />
              </div>
            </div>

            {/* Provider and rating info - Fixed height */}
            <div
              className={cn(
                "flex items-center gap-1 mt-0.5 h-4",
                "opacity-0 transition-opacity duration-300",
                "group-hover:opacity-100"
              )}
            >
              {game.provider && (
                <>
                  <Link
                    href={providerUrl}
                    className="text-grey-300 text-xs hover:text-white transition-colors truncate max-w-[100px]"
                    prefetch={false}
                  >
                    {game.provider.title}
                  </Link>
                  <span className="text-grey-300 text-xs">•</span>
                </>
              )}
              <div
                className="flex items-center gap-0.5"
                role="img"
                aria-label={`Rating: ${game.ratingAvg.toFixed(1)} out of 5`}
              >
                <svg
                  className="w-2.5 h-2.5 text-warning flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="text-[10px] text-grey-300">
                  {game.ratingAvg.toFixed(1)}/5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
