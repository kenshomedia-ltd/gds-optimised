// src/components/widgets/GameListWidget/GameFilters.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faFilter,
  faSearch,
  faTimes,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type { GameFiltersProps } from "@/types/game-list-widget.types";
import { cn } from "@/lib/utils/cn";
import { GAME_SORT_OPTIONS } from "@/lib/utils/sort-mappings";
import debounce from "lodash.debounce";

/**
 * GameFilters Component
 *
 * Provides filtering UI for games by search, providers, categories, and sort order
 * Features:
 * - Search with Meilisearch integration
 * - Multi-select dropdowns for providers and categories
 * - Single-select dropdown for sort order
 * - Mobile-responsive design
 * - Clear filters option
 * - Accessible keyboard navigation
 */
export function GameFilters({
  providers,
  categories,
  selectedProviders,
  selectedCategories,
  selectedSort,
  searchQuery,
  onProviderChange,
  onCategoryChange,
  onSortChange,
  onSearchChange,
  translations = {},
  className,
}: GameFiltersProps) {
  const [showProviders, setShowProviders] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "");
  const [isSearching, setIsSearching] = useState(false);

  const hasActiveFilters =
    selectedProviders.length > 0 ||
    selectedCategories.length > 0 ||
    (searchQuery && searchQuery.length > 0);

  // Use game-specific sort options from centralized location
  const sortOptions = GAME_SORT_OPTIONS.map((option) => ({
    value: option.value,
    label:
      translations?.[`sort${option.value.replace(/\s+/g, "")}`] || option.label,
  }));

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
    debounce(async (query: string) => {
      if (onSearchChange) {
        setIsSearching(true);
        try {
          // Perform Meilisearch query if needed for autocomplete
          // For now, just pass the query to parent
          onSearchChange(query);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }
    }, 300),
    [onSearchChange]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    debouncedSearch(value);
  };

  // Clear search
  const clearSearch = () => {
    setLocalSearchQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const handleProviderToggle = (slug: string) => {
    if (selectedProviders.includes(slug)) {
      onProviderChange(selectedProviders.filter((p) => p !== slug));
    } else {
      onProviderChange([...selectedProviders, slug]);
    }
  };

  const handleCategoryToggle = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      onCategoryChange(selectedCategories.filter((c) => c !== slug));
    } else {
      onCategoryChange([...selectedCategories, slug]);
    }
  };

  const handleSortSelect = (value: string) => {
    onSortChange(value);
    setShowSort(false);
  };

  const clearAllFilters = () => {
    onProviderChange([]);
    onCategoryChange([]);
    clearSearch();
  };

  // Get current sort label
  const currentSortLabel =
    sortOptions.find((opt) => opt.value === selectedSort)?.label ||
    sortOptions[0].label;

  // Sync local search with prop
  useEffect(() => {
    setLocalSearchQuery(searchQuery || "");
  }, [searchQuery]);

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Bar - Left Side */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            />
            <input
              type="text"
              value={localSearchQuery}
              onChange={handleSearchChange}
              placeholder={translations?.searchGames || "Search games..."}
              className={cn(
                "w-full pl-10 pr-8 py-2 rounded-lg border transition-colors",
                "bg-transparent placeholder-gray-500",
                "border-gray-300 dark:border-gray-600",
                "hover:border-gray-400 dark:hover:border-gray-500",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              )}
            />
            {localSearchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Spacer to push filters to the right */}
        <div className="flex-1" />

        {/* Right Side - Filters and Sort */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter Icon and Label */}
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FontAwesomeIcon icon={faFilter} className="h-5 w-5" />
            <span className="font-medium">
              {translations?.filterBy || "Filter by:"}
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              onBlur={() => setTimeout(() => setShowSort(false), 200)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                "border-gray-300 dark:border-gray-600"
              )}
            >
              <span>
                {translations?.sortBy || "Sort"}: {currentSortLabel}
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={cn(
                  "h-4 w-4 transition-transform",
                  showSort && "rotate-180"
                )}
              />
            </button>

            {showSort && (
              <div className="absolute z-50 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    className={cn(
                      "w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                      selectedSort === option.value &&
                        "bg-gray-100 dark:bg-gray-700 font-medium"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Provider Filter */}
          {providers.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowProviders(!showProviders)}
                onBlur={() => setTimeout(() => setShowProviders(false), 200)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                  "hover:bg-gray-50 dark:hover:bg-gray-700",
                  selectedProviders.length > 0
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-300 dark:border-gray-600"
                )}
              >
                <span>
                  {translations?.providers || "Providers"}
                  {selectedProviders.length > 0 &&
                    ` (${selectedProviders.length})`}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showProviders && "rotate-180"
                  )}
                />
              </button>

              {showProviders && (
                <div className="absolute z-50 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                  {providers.map((provider) => (
                    <label
                      key={provider.slug}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider.slug)}
                        onChange={() => handleProviderToggle(provider.slug)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{provider.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                onBlur={() => setTimeout(() => setShowCategories(false), 200)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                  "hover:bg-gray-50 dark:hover:bg-gray-700",
                  selectedCategories.length > 0
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-300 dark:border-gray-600"
                )}
              >
                <span>
                  {translations?.categories || "Categories"}
                  {selectedCategories.length > 0 &&
                    ` (${selectedCategories.length})`}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showCategories && "rotate-180"
                  )}
                />
              </button>

              {showCategories && (
                <div className="absolute z-50 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category.slug}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.slug)}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{category.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              {translations?.clearFilters || "Clear all filters"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
