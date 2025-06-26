// src/components/ui/Pagination/Pagination.tsx
"use client";

import { cn } from "@/lib/utils/cn";
import type { PaginationProps } from "@/types/pagination.types";

/**
 * Reusable Pagination Component
 *
 * Features:
 * - Smart page number display with ellipsis
 * - Previous/Next navigation
 * - Accessible with ARIA labels
 * - Optional info text (showing X-Y of Z items)
 * - Configurable styling and text
 * - Supports both default and compact variants
 * - Auto-responsive mobile layout
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showInfo = false,
  totalItems,
  itemsPerPage,
  itemName = "items",
  translations = {},
  className,
  variant = "default",
}: PaginationProps) {
  // Don't render if only one page
  if (totalPages <= 1) return null;

  // Generate page numbers to display for desktop
  const getDesktopPageNumbers = () => {
    const delta = variant === "compact" ? 1 : 2;
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
    <div className={cn("flex flex-col items-center gap-2 sm:gap-4", className)}>
      {/* Mobile Pagination - Simplified for small screens */}
      <nav
        className="flex sm:hidden items-center gap-2 p-1 bg-white rounded-xl shadow-sm border border-gray-100"
        aria-label="Pagination"
      >
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            "text-primary hover:text-primary-shade",
            "hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
          )}
          aria-label="Previous page"
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
        </button>

        {/* Current page indicator */}
        <div className="flex items-center gap-1 px-3">
          <span className="text-sm text-gray-600">
            {translations.page || "Page"}
          </span>
          <span className="text-sm font-semibold text-primary">
            {currentPage}
          </span>
          <span className="text-sm text-gray-600">
            {translations.of || "of"} {totalPages}
          </span>
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            "text-primary hover:text-primary-shade",
            "hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
          )}
          aria-label="Next page"
        >
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
        </button>
      </nav>

      {/* Desktop Pagination - Full featured */}
      <nav
        className="hidden sm:inline-flex items-center gap-3 p-1 bg-white rounded-2xl shadow-sm border border-gray-100"
        aria-label="Pagination"
      >
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
            "text-primary hover:text-primary-shade",
            "hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary",
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
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-2">
          {getDesktopPageNumbers().map((pageNum, index) =>
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
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum as number)}
                disabled={disabled}
                className={cn(
                  "min-w-[44px] h-11 px-4 rounded-xl font-medium transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                  "disabled:cursor-not-allowed",
                  currentPage === pageNum
                    ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-shade"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  variant === "compact" && "min-w-[36px] h-9 px-3 text-sm"
                )}
                aria-label={`Go to page ${pageNum}`}
                aria-current={currentPage === pageNum ? "page" : undefined}
              >
                {pageNum}
              </button>
            )
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
            "text-primary hover:text-primary-shade",
            "hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary",
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
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </nav>

      {/* Page info */}
      {showInfo && totalItems && itemsPerPage && (
        <p
          className={cn(
            "text-xs sm:text-sm text-white",
            variant === "compact" && "text-xs"
          )}
        >
          {startItem}-{endItem} {translations.of || "of"} {totalItems}{" "}
          {itemName}
        </p>
      )}
    </div>
  );
}
