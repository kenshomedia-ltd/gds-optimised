// src/types/casino-filters.types.ts
import type { CasinoData } from "./casino.types";

/**
 * Casino filter-related type definitions
 */

/**
 * Filter option structure for dropdowns
 */
export interface CasinoFilterOption {
  id: string | number;
  title: string;
  slug: string;
  value: string;
}

/**
 * Bonus type options
 */
export interface BonusTypeOption {
  label: string;
  value: string;
}

/**
 * Casino filters state
 */
export interface CasinoFiltersState {
  bonusKey: string;
  condition: string;
  amount: string;
  wagering: string;
  speed: string;
  providers: string[];
  sort: string;
}

/**
 * Props for the CasinoFilters component
 */
export interface CasinoFiltersProps {
  providers: CasinoFilterOption[];
  selectedFilters: CasinoFiltersState;
  onFilterChange: (filters: Partial<CasinoFiltersState>) => void;
  onClearFilters: () => void;
  translations?: Record<string, string>;
  className?: string;
  loading?: boolean;
}

/**
 * Props for CasinoList widget with filters
 */
export interface CasinoListWidgetProps {
  block: CasinoListBlock;
  casinos: CasinoData[];
  translations?: Record<string, string>;
  className?: string;
  providers?: CasinoFilterOption[]; // Changed from FilterOption[] to CasinoFilterOption[]
  showCasinoFilters?: boolean;
  currentPage?: number;
}

/**
 * Extended CasinoListBlock type
 */
export interface CasinoListBlock {
  __component: "casinos.casino-list";
  id: number;
  heading?: string;
  showCasinoTableHeader?: boolean;
  casinoSort?: string;
  casinoFilters?: string;
  showCasinoFilters?: boolean;
  showLoadMore?: boolean;
  numberPerLoadMore?: number;
  usePagination?: boolean; // Use pagination instead of load more
  casinosList?: Array<{
    id: number;
    casino?: CasinoData;
  }>;
  link?: {
    url: string;
    label: string;
  };
}

// Props for filter option (deprecated - use CasinoFilterOption instead)
export interface FilterOption {
  id: string | number;
  label: string;
  value: string;
}
