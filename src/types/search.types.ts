// src/components/features/Search/search.types.ts

/**
 * SearchBar component props
 */
export interface SearchBarProps {
  /** Position of the search bar - affects styling and behavior */
  position?: "header" | "page";

  /** Placeholder text for the search input */
  placeholder?: string;

  /** Callback function when search is submitted */
  onSearch?: (query: string) => void;

  /** Additional CSS classes */
  className?: string;

  /** Auto-focus the input on mount (only for page position) */
  autoFocus?: boolean;

  /** Maximum number of results to display in dropdown */
  maxResults?: number;
}

/**
 * Search result item structure
 */
export interface SearchResult {
  id: string;
  type: "game" | "casino" | "blog";
  title: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    alt: string;
  };
  rating?: number;
  provider?: string;
  logo?: string; // Add this for the game logo
  _highlightResult?: {
    title?: {
      value: string;
    };
  };
}

/**
 * Search filters
 */
export interface SearchFilters {
  types?: ("game" | "casino" | "blog")[];
  providers?: string[];
  categories?: string[];
  minRating?: number;
  sortBy?: "relevance" | "rating" | "newest" | "popular";
}

/**
 * Search API response
 */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  filters: SearchFilters;
  suggestions?: string[];
}
