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

  // State management
  const [allCasinos, setAllCasinos] = useState<CasinoData[]>(initialCasinos);
  const [displayedCasinos, setDisplayedCasinos] = useState<CasinoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<CasinoFilterOption[]>(
    initialProviders || []
  );
  const [providersLoading, setProvidersLoading] = useState(!initialProviders);
  const [filters, setFilters] = useState<CasinoFiltersState>(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(allCasinos.length / itemsPerPage);
  const hasMore = currentPage < totalPages;

  // Use showCasinoFilters from block if available, otherwise use prop
  const shouldShowFilters = block.showCasinoFilters ?? showCasinoFilters;

  // Initialize displayed casinos based on current page
  useEffect(() => {
    if (!isInitialized && allCasinos.length > 0) {
      // On first load, show casinos based on current page
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = showLoadMore
        ? startIndex + itemsPerPage
        : allCasinos.length;
      setDisplayedCasinos(allCasinos.slice(0, endIndex));
      setIsInitialized(true);
    }
  }, [allCasinos, currentPage, itemsPerPage, showLoadMore, isInitialized]);

  // Fetch providers for filters if needed
  useEffect(() => {
    const fetchProviders = async () => {
      if (shouldShowFilters && !providers.length && !providersLoading) {
        setProvidersLoading(true);
        try {
          const providersData = await getCasinoProviders();
          setProviders(providersData);
        } catch (error) {
          console.error("Failed to fetch providers:", error);
        } finally {
          setProvidersLoading(false);
        }
      }
    };

    fetchProviders();
  }, [shouldShowFilters, providers.length, providersLoading]);

  // Fetch filtered casinos
  const fetchFilteredCasinos = useCallback(async () => {
    if (!shouldShowFilters) return;

    setLoading(true);
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

      // Show first page of results
      const endIndex = showLoadMore ? itemsPerPage : response.casinos.length;
      setDisplayedCasinos(response.casinos.slice(0, endIndex));
    } catch (error) {
      console.error("Failed to fetch filtered casinos:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, shouldShowFilters, showLoadMore, itemsPerPage]);

  // Handle filter changes - FIXED: Now accepts Partial<CasinoFiltersState>
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
  }, []);

  // Fetch casinos when filters change
  useEffect(() => {
    if (shouldShowFilters && isInitialized) {
      fetchFilteredCasinos();
    }
  }, [filters, shouldShowFilters, fetchFilteredCasinos, isInitialized]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;

    const nextPage = currentPage + 1;
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const newCasinos = allCasinos.slice(startIndex, endIndex);

    setDisplayedCasinos((prev) => [...prev, ...newCasinos]);
    setCurrentPage(nextPage);
  }, [currentPage, itemsPerPage, allCasinos, hasMore, loading]);

  // Handle page change (for pagination)
  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage || page < 1 || page > totalPages) return;

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
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

  // Show skeleton while filters are loading
  if (shouldShowFilters && providersLoading && !allCasinos.length) {
    return (
      <section className={cn("relative", className)}>
        <div className="relative xl:container px-2 z-20">
          {block.heading && (
            <div className="mb-[30px]">
              <h2 className="text-2xl md:text-3xl font-bold text-heading-text text-center">
                {block.heading}
              </h2>
            </div>
          )}
          <CasinoFiltersSkeleton />
          <div className="pt-2.5">
            <div className="table-wrapper bg-casino-table-bkg rounded-[6px] overflow-hidden relative z-[8] mb-5">
              <div className="w-full p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Filter out any null casinos and handle empty initial state
  const validCasinos = displayedCasinos.filter(Boolean);

  // If we have no casinos at all (not even initial ones), don't show skeleton
  if (allCasinos.length === 0 && !loading && !shouldShowFilters) {
    return null;
  }

  // If we have initial casinos but haven't displayed them yet, show them
  if (!isInitialized && allCasinos.length > 0 && validCasinos.length === 0) {
    const endIndex = showLoadMore ? itemsPerPage : allCasinos.length;
    const initialCasinos = allCasinos.slice(0, endIndex).filter(Boolean);

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

          {/* Casino Table */}
          <div className="pt-2.5">
            <CasinoTable
              casinos={initialCasinos}
              showCasinoTableHeader={block.showCasinoTableHeader !== false}
              translations={translations}
            />
          </div>

          {/* Pagination or Load More for initial display */}
          {showLoadMore && initialCasinos.length < allCasinos.length && (
            <div className="flex justify-center mt-8">
              {block.usePagination ? (
                <Pagination
                  currentPage={1}
                  totalPages={Math.ceil(allCasinos.length / itemsPerPage)}
                  onPageChange={() => {}} // Will be handled once initialized
                  showInfo={true}
                  totalItems={allCasinos.length}
                  itemsPerPage={itemsPerPage}
                  itemName="casinos"
                  translations={translations}
                />
              ) : (
                <button
                  onClick={() => setIsInitialized(true)}
                  className="btn btn-secondary min-w-[200px] inline-flex items-center justify-center"
                >
                  {translations.loadMore || "Load More"}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (!validCasinos.length && !loading) return null;

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
        {shouldShowFilters && !providersLoading && (
          <div className="mb-6">
            <CasinoFilters
              providers={providers}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              translations={translations}
              loading={loading}
            />
          </div>
        )}

        {/* Casino Table or Loading State */}
        <div className="pt-2.5">
          {loading && shouldShowFilters ? (
            <div className="table-wrapper bg-casino-table-bkg rounded-[6px] overflow-hidden relative z-[8] mb-5">
              <div className="w-full p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <CasinoTable
              casinos={validCasinos}
              showCasinoTableHeader={block.showCasinoTableHeader !== false}
              translations={translations}
            />
          )}
        </div>

        {/* Pagination or Load More */}
        {showLoadMore && totalPages > 1 && !loading && (
          <div className="flex justify-center mt-8">
            {block.usePagination ? (
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
                  className="btn btn-secondary min-w-[200px] inline-flex items-center justify-center"
                >
                  {translations.loadMore || "Load More"}
                </button>
              )
            )}
          </div>
        )}

        {/* View All Link */}
        {block.link && !showLoadMore && (
          <div className="flex justify-center mt-5">
            <Link
              href={block.link.url}
              className="btn self-center btn-secondary min-w-[300px] md:min-w-[500px] inline-flex items-center justify-center"
            >
              {block.link.label}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
