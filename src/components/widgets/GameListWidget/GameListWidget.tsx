// src/components/widgets/GameListWidget/GameListWidget.tsx
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { GameCard } from "@/components/games/GameCard/GameCard";
import { GameCardSkeleton } from "@/components/games/GameCard/GameCardSkeleton";
import { GameFilters } from "./GameFilters";
import { MobileGameFilters } from "./MobileGameFilters";
import { GameFiltersSkeleton } from "./GameFiltersSkeleton";
import { MobileGameFiltersSkeleton } from "./MobileGameFiltersSkeleton";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { PaginationServer } from "@/components/ui/Pagination/PaginationServer";
import type {
  GameListWidgetProps,
  FilterOption,
} from "@/types/game-list-widget.types";
import type { GameData } from "@/types/game.types";
import { cn } from "@/lib/utils/cn";
import { normalizeGameSort } from "@/lib/utils/sort-mappings";
import {
  getGames,
  getFilterProviders,
  getGameCategories,
} from "@/app/actions/games";

/**
 * GameListWidget Component
 *
 * A comprehensive game listing widget with filtering and pagination/load more
 * Used on non-homepage pages like the slot-machine page
 *
 * Features:
 * - Server-side rendered initial games (works without JS)
 * - Progressive enhancement with client-side filtering
 * - Load more functionality OR Pagination (configurable)
 * - Responsive grid layout
 * - Loading states
 * - Mobile and desktop filter support
 */
