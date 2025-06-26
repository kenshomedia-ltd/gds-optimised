// src/types/pagination.types.ts

/**
 * Base pagination translations
 */
export interface PaginationTranslations {
  previous?: string;
  next?: string;
  showing?: string;
  of?: string;
  loadMore?: string;
  loading?: string;
  noMore?: string;
  paginationFirst?: string;
  paginationLast?: string;
  page?: string;
  goToPage?: string;
}

/**
 * Client-side pagination props
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  translations?: PaginationTranslations;
  className?: string;
  variant?: "default" | "compact";
}

/**
 * Server-side pagination props
 */
export interface PaginationServerProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  translations?: PaginationTranslations;
  className?: string;
  buildUrl?: (page: number) => string;
  variant?: "default" | "compact";
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
}

/**
 * Legacy simple pagination props (for backward compatibility)
 */
export interface PaginationSimpleProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  translations?: PaginationTranslations;
  className?: string;
  buildUrl?: (page: number) => string;
}
