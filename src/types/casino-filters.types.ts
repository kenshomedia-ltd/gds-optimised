// src/types/casino-filters.types.ts

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

/**
 * Casino sort options
 */
export const CASINO_SORT_OPTIONS = [
  { value: "ratingAvg:desc", label: "topRatedUsers" },
  { value: "authorRatings:desc", label: "topRatedAuthor" },
  { value: "bonusSection.bonusAmount:desc", label: "welcomeBonus" },
  { value: "title:asc", label: "alphabetic" },
  { value: "createdAt:desc", label: "newest" },
] as const;

/**
 * Bonus type options
 */
export const BONUS_TYPE_OPTIONS = [
  { value: "bonusSection", label: "welcomeBonus" },
  { value: "noDepositSection", label: "withoutDeposit" },
  { value: "freeSpinsSection", label: "freeSpins" },
] as const;

/**
 * Condition options
 */
export const CONDITION_OPTIONS = [
  { value: "After Registration", label: "conditionRegistration" },
  { value: "After Validation", label: "conditionValidateAcct" },
  { value: "After Deposit", label: "conditionDeposit" },
] as const;

/**
 * Bonus amount options
 */
export const BONUS_AMOUNT_OPTIONS = [
  50, 100, 200, 300, 500, 1000, 1500, 2000, 3000, 5000,
];

/**
 * Wagering requirement options
 */
export const WAGERING_OPTIONS = [
  "0x",
  "10x",
  "20x",
  "30x",
  "40x",
  "50x",
  "60x",
];

// Import needed types from other files
import type { CasinoData } from "./casino.types";
