// src/types/search.types.ts

/**
 * Search result item
 */
export interface SearchResult {
  id: number | string;
  title: string;
  slug: string;
  type: "game" | "casino" | "blog" | "page";
  image?: {
    url: string;
    alt?: string;
  };
  description?: string;
  rating?: number;
  provider?: string;
}

/**
 * Search suggestion
 */
export interface SearchSuggestion {
  term: string;
  count: number;
}

/**
 * Search filters
 */
export interface SearchFilters {
  type?: string[];
  provider?: string[];
  category?: string[];
  sortBy?: "relevance" | "rating" | "newest" | "popular";
}

/**
 * Search response
 */
export interface SearchResponse {
  results: SearchResult[];
  suggestions?: SearchSuggestion[];
  total: number;
  page: number;
  pageSize: number;
  filters?: SearchFilters;
}