export function GameListWidget({
  block,
  games: initialGames = [],
  translations = {},
  className,
  providers: initialProviders,
  categories: initialCategories,
  usePagination = false,
  currentPage = 1,
  totalPages = 1,
  totalGames = 0,
  baseUrl = "",
}: GameListWidgetProps & {
  usePagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalGames?: number;
  baseUrl?: string;
}) {
  // Constants
  const numberOfGames = block.numberOfGames || 24;
  const showFilters = block.showGameFilterPanel || false;
  const showLoadMore = block.showGameMoreButton || false;

  // Normalize the initial sort value from CMS to GameFilters format
  const normalizedInitialSort = useMemo(() => {
    return normalizeGameSort(block.sortBy, "Most Popular");
  }, [block.sortBy]);

  // State
  const [games, setGames] = useState<GameData[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [hasMore, setHasMore] = useState(true);
  const [localTotalGames, setLocalTotalGames] = useState(totalGames);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Simplified loading state (similar to casino filters)
  const [filtersLoading, setFiltersLoading] = useState(
    showFilters && (!initialProviders || !initialCategories)
  );

  // Filter states
  const [availableProviders, setAvailableProviders] = useState<FilterOption[]>(
    initialProviders || []
  );
  const [availableCategories, setAvailableCategories] = useState<
    FilterOption[]
  >(initialCategories || []);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>(
    normalizedInitialSort
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Calculate total pages (for client-side pagination)
  const calculatedTotalPages = useMemo(() => {
    // Use passed totalPages if no client-side data yet
    if (!isClientLoaded && totalPages > 0) {
      return totalPages;
    }
    return Math.ceil(localTotalGames / numberOfGames);
  }, [localTotalGames, numberOfGames, isClientLoaded, totalPages]);

  // Mark component as client-loaded
  useEffect(() => {
    setIsClientLoaded(true);
  }, []);

  // Extract initial filters from block
  const initialProviderFilters = useMemo(() => {
    return (
      block.gameProviders?.map((p) => p.slotProvider?.slug).filter(Boolean) ||
      []
    );
  }, [block.gameProviders]);

  const initialCategoryFilters = useMemo(() => {
    return (
      block.gameCategories?.map((c) => c.slotCategory?.slug).filter(Boolean) ||
      []
    );
  }, [block.gameCategories]);

  // Simplified filter loading (casino-style pattern)
  useEffect(() => {
    if (!showFilters) {
      setFiltersLoading(false);
      return;
    }

    if (initialProviders && initialCategories) {
      setFiltersLoading(false);
      return;
    }

    setFiltersLoading(true);

    let cancelled = false;

    const loadFilterOptions = async () => {
      try {
        const [providersData, categoriesData] = await Promise.all([
          initialProviders
            ? Promise.resolve(initialProviders)
            : getFilterProviders(),
          initialCategories
            ? Promise.resolve(initialCategories)
            : getGameCategories(),
        ]);

        if (!cancelled) {
          setAvailableProviders(providersData || []);
          setAvailableCategories(categoriesData || []);
          setFiltersLoading(false); // Simple boolean toggle
        }
      } catch (error) {
        console.error("Failed to load filter options:", error);
        setFiltersLoading(false); // Always stop loading on error
      }
    };

    loadFilterOptions();

    return () => {
      cancelled = true;
    };
  }, [showFilters, initialProviders, initialCategories]);

  // Load games function
  const loadGames = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (loading) return;

      try {
        setLoading(true);

        // Build filters
        const filters: Record<string, unknown> = {};

        // Add provider filters
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
        const categoryFilters =
          selectedCategories.length > 0
            ? selectedCategories
            : initialCategoryFilters;

        if (categoryFilters.length > 0) {
          filters.categories = {
            slug: { $in: categoryFilters },
          };
        }

        // Get games with filters and pagination
        const gamesData = await getGames({
          page: pageNum,
          pageSize: numberOfGames,
          filters,
          sortBy: selectedSort, // Use 'sortBy' instead of 'sort'
        });

        // Update games
        if (append) {
          setGames((prev) => [...prev, ...gamesData.games]);
        } else {
          setGames(gamesData.games);
        }

        // Update pagination state
        setLocalTotalGames(gamesData.total);
        // Calculate pageCount since it's not in the response
        const calculatedPageCount = Math.ceil(gamesData.total / numberOfGames);
        setHasMore(pageNum < calculatedPageCount);
      } catch (error) {
        console.error("Failed to load games:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      selectedProviders,
      selectedCategories,
      selectedSort,
      numberOfGames,
      initialProviderFilters,
      initialCategoryFilters,
    ]
  );

  // Filter change handlers
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
    const normalizedSort = normalizeGameSort(sort, "Most Popular");
    setSelectedSort(normalizedSort);
    setPage(1);
    setHasMore(true);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasMore(true);
  }, []);

  // Handle page change (pagination mode)
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage === page || newPage < 1 || newPage > calculatedTotalPages)
        return;
      setPage(newPage);
      // Scroll to top of the game list
      const element = document.querySelector("[data-game-list-top]");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [page, calculatedTotalPages]
  );

  // Load more games
  const loadMoreGames = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadGames(nextPage, true);
  }, [hasMore, loading, page, loadGames]);

  // Reload games when filters change (only on client)
  useEffect(() => {
    if (!isClientLoaded) return; // Don't reload on initial mount

    if (usePagination) {
      // In pagination mode, reload for current page
      loadGames(page, false);
    } else {
      // In load more mode, reset to page 1
      setPage(1);
      loadGames(1, false);
    }
  }, [selectedProviders, selectedCategories, selectedSort, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load games when page changes in pagination mode (only on client)
  useEffect(() => {
    if (!isClientLoaded) return; // Don't reload on initial mount

    if (usePagination && page > 1) {
      loadGames(page, false);
    }
  }, [page, usePagination]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render server-side pagination as fallback
  const renderServerPagination = () => {
    if (!usePagination || !baseUrl) return null;

    // Use initial values for server-side render
    const serverTotalPages =
      totalPages || Math.ceil(totalGames / numberOfGames);

    if (serverTotalPages <= 1) return null;

    return (
      <PaginationServer
        currentPage={currentPage}
        totalPages={serverTotalPages}
        baseUrl={baseUrl}
        translations={translations}
        showInfo={true}
        totalItems={totalGames}
        itemsPerPage={numberOfGames}
        itemName={translations.slots || "games"}
        className="mt-8"
      />
    );
  };

  return (
    <section className={cn("pb-8 px-2", className)} data-game-list-top>
      <div className="xl:container mx-auto px-4">
        {/* Filters - Use same reliable pattern as casino filters */}
        {showFilters && (
          <div className="mb-6">
            {!filtersLoading ? (
              <>
                {/* Desktop Filters - Hidden on mobile */}
                <div className="hidden md:block">
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
                </div>

                {/* Mobile Filters - Hidden on desktop */}
                <div className="block md:hidden">
                  <MobileGameFilters
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
                    className="mb-4"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Skeleton Loading */}
                <div className="hidden md:block">
                  <GameFiltersSkeleton className="mb-8" />
                </div>
                <div className="block md:hidden">
                  <MobileGameFiltersSkeleton className="mb-4" />
                </div>
              </>
            )}
          </div>
        )}

        {/* Games Grid */}
        <div
          className={cn(
            "grid gap-3",
            "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          )}
        >
          {/* Show games (initial or filtered) */}
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

          {/* Show loading skeletons when loading more games */}
          {loading &&
            usePagination &&
            games.length === 0 &&
            Array.from({ length: 12 }).map((_, index) => (
              <GameCardSkeleton key={`skeleton-${index}`} />
            ))}
        </div>

        {!loading && games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {translations.noGamesFound ||
                "No games found matching your criteria."}
            </p>
          </div>
        )}

        {/* Load More Button (for load more mode) */}
        {!usePagination && showLoadMore && hasMore && games.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMoreGames}
              disabled={loading}
              className={cn(
                "px-6 py-3 w-full sm:w-3/5 md:w-2/5 rounded-lg font-medium transition-all",
                "bg-secondary uppercase text-white hover:bg-secondary-shade",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                loading && "animate-pulse"
              )}
            >
              {loading
                ? translations.loading || "Loading..."
                : translations.loadMore || "Load More"}
            </button>
          </div>
        )}

        {/* Client-side Pagination (only when JS is loaded) */}
        {isClientLoaded && usePagination && calculatedTotalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={calculatedTotalPages}
            onPageChange={handlePageChange}
            showInfo={true}
            totalItems={localTotalGames}
            itemsPerPage={numberOfGames}
            itemName={translations.slots || "games"}
            translations={translations}
            className="mt-8"
          />
        )}

        {/* Server-side Pagination Fallback (SSR/no-JS) */}
        {!isClientLoaded && renderServerPagination()}
      </div>
    </section>
  );
}
