// src/components/widgets/CasinoList/CasinoListWidget.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { CasinoTable } from "@/components/casino/CasinoTable/CasinoTable";
import { CasinoFilters } from "./CasinoFilters";
import { CasinoFiltersSkeleton } from "./CasinoFiltersSkeleton";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  CasinoListWidgetProps,
  CasinoFiltersState,
  CasinoFilterOption,
} from "@/types/casino-filters.types";
import type { CasinoData } from "@/types/casino.types";
import { cn } from "@/lib/utils/cn";
import { getCasinos, getCasinoProviders } from "@/app/actions/casinos";

// Initial filter state
const initialFilters: CasinoFiltersState = {
  bonusKey: "bonusSection",
  condition: "",
  amount: "",
  wagering: "",
  speed: "",
  providers: [],
  sort: "ratingAvg:desc",
};

/**
 * CasinoListWidget Component
 *
 * Enhanced CasinoList component with filtering and pagination capabilities
 * Features:
 * - Progressive enhancement (works without JS)
 * - Displays casino comparison table
 * - Optional filters when showCasinoFilters is true
 * - Pagination/Load More functionality
 * - Responsive layout
 * - Real-time filtering
 * - Loading states
 * - No layout shift on initial render
 */
export function CasinoListWidget({
  block,
  casinos: initialCasinos,
  translations = {},
  className,
  providers: initialProviders,
  showCasinoFilters = false,
  currentPage: initialPage = 1,
}: CasinoListWidgetProps) {
  // Pagination settings from block
  const showLoadMore = block.showLoadMore || false;
  const itemsPerPage = block.numberPerLoadMore || 10;
  const usePagination = block.usePagination || false;

  // Calculate initial displayed casinos to prevent layout shift
  const getInitialDisplayedCasinos = () => {
    if (!initialCasinos.length) return [];

    const startIndex = (initialPage - 1) * itemsPerPage;
    const endIndex =
      showLoadMore || usePagination
        ? Math.min(startIndex + itemsPerPage, initialCasinos.length)
        : initialCasinos.length;

    return initialCasinos.slice(startIndex, endIndex);
  };

  // State management
  const [allCasinos, setAllCasinos] = useState<CasinoData[]>(initialCasinos);
  const [displayedCasinos, setDisplayedCasinos] = useState<CasinoData[]>(
    getInitialDisplayedCasinos()
  );
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<CasinoFilterOption[]>(
    initialProviders || []
  );
  const [providersLoading, setProvidersLoading] = useState(false);
  const [filters, setFilters] = useState<CasinoFiltersState>(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(allCasinos.length / itemsPerPage);
  const hasMore = currentPage < totalPages;

  // Use showCasinoFilters from block if available, otherwise use prop
  const shouldShowFilters = block.showCasinoFilters ?? showCasinoFilters;

  // Update displayed casinos when allCasinos changes (after filtering)
  useEffect(() => {
    // Only update if filters have been applied
    if (hasAppliedFilters) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex =
        showLoadMore || usePagination
          ? Math.min(startIndex + itemsPerPage, allCasinos.length)
          : allCasinos.length;
      setDisplayedCasinos(allCasinos.slice(startIndex, endIndex));
    }
  }, [
    allCasinos,
    currentPage,
    itemsPerPage,
    showLoadMore,
    usePagination,
    hasAppliedFilters,
  ]);

  // Fetch providers for filters if needed
  useEffect(() => {
    const fetchProviders = async () => {
      if (!shouldShowFilters || providers.length > 0) {
        return;
      }

      setProvidersLoading(true);
      try {
        const providersData = await getCasinoProviders();
        setProviders(providersData);
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setProvidersLoading(false);
      }
    };

    fetchProviders();
  }, [shouldShowFilters, providers.length]);

  // Fetch filtered casinos
  const fetchFilteredCasinos = useCallback(async () => {
    if (!shouldShowFilters) return;

    setLoading(true);
    setHasAppliedFilters(true);

    try {
      const response = await getCasinos({
        filters: {
          bonusKey: filters.bonusKey,
          condition: filters.condition,
          amount: filters.amount,
          wagering: filters.wagering,
          speed: filters.speed,
          providers: filters.providers,
          sort: filters.sort,
        },
        pageSize: 100, // Get all for client-side pagination
      });

      setAllCasinos(response.casinos);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error("Failed to fetch filtered casinos:", error);
      // Keep the initial casinos on error
    } finally {
      setLoading(false);
    }
  }, [filters, shouldShowFilters]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: Partial<CasinoFiltersState>) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        ...newFilters,
      }));
    },
    []
  );

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    setAllCasinos(initialCasinos);
    setHasAppliedFilters(false);
    setCurrentPage(1);

    // Reset displayed casinos to initial state
    const endIndex =
      showLoadMore || usePagination
        ? Math.min(itemsPerPage, initialCasinos.length)
        : initialCasinos.length;
    setDisplayedCasinos(initialCasinos.slice(0, endIndex));
  }, [initialCasinos, showLoadMore, usePagination, itemsPerPage]);

  // Fetch casinos when filters change
  useEffect(() => {
    // Only fetch if filters have actually changed from initial state
    const filtersChanged =
      JSON.stringify(filters) !== JSON.stringify(initialFilters);

    if (shouldShowFilters && filtersChanged) {
      fetchFilteredCasinos();
    }
  }, [filters, shouldShowFilters, fetchFilteredCasinos]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;

    const nextPage = currentPage + 1;
    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allCasinos.length);
    const newCasinos = allCasinos.slice(startIndex, endIndex);

    setDisplayedCasinos((prev) => [...prev, ...newCasinos]);
    setCurrentPage(nextPage);
  }, [currentPage, itemsPerPage, allCasinos, hasMore, loading]);

  // Handle page change (for pagination)
  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage || page < 1 || page > totalPages) return;

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, allCasinos.length);
      setDisplayedCasinos(allCasinos.slice(startIndex, endIndex));
      setCurrentPage(page);

      // Scroll to top of casino list
      const element = document.querySelector("[data-casino-list-top]");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [currentPage, totalPages, itemsPerPage, allCasinos]
  );

  // Filter out any null casinos
  const validCasinos = displayedCasinos.filter(Boolean);

  // Don't show component if no casinos and no filters
  if (!shouldShowFilters && validCasinos.length === 0 && !loading) {
    return null;
  }

  return (
    <section className={cn("relative", className)} data-casino-list-top>
      <div className="relative xl:container px-2 z-20">
        {/* Title */}
        {block.heading && (
          <div className="mb-[30px]">
            <h2 className="text-2xl md:text-3xl font-bold text-heading-text text-center">
              {block.heading}
            </h2>
          </div>
        )}

        {/* Filters */}
        {shouldShowFilters && (
          <div className="mb-6">
            {providersLoading ? (
              <CasinoFiltersSkeleton />
            ) : (
              <CasinoFilters
                providers={providers}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                translations={translations}
                loading={loading}
              />
            )}
          </div>
        )}

        {/* Casino Table */}
        <div className="pt-2.5">
          {loading && hasAppliedFilters ? (
            <div className="table-wrapper bg-casino-table-bkg rounded-[6px] overflow-hidden relative z-[8] mb-5">
              <div className="w-full p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ) : (
            validCasinos.length > 0 && (
              <CasinoTable
                casinos={validCasinos}
                showCasinoTableHeader={block.showCasinoTableHeader !== false}
                translations={translations}
              />
            )
          )}

          {/* No results message */}
          {!loading && validCasinos.length === 0 && hasAppliedFilters && (
            <div className="text-center py-8 text-gray-500">
              {translations.noResultsFound ||
                "No casinos found matching your filters."}
            </div>
          )}
        </div>

        {/* Pagination or Load More */}
        {validCasinos.length > 0 &&
          (showLoadMore || usePagination) &&
          totalPages > 1 && (
            <div className="flex justify-center mt-8">
              {usePagination ? (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  showInfo={true}
                  totalItems={allCasinos.length}
                  itemsPerPage={itemsPerPage}
                  itemName="casinos"
                  translations={translations}
                />
              ) : (
                hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className={cn(
                      "px-6 py-3 mb-8 w-full sm:w-3/5 md:w-2/5 rounded-lg font-medium transition-all",
                      "bg-secondary uppercase text-white hover:bg-secondary-shade",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      loading && "animate-pulse"
                    )}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        {translations.loading || "Loading..."}
                      </span>
                    ) : (
                      translations.loadMore || "Load More"
                    )}
                  </button>
                )
              )}
            </div>
          )}

        {/* Casino List Link */}
        {block.link && (
          <div className="flex justify-center mt-8">
            <Link
              href={block.link.url}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              {block.link.label}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
