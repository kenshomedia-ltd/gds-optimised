// src/components/widgets/RelatedCasinos/RelatedCasinos.tsx
"use client";

import { useState, useEffect } from "react";
import { CasinoTable } from "@/components/casino";
import { Skeleton } from "@/components/ui";
import { getRelatedCasinos } from "@/lib/strapi/related-casinos-loader";
import type { RelatedCasinosProps } from "@/types/related-casinos.types";
import type { CasinoData } from "@/types/casino.types";

/**
 * Client component for Related Casinos widget
 * Used when provider data is dynamic or needs client-side fetching
 */
export function RelatedCasinos({
  provider,
  translations = {},
  className,
  maxCasinos = 5,
  showTitle = true,
}: RelatedCasinosProps) {
  const [casinos, setCasinos] = useState<CasinoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCasinos() {
      if (!provider?.slug) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch casinos - in a real implementation, this would be a server action
        const relatedCasinos = await getRelatedCasinos(
          provider.slug,
          maxCasinos
        );

        if (mounted) {
          setCasinos(relatedCasinos);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load casinos"
          );
          console.error("Failed to fetch related casinos:", err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCasinos();

    return () => {
      mounted = false;
    };
  }, [provider?.slug, maxCasinos]);

  // Don't render if no provider
  if (!provider?.slug) {
    return null;
  }

  // Show loading skeleton
  if (isLoading) {
    return <RelatedCasinosSkeleton showTitle={showTitle} />;
  }

  // Show error state
  if (error) {
    return (
      <div className={className}>
        <p className="text-center text-red-500">
          {translations.errorLoadingCasinos || "Failed to load related casinos"}
        </p>
      </div>
    );
  }

  // Don't render if no casinos
  if (!casinos || casinos.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      {showTitle && (
        <h2 className="text-2xl md:text-3xl font-bold text-heading-text text-center mb-6">
          {translations.relatedCasinosTitle ||
            `Best Casinos with ${provider.title} Games`}
        </h2>
      )}

      <CasinoTable
        casinos={casinos}
        showCasinoTableHeader={true}
        translations={translations}
      />
    </section>
  );
}

/**
 * Skeleton loader for Related Casinos
 */
function RelatedCasinosSkeleton({ showTitle }: { showTitle: boolean }) {
  return (
    <div className="space-y-6">
      {showTitle && <Skeleton className="h-8 w-64 mx-auto" />}
      <div className="bg-casino-table-bkg rounded-[6px] p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-white/5 rounded"
            >
              <Skeleton className="w-24 h-16 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
