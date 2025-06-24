// src/components/ui/Pagination/PaginationSimple.tsx
/**
 * Simple Link-based Pagination Component
 * For use with server-side rendering and URL-based pagination
 */
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { PaginationSimpleProps } from "@/types/pagination.types";

export function PaginationSimple({
  currentPage,
  totalPages,
  baseUrl,
  translations = {},
  className,
  buildUrl,
}: PaginationSimpleProps) {
  // Don't render if only one page
  if (totalPages <= 1) return null;

  // Default URL builder
  const getPageUrl = (page: number) => {
    if (buildUrl) return buildUrl(page);
    if (page === 1) return baseUrl;
    return `${baseUrl}?page=${page}`;
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const delta = 2;
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

  return (
    <nav
      className={cn(
        "inline-flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100",
        className
      )}
      aria-label="Pagination"
    >
      {/* Previous Page */}
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
            "text-primary hover:text-primary-shade",
            "hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          )}
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
          {translations.previous || "Back"}
        </Link>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={page === "..." ? `dots-${index}` : page}>
            {page === "..." ? (
              <span className="px-3 text-gray-400 select-none">•••</span>
            ) : page === currentPage ? (
              <span
                className={cn(
                  "min-w-[44px] h-11 px-4 rounded-xl font-medium",
                  "bg-primary text-white shadow-lg shadow-primary/25",
                  "flex items-center justify-center"
                )}
                aria-current="page"
              >
                {page}
              </span>
            ) : (
              <Link
                href={getPageUrl(page as number)}
                className={cn(
                  "min-w-[44px] h-11 px-4 rounded-xl font-medium",
                  "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  "flex items-center justify-center transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                )}
              >
                {page}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Page */}
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
            "text-primary hover:text-primary-shade",
            "hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          )}
        >
          {translations.next || "Next"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      )}
    </nav>
  );
}
