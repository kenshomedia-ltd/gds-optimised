// src/components/widgets/GameListWidget/GameListWidget.tsx
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { GameCard } from "@/components/games/GameCard/GameCard";
import { GameCardSkeleton } from "@/components/games/GameCard/GameCardSkeleton";
import { GameFilters } from "./GameFilters";
import { GameFiltersSkeleton } from "./GameFiltersSkeleton";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { PaginationServer } from "@/components/ui/Pagination/PaginationServer";
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
 * A comprehensive game listing widget with filtering and pagination/load more
 * Used on non-homepage pages like the slot-machine page
 *
 * Features:
 * - Server-side rendered initial games (works without JS)
 * - Progressive enhancement with client-side filtering
 * - Load more functionality OR Pagination (configurable)
 * - Responsive grid layout
 * - Loading states
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

  // State
  const [games, setGames] = useState<GameData[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [hasMore, setHasMore] = useState(true);
  const [localTotalGames, setLocalTotalGames] = useState(totalGames);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  // Initialize skeleton state based on whether we need to load filters
  const [showFiltersSkeleton, setShowFiltersSkeleton] = useState(
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
  const [selectedSort, setSelectedSort] = useState<string>(block.sortBy || "");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Calculate total pages (for client-side pagination)
  const calculatedTotalPages = useMemo(() => {
    // Use passed totalPages if no client-side data yet
    if (!isClientLoaded && totalPages > 0) {
      return totalPages;
    }
    return Math.ceil(localTotalGames / numberOfGames);
  }, [localTotalGames, numberOfGames, isClientLoaded, totalPages]);

  // Mark component as client-loaded and handle initial skeleton state
  useEffect(() => {
    setIsClientLoaded(true);
  }, []);

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && usePagination) {
      console.log("GameListWidget Pagination Debug:", {
        usePagination,
        isClientLoaded,
        totalPages: calculatedTotalPages,
        passedTotalPages: totalPages,
        totalGames: localTotalGames,
        passedTotalGames: totalGames,
        numberOfGames,
        baseUrl,
        currentPage: page,
        passedCurrentPage: currentPage,
      });
    }
  }, [
    usePagination,
    isClientLoaded,
    calculatedTotalPages,
    totalPages,
    localTotalGames,
    totalGames,
    numberOfGames,
    baseUrl,
    page,
    currentPage,
  ]);

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

  // Load filter options
  useEffect(() => {
    // If filters are not needed, don't show skeleton
    if (!showFilters) {
      setShowFiltersSkeleton(false);
      return;
    }

    // If we already have the data, don't show skeleton
    if (initialProviders && initialCategories) {
      setShowFiltersSkeleton(false);
      return;
    }

    // Show skeleton while loading
    setShowFiltersSkeleton(true);

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
          setShowFiltersSkeleton(false);
        }
      } catch (error) {
        console.error("Failed to load filter options:", error);
        setShowFiltersSkeleton(false);
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
          if (append && !usePagination) {
            // Load more mode: append to existing
            setGames((prev) => [...prev, ...result.games]);
          } else {
            // Pagination mode or initial load: replace
            setGames(result.games);
          }
          setLocalTotalGames(result.total);
          setHasMore(result.games.length === numberOfGames);
        } else {
          setHasMore(false);
          if (!append || usePagination) {
            setGames([]);
            setLocalTotalGames(0);
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
      usePagination,
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
        itemName="games"
        className="mt-8"
      />
    );
  };

  // Determine whether to show filters, skeleton, or nothing
  const shouldShowFilterArea = showFilters;

  return (
    <section className={cn("pb-8", className)} data-game-list-top>
      <div className="xl:container mx-auto">
        {/* Filter Panel - Show skeleton during loading */}
        {shouldShowFilterArea &&
          (showFiltersSkeleton ? (
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

        {/* Games Grid - Always rendered with initial games */}
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
                "px-6 py-3 rounded-lg font-medium transition-all",
                "bg-primary text-white hover:bg-primary-shade",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                loading && "animate-pulse"
              )}
            >
              {loading
                ? translations.loading || "Loading..."
                : translations.loadMore || "Load More Games"}
            </button>
          </div>
        )}

        {/* Client-side Pagination */}
        {usePagination && isClientLoaded && calculatedTotalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={calculatedTotalPages}
            onPageChange={handlePageChange}
            disabled={loading}
            showInfo={true}
            totalItems={localTotalGames}
            itemsPerPage={numberOfGames}
            itemName="games"
            translations={translations}
            className="mt-8"
          />
        )}

        {/* Server-side Pagination (shown when JS is disabled) */}
        {!isClientLoaded && renderServerPagination()}
      </div>
    </section>
  );
}
