// src/components/widgets/CasinoList/CasinoListWidget.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { CasinoTable } from "@/components/casino/CasinoTable/CasinoTable";
import { CasinoFilters } from "./CasinoFilters";
import { CasinoFiltersSkeleton } from "./CasinoFiltersSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  CasinoListWidgetProps,
  CasinoFiltersState,
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
 * Enhanced CasinoList component with filtering capabilities
 * Features:
 * - Displays casino comparison table
 * - Optional filters when showCasinoFilters is true
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
}: CasinoListWidgetProps) {
  const [casinos, setCasinos] = useState<CasinoData[]>(initialCasinos);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState(initialProviders || []);
  const [providersLoading, setProvidersLoading] = useState(!initialProviders);
  const [filters, setFilters] = useState<CasinoFiltersState>(initialFilters);

  // Use showCasinoFilters from block if available, otherwise use prop
  const shouldShowFilters = block.showCasinoFilters ?? showCasinoFilters;

  // Fetch providers if not provided and filters are shown
  useEffect(() => {
    const fetchProviders = async () => {
      if (!shouldShowFilters || initialProviders) {
        setProvidersLoading(false);
        return;
      }

      try {
        const fetchedProviders = await getCasinoProviders();
        setProviders(fetchedProviders);
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setProvidersLoading(false);
      }
    };

    fetchProviders();
  }, [shouldShowFilters, initialProviders]);

  // Load casinos with filters
  const loadCasinos = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await getCasinos({
        page: 1,
        pageSize: 50,
        filters,
      });

      setCasinos(result.casinos);
    } catch (error) {
      console.error("Failed to load casinos:", error);
      // Keep initial casinos on error
    } finally {
      setLoading(false);
    }
  }, [filters, loading]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilters: Partial<CasinoFiltersState>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Reload casinos when filters change
  useEffect(() => {
    if (shouldShowFilters) {
      loadCasinos();
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show skeleton during initial load
  if (
    shouldShowFilters &&
    (providersLoading || (filters !== initialFilters && loading))
  ) {
    return (
      <section className={cn("relative", className)}>
        <div className="relative xl:container px-2 z-20">
          {/* Title */}
          {block.heading && (
            <div className="mb-[30px]">
              <h2 className="text-2xl md:text-3xl font-bold text-heading-text text-center">
                {block.heading}
              </h2>
            </div>
          )}

          {/* Filters Skeleton */}
          <div className="mb-6">
            <CasinoFiltersSkeleton />
          </div>

          {/* Table Skeleton */}
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

  // Filter out any null casinos
  const validCasinos = casinos.filter(Boolean);

  if (!validCasinos.length && !loading) return null;

  return (
    <section className={cn("relative", className)}>
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

        {/* View All Link */}
        {block.link && (
          <div className="flex justify-center">
            <Link
              href={block.link.url}
              className="btn self-center mt-5 btn-secondary min-w-[300px] md:min-w-[500px] inline-flex items-center justify-center"
            >
              {block.link.label}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
