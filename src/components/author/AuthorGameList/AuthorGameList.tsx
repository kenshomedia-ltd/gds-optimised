// src/components/author/AuthorGameList/AuthorGameList.tsx
"use client";

import { useState, useCallback } from "react";
import { GameCard } from "@/components/games/GameCard/GameCard";
import { GameCardSkeleton } from "@/components/games/GameCard/GameCardSkeleton";
import { getAuthorGames } from "@/app/actions/authors";
import type { GameData } from "@/types/game.types";
import { cn } from "@/lib/utils/cn";

interface AuthorGameListProps {
  authorId: number;
  initialGames: GameData[];
  totalGames: number;
  translations?: Record<string, string>;
  className?: string;
}

/**
 * AuthorGameList Component
 *
 * Displays games created by an author with load more functionality
 */
export function AuthorGameList({
  authorId,
  initialGames,
  totalGames,
  translations = {},
  className,
}: AuthorGameListProps) {
  const [games, setGames] = useState<GameData[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(totalGames > initialGames.length);

  const loadMoreGames = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const { games: newGames, pagination } = await getAuthorGames(
        authorId,
        nextPage,
        12
      );

      if (newGames.length > 0) {
        setGames((prev) => [...prev, ...newGames]);
        setPage(nextPage);
        setHasMore(games.length + newGames.length < pagination.total);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more games:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [authorId, page, games.length, loading, hasMore]);

  return (
    <div className={cn("w-full", className)}>
      {/* Games Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            translations={translations}
            priority={index < 6}
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

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreGames}
            disabled={loading}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              "bg-white/10 backdrop-blur-sm text-white",
              "hover:bg-white/20 border border-white/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              loading && "animate-pulse"
            )}
          >
            {loading
              ? translations.loading || "Loading..."
              : translations.loadMoreGames || "Load More Games"}
          </button>
        </div>
      )}
    </div>
  );
}
