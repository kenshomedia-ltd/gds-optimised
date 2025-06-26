// src/components/ui/Pagination/PaginationServer.tsx

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { PaginationServerProps } from "@/types/pagination.types";

/**
 * Server-side Pagination Component
 * Works without JavaScript enabled
 * Uses Link components for navigation
 */
export function PaginationServer({
  currentPage,
  totalPages,
  baseUrl,
  translations = {},
  className,
  buildUrl,
  variant = "default",
  showInfo = false,
  totalItems,
  itemsPerPage,
  itemName = "items",
}: PaginationServerProps) {
  // Don't render if only one page
  if (totalPages <= 1) return null;

  // Default URL builder using p notation
  const getPageUrl = (page: number) => {
    if (buildUrl) return buildUrl(page);

    // Handle base URL with or without trailing slash
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    // First page doesn't need p1
    if (page === 1) return cleanBaseUrl;

    // Subsequent pages use p2, p3, etc.
    return `${cleanBaseUrl}/p${page}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = variant === "compact" ? 1 : 2; // Number of pages to show on each side
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Calculate item range for info text
  const startItem =
    totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem =
    totalItems && itemsPerPage
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : 0;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Pagination controls */}
      <nav
        className="inline-flex items-center gap-3 p-1 bg-white rounded-2xl shadow-sm border border-gray-100"
        aria-label="Pagination"
      >
        {/* Previous button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
              "text-primary hover:text-primary-shade",
              "hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              variant === "compact" && "px-3 py-2 text-sm"
            )}
            aria-label="Previous page"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform group-hover:-translate-x-0.5"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {translations.paginationFirst || "Back"}
          </Link>
        ) : (
          <span
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium",
              "text-gray-400 cursor-not-allowed",
              variant === "compact" && "px-3 py-2 text-sm"
            )}
            aria-disabled="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {translations.paginationFirst || "Back"}
          </span>
        )}

        {/* Page numbers */}
        <div className="flex items-center gap-2">
          {getPageNumbers().map((pageNum, index) =>
            pageNum === "..." ? (
              <span
                key={`dots-${index}`}
                className={cn(
                  "px-3 text-gray-400 select-none",
                  variant === "compact" && "px-2 text-sm"
                )}
              >
                •••
              </span>
            ) : (
              <React.Fragment key={pageNum}>
                {currentPage === pageNum ? (
                  <span
                    className={cn(
                      "min-w-[44px] h-11 px-4 rounded-xl font-medium transition-all flex items-center justify-center",
                      "bg-primary text-white shadow-lg shadow-primary/25",
                      variant === "compact" && "min-w-[36px] h-9 px-3 text-sm"
                    )}
                    aria-current="page"
                  >
                    {pageNum}
                  </span>
                ) : (
                  <Link
                    href={getPageUrl(pageNum as number)}
                    className={cn(
                      "min-w-[44px] h-11 px-4 rounded-xl font-medium transition-all flex items-center justify-center",
                      "bg-gray-100 text-gray-700 hover:bg-gray-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                      variant === "compact" && "min-w-[36px] h-9 px-3 text-sm"
                    )}
                    aria-label={`${translations.goToPage || "Go to page"} ${pageNum}`}
                  >
                    {pageNum}
                  </Link>
                )}
              </React.Fragment>
            )
          )}
        </div>

        {/* Next button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
              "text-primary hover:text-primary-shade",
              "hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              variant === "compact" && "px-3 py-2 text-sm"
            )}
            aria-label="Next page"
          >
            {translations.paginationLast || "Next"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : (
          <span
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium",
              "text-gray-400 cursor-not-allowed",
              variant === "compact" && "px-3 py-2 text-sm"
            )}
            aria-disabled="true"
          >
            {translations.paginationLast || "Next"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </nav>

      {/* Info text */}
      {showInfo &&
        totalItems &&
        totalItems > 0 &&
        itemsPerPage &&
        itemsPerPage > 0 && (
          <p className="text-sm text-gray-600">
            {startItem}–{endItem}{" "}
            {translations.of || "of"} {totalItems} {itemName}
          </p>
        )}
    </div>
  );
}
