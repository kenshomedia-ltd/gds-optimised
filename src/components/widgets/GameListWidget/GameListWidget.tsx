// src/components/widgets/GameListWidget/GameListWidget.tsx
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { GameCard } from "@/components/games/GameCard/GameCard";
import { GameCardSkeleton } from "@/components/games/GameCard/GameCardSkeleton";
import { GameFilters } from "./GameFilters";
import { GameFiltersSkeleton } from "./GameFiltersSkeleton";
import type {
  GameListWidgetProps,
  FilterOption,
} from "@/types/game-list-widget.types";
import type { GameData } from "@/types/game.types";
import { cn } from "@/lib/utils/cn";
import {
  getGames,
  getFilterProviders,
  getGameCategories,
} from "@/app/actions/games";

/**
 * GameListWidget Component
 *
 * A comprehensive game listing widget with filtering and pagination
 * Used on non-homepage pages like the slot-machine page
 *
 * Features:
 * - Filter by providers and categories
 * - Load more functionality
 * - Responsive grid layout
 * - Loading states
 * - Progressive enhancement
 * - Can receive pre-fetched filter data or fetch it client-side
 */
export function GameListWidget({
  block,
  games: initialGames = [],
  translations = {},
  className,
  providers: initialProviders,
  categories: initialCategories,
}: GameListWidgetProps) {
  const [games, setGames] = useState<GameData[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>(
    block.sortBy || "Newest"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [availableProviders, setAvailableProviders] = useState<FilterOption[]>(
    initialProviders || []
  );
  const [availableCategories, setAvailableCategories] = useState<
    FilterOption[]
  >(initialCategories || []);
  const [filtersLoading, setFiltersLoading] = useState(
    !initialProviders || !initialCategories
  );

  const numberOfGames = block.numberOfGames || 24;
  const showFilters = block.showGameFilterPanel || false;
  const showLoadMore = block.showGameMoreButton || false;

  // Calculate total pages
  const totalPages = Math.ceil(totalGames / numberOfGames) || 0;

  // Extract initial filter values from block configuration
  const initialProviderFilters = useMemo(
    () =>
      (block.gameProviders
        ?.map((p) => p.slotProvider?.slug)
        .filter(Boolean) as string[]) || [],
    [block.gameProviders]
  );

  const initialCategoryFilters = useMemo(
    () =>
      (block.gameCategories
        ?.map((c) => c.slotCategory?.slug)
        .filter(Boolean) as string[]) || [],
    [block.gameCategories]
  );

  // Fetch available filters on mount if not provided
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [providers, categories] = await Promise.all([
          getFilterProviders(),
          getGameCategories(),
        ]);
        setAvailableProviders(providers);
        setAvailableCategories(categories);
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      } finally {
        setFiltersLoading(false);
      }
    };

    // Only fetch if filters are needed and not pre-provided
    if (showFilters && (!initialProviders || !initialCategories)) {
      fetchFilters();
    } else {
      setFiltersLoading(false);
    }
  }, [showFilters, initialProviders, initialCategories]);

  // Load games function
  const loadGames = useCallback(
    async (pageNum: number, append = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const filters: Record<string, unknown> = {};

        // Add provider filters
        // Use selected providers if any, otherwise use initial filters from block
        const providerFilters =
          selectedProviders.length > 0
            ? selectedProviders
            : initialProviderFilters;

        if (providerFilters.length > 0) {
          filters.provider = {
            slug: { $in: providerFilters },
          };
        }

        // Add category filters
        // Use selected categories if any, otherwise use initial filters from block
        const categoryFilters =
          selectedCategories.length > 0
            ? selectedCategories
            : initialCategoryFilters;

        if (categoryFilters.length > 0) {
          filters.categories = {
            slug: { $in: categoryFilters },
          };
        }

        // Add search filter if query exists
        if (searchQuery && searchQuery.trim().length > 0) {
          filters.title = {
            $containsi: searchQuery.trim(),
          };
        }

        const result = await getGames({
          page: pageNum,
          pageSize: numberOfGames,
          sortBy: selectedSort,
          filters,
        });

        if (result.games && result.games.length > 0) {
          if (append) {
            setGames((prev) => [...prev, ...result.games]);
          } else {
            setGames(result.games);
          }
          setTotalGames(result.total);
          setHasMore(result.games.length === numberOfGames);
        } else {
          setHasMore(false);
          if (!append) {
            setGames([]);
            setTotalGames(0);
          }
        }
      } catch (error) {
        console.error("Failed to load games:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      selectedProviders,
      selectedCategories,
      initialProviderFilters,
      initialCategoryFilters,
      numberOfGames,
      selectedSort,
      searchQuery,
    ]
  );

  // Handle filter changes
  const handleProviderChange = useCallback((providers: string[]) => {
    setSelectedProviders(providers);
    setPage(1);
    setHasMore(true);
  }, []);

  const handleCategoryChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories);
    setPage(1);
    setHasMore(true);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSelectedSort(sort);
    setPage(1);
    setHasMore(true);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasMore(true);
  }, []);

  // Load more games
  const loadMoreGames = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadGames(nextPage, true);
  }, [hasMore, loading, page, loadGames]);

  // Reload games when filters change
  useEffect(() => {
    loadGames(1, false);
  }, [selectedProviders, selectedCategories, selectedSort, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className={cn("py-8 lg:py-12", className)}>
      <div className="xl:container mx-auto px-4">
        {/* Filter Panel */}
        {showFilters &&
          (filtersLoading ? (
            <GameFiltersSkeleton className="mb-8" />
          ) : (
            (availableProviders.length > 0 ||
              availableCategories.length > 0) && (
              <GameFilters
                providers={availableProviders}
                categories={availableCategories}
                selectedProviders={selectedProviders}
                selectedCategories={selectedCategories}
                selectedSort={selectedSort}
                searchQuery={searchQuery}
                onProviderChange={handleProviderChange}
                onCategoryChange={handleCategoryChange}
                onSortChange={handleSortChange}
                onSearchChange={handleSearchChange}
                translations={translations}
                className="mb-8"
              />
            )
          ))}

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
              priority={index < 6}
              loading={index < 12 ? "eager" : "lazy"}
              index={index}
            />
          ))}

          {/* Loading skeletons */}
          {loading &&
            !games.length &&
            Array.from({ length: numberOfGames }).map((_, index) => (
              <GameCardSkeleton key={`skeleton-${index}`} />
            ))}
        </div>

        {/* No results message */}
        {!loading && games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {translations?.noGamesFound ||
                "No games found matching your filters."}
            </p>
          </div>
        )}

        {/* Load More Button */}
        {showLoadMore && hasMore && games.length > 0 && (
          <div className="text-center mt-8 space-y-3">
            {/* Load More Button */}
            <button
              onClick={loadMoreGames}
              disabled={loading}
              className={cn(
                "inline-flex items-center px-8 py-3",
                "bg-primary text-white font-medium rounded-lg",
                "hover:bg-primary/90 transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {translations?.loading || "Loading..."}
                </>
              ) : (
                translations?.loadMore || "Load More Games"
              )}
            </button>
            {/* Pagination Info */}
            {totalPages > 0 && (
              <p className="text-xs text-white">
                {translations?.page || "Page"} {page} {translations?.of || "of"}{" "}
                {totalPages}
                {totalGames > 0 && (
                  <span className="ml-2">
                    ({games.length} {translations?.of || "of"} {totalGames})
                    {/* {translations?.games || "games"}) */}
                  </span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
