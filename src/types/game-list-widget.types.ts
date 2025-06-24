// src/components/widgets/GameListWidget/GameListWidget.types.ts

import type { GamesCarouselBlock } from "@/types/dynamic-block.types";
import type { GameData } from "@/types/game.types";

/**
 * Props for the GameListWidget component
 */
export interface GameListWidgetProps {
  block: GamesCarouselBlock;
  games?: GameData[];
  translations?: Record<string, string>;
  className?: string;
  // Optional pre-fetched filter data
  providers?: FilterOption[];
  categories?: FilterOption[];
}

/**
 * Filter option structure
 */
export interface FilterOption {
  id: number;
  title: string;
  slug: string;
}

/**
 * Selected filters structure
 */
export interface SelectedFilters {
  providers: string[];
  categories: string[];
}

/**
 * Props for the GameFilters component
 */
export interface GameFiltersProps {
  providers: FilterOption[];
  categories: FilterOption[];
  selectedProviders: string[];
  selectedCategories: string[];
  selectedSort: string;
  searchQuery?: string;
  onProviderChange: (providers: string[]) => void;
  onCategoryChange: (categories: string[]) => void;
  onSortChange: (sort: string) => void;
  onSearchChange?: (query: string) => void;
  translations?: Record<string, string>;
  className?: string;
}
