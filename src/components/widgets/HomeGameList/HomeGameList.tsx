// src/components/homepage/HomeGameList/HomeGameList.tsx
"use client";

import { Suspense } from "react";
import { GameList } from "@/components/games/GameList/GameList";
import { GameCardSkeleton } from "@/components/games/GameCard/GameCardSkeleton";
import type { HomeGameListBlock, GameData } from "@/types/game.types";
import { cn } from "@/lib/utils/cn";

interface HomeGameListProps {
  block: HomeGameListBlock;
  games: GameData[];
  translations?: Record<string, string>;
}

/**
 * HomeGameList Component
 *
 * Wrapper component for homepage game list
 * Handles the specific layout and styling for homepage
 */
export function HomeGameList({
  block,
  games,
  translations,
}: HomeGameListProps) {
  return (
    <Suspense
      fallback={
        <div className="py-8 lg:py-12">
          <div className="xl:container mx-auto px-4">
            <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-6 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <GameCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <GameList
        block={block}
        games={games}
        translations={translations}
        className="relative z-20"
      />
    </Suspense>
  );
}
