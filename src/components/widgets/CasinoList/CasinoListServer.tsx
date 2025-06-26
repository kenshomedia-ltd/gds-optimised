// src/components/widgets/CasinoList/CasinoListServer.tsx

import { CasinoTable } from "@/components/casino/CasinoTable/CasinoTable";
import { PaginationServer } from "@/components/ui/Pagination/PaginationServer";
import type { CasinoListBlock } from "@/types/casino-filters.types";
import type { CasinoData } from "@/types/casino.types";
import { cn } from "@/lib/utils/cn";

interface CasinoListServerProps {
  block: CasinoListBlock;
  casinos: CasinoData[];
  translations?: Record<string, string>;
  className?: string;
  currentPage?: number;
  baseUrl?: string;
}

/**
 * CasinoListServer Component
 *
 * Server-side rendered casino list with pagination
 * Works without JavaScript enabled
 *
 * Features:
 * - SSR-only, no client-side state
 * - Pagination using URL parameters
 * - Progressive enhancement ready
 */
export function CasinoListServer({
  block,
  casinos,
  translations = {},
  className,
  currentPage = 1,
  baseUrl = "",
}: CasinoListServerProps) {
  // Get pagination settings from block
  const showLoadMore = block.showLoadMore || false;
  const itemsPerPage = block.numberPerLoadMore || 10;

  // Calculate pagination
  const totalCasinos = casinos.length;
  const totalPages = Math.ceil(totalCasinos / itemsPerPage);

  // Get current page casinos
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCasinos = casinos.slice(startIndex, endIndex);

  // Filter out any null casinos
  const validCasinos = currentCasinos.filter(Boolean);

  if (!casinos.length) return null;

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

        {/* Casino Table - Always visible, even without JS */}
        <div className="pt-2.5">
          <CasinoTable
            casinos={validCasinos}
            showCasinoTableHeader={block.showCasinoTableHeader !== false}
            translations={translations}
          />
        </div>

        {/* Pagination - Only show if enabled and more than one page */}
        {showLoadMore && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <PaginationServer
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={baseUrl}
              translations={translations}
              showInfo={true}
              totalItems={totalCasinos}
              itemsPerPage={itemsPerPage}
              itemName="casinos"
            />
          </div>
        )}

        {/* View All Link */}
        {block.link && !showLoadMore && (
          <div className="flex justify-center mt-5">
            <a
              href={block.link.url}
              className="btn self-center btn-secondary min-w-[300px] md:min-w-[500px] inline-flex items-center justify-center"
            >
              {block.link.label}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
