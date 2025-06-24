// src/components/widgets/GameListWidget/GameListWidgetServer.tsx

import { GameListWidget } from "./GameListWidget";
import { GameCardSkeleton } from "@/components/games/GameCard/GameCardSkeleton";
import { GameFiltersSkeleton } from "./GameFiltersSkeleton";
import type { GamesCarouselBlock } from "@/types/dynamic-block.types";
import type { GameData } from "@/types/game.types";
import { cn } from "@/lib/utils/cn";
import { getFilterProviders, getGameCategories } from "@/app/actions/games";

interface GameListWidgetServerProps {
  block: GamesCarouselBlock;
  games?: GameData[];
  translations?: Record<string, string>;
}

/**
 * Server Component wrapper for GameListWidget
 *
 * Provides SSR and loading states for the GameListWidget
 * Pre-fetches filter data when filters are enabled
 */
export async function GameListWidgetServer({
  block,
  games = [],
  translations = {},
}: GameListWidgetServerProps) {
  const numberOfGames = block.numberOfGames || 24;
  const showFilters = block.showGameFilterPanel || false;

  // If no games are provided, show skeleton loader
  if (!games || games.length === 0) {
    return (
      <section className="py-8 lg:py-12">
        <div className="xl:container mx-auto px-4">
          {/* Show filter skeleton if filters are enabled */}
          {showFilters && <GameFiltersSkeleton className="mb-8" />}

          <div
            className={cn(
              "grid gap-3",
              "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            )}
          >
            {Array.from({ length: Math.min(numberOfGames, 24) }).map(
              (_, index) => (
                <GameCardSkeleton key={`skeleton-${index}`} />
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  // Pre-fetch filter data if filters are enabled
  let providers, categories;
  if (showFilters) {
    try {
      [providers, categories] = await Promise.all([
        getFilterProviders(),
        getGameCategories(),
      ]);
    } catch (error) {
      console.error("Failed to fetch filter data:", error);
      // Continue without filters rather than failing the entire component
      providers = undefined;
      categories = undefined;
    }
  }

  return (
    <GameListWidget
      block={block}
      games={games}
      translations={translations}
      providers={providers}
      categories={categories}
    />
  );
}
