// src/components/games/GameList/GameList.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
// import Link from "next/link";
import { GameCard } from "../GameCard/GameCard";
import { GameCardSkeleton } from "../GameCard/GameCardSkeleton";
import type { GameListProps, GameData } from "@/types/game.types";
import { cn } from "@/lib/utils/cn";

/**
 * GameList Component
 *
 * Features:
 * - Progressive enhancement with SSR
 * - Lazy loading with Intersection Observer
 * - Responsive grid layout
 * - Performance optimized with React.memo
 * - Accessible navigation
 */
export function GameList({
  block,
  games: initialGames,
  translations = {},
  className,
}: GameListProps) {
  const [games, setGames] = useState<GameData[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const numberOfGames = block.numberOfGames || 6;
  const showLoadMore = games.length >= numberOfGames;

  // Load more games function
  const loadMoreGames = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // Fetch more games from API
      const response = await fetch(
        `/api/games?page=${page + 1}&pageSize=${numberOfGames}&providers=${
          block.providers?.map((p) => p.slotProvider?.slug).join(",") || ""
        }`
      );
      const data = await response.json();

      if (data.games && data.games.length > 0) {
        setGames((prev) => [...prev, ...data.games]);
        setPage((prev) => prev + 1);
        setHasMore(data.games.length === numberOfGames);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more games:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, numberOfGames, loading, hasMore, block.providers]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!showLoadMore || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreGames();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const sentinel = document.querySelector("#load-more-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [showLoadMore, hasMore, loading, loadMoreGames]);

  return (
    <section className={cn("py-8 lg:py-12", className)}>
      <div className="xl:container mx-auto px-2">
        {/* Title */}
        {block.gameListTitle && (
          <h2 className="text-2xl md:text-3xl font-bold text-heading-text mb-6 text-center">
            {block.gameListTitle}
          </h2>
        )}

        {/* Games Grid */}
        <div
          className={cn(
            "grid gap-3",
            "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          )}
        >
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              translations={translations}
              priority={index < 6} // Prioritize first 6 games for LCP
              loading={index < 12 ? "eager" : "lazy"}
              index={index}
            />
          ))}

          {/* Loading skeletons */}
          {loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <GameCardSkeleton key={`skeleton-${index}`} />
            ))}
        </div>

        {/* Load more trigger */}
        {showLoadMore && hasMore && (
          <div
            id="load-more-sentinel"
            className="h-10 mt-8"
            aria-hidden="true"
          />
        )}

        {/* View all link */}
        {/* {block.link && (
          <div className="text-center mt-8">
            <Link
              href={block.link.url}
              className={cn(
                "inline-flex items-center px-8 py-3",
                "bg-primary text-white font-medium rounded-lg",
                "hover:bg-primary/90 transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              )}
            >
              {block.link.label}
            </Link>
          </div>
        )} */}
      </div>
    </section>
  );
}
