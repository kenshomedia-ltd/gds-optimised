// src/components/widgets/GameListWidget/GameFilters.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
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
 * - Mobile-responsive design with full-width fields
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
      translations?.[option.label] ||
      option.label
        .replace(/^sort/, "")
        .replace(/([A-Z])/g, " $1")
        .trim(),
  }));

  // Get current sort label
  const currentSortLabel = useMemo(() => {
    const currentSort = sortOptions.find(
      (option) => option.value === selectedSort
    );
    return currentSort?.label || sortOptions[0]?.label || "Sort";
  }, [selectedSort, sortOptions]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setIsSearching(false);
        if (onSearchChange) {
          onSearchChange(query);
        }
      }, 300),
    [onSearchChange]
  );

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    if (onSearchChange) {
      setIsSearching(true);
      debouncedSearch(value);
    }
  };

  // Clear search
  const clearSearch = () => {
    setLocalSearchQuery("");
    setIsSearching(false);
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  // Effect to sync external search query changes
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle provider selection
  const handleProviderToggle = (providerSlug: string) => {
    const newProviders = selectedProviders.includes(providerSlug)
      ? selectedProviders.filter((p) => p !== providerSlug)
      : [...selectedProviders, providerSlug];
    onProviderChange(newProviders);
  };

  // Handle category selection
  const handleCategoryToggle = (categorySlug: string) => {
    const newCategories = selectedCategories.includes(categorySlug)
      ? selectedCategories.filter((c) => c !== categorySlug)
      : [...selectedCategories, categorySlug];
    onCategoryChange(newCategories);
  };

  // Handle sort selection
  const handleSortSelect = (sortValue: string) => {
    onSortChange(sortValue);
    setShowSort(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onProviderChange([]);
    onCategoryChange([]);
    clearSearch();
  };

  return (
    <div
      className={cn(
        "bg-white/30 rounded-lg backdrop-blur-sm relative z-10 border border-white/30 shadow-sm p-3",
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Bar - Full width on mobile */}
        {onSearchChange && (
          <div className="w-full md:w-80">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
              />
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={translations.searchGames || "Search games..."}
                className={cn(
                  "w-full pl-10 pr-10 py-2 rounded-lg border",
                  "bg-grey-300 border-gray-300 text-gray-900",
                  "placeholder:text-gray-500 focus:outline-none",
                  "focus:ring-2 focus:ring-primary focus:border-transparent"
                )}
              />
              {localSearchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Clear search"
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
        )}

        {/* Spacer to push filters to the right on desktop */}
        <div className="hidden md:block flex-1" />

        {/* Filter Controls - Stack vertically on mobile, horizontal on desktop */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-2">
          {/* Sort Dropdown - Full width on mobile */}
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setShowSort(!showSort)}
              onBlur={() => setTimeout(() => setShowSort(false), 200)}
              className={cn(
                "w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded-lg border transition-colors",
                "bg-filter-bkg hover:bg-gray-200",
                "border-filter-border",
                showSort && "!rounded-b-none border-b-0"
              )}
            >
              <span className="text-sm md:text-base">{currentSortLabel}</span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={cn(
                  "h-4 w-4 transition-transform",
                  showSort && "rotate-180"
                )}
              />
            </button>

            {showSort && (
              <div className="absolute z-50 w-full md:w-48 bg-gray-200 rounded-b-lg shadow-lg border border-t-0 border-gray-300">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    className={cn(
                      "w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors",
                      "text-sm md:text-base",
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

          {/* Provider Filter - Full width on mobile */}
          {providers.length > 0 && (
            <div className="relative w-full md:w-auto">
              <button
                onClick={() => setShowProviders(!showProviders)}
                onBlur={() => setTimeout(() => setShowProviders(false), 200)}
                className={cn(
                  "w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded-lg border transition-colors",
                  "bg-gray-300 hover:bg-gray-200",
                  selectedProviders.length > 0
                    ? "!bg-filter-bkg border-filter-border"
                    : "border-gray-300",
                  showProviders && "!rounded-b-none border-b-0"
                )}
              >
                <span className="text-sm md:text-base">
                  {translations.providers || "Providers"}
                  {selectedProviders.length > 0 && (
                    <span className="ml-1 text-xs font-medium bg-primary text-white px-1.5 py-0.5 rounded-full">
                      {selectedProviders.length}
                    </span>
                  )}
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
                <div className="absolute z-50 w-full md:w-64 max-h-80 overflow-y-auto bg-gray-200 rounded-b-lg shadow-lg border border-t-0 border-gray-300">
                  {providers.map((provider) => (
                    <label
                      key={provider.slug}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider.slug)}
                        onChange={() => handleProviderToggle(provider.slug)}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm md:text-base">
                        {provider.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Category Filter - Full width on mobile */}
          {categories.length > 0 && (
            <div className="relative w-full md:w-auto">
              <button
                onClick={() => setShowCategories(!showCategories)}
                onBlur={() => setTimeout(() => setShowCategories(false), 200)}
                className={cn(
                  "w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded-lg border transition-colors",
                  "bg-gray-300 hover:bg-gray-200",
                  selectedCategories.length > 0
                    ? "!bg-filter-bkg border-filter-border"
                    : "border-gray-300",
                  showCategories && "!rounded-b-none border-b-0"
                )}
              >
                <span className="text-sm md:text-base">
                  {translations.categories || "Categories"}
                  {selectedCategories.length > 0 && (
                    <span className="ml-1 text-xs font-medium bg-primary text-white px-1.5 py-0.5 rounded-full">
                      {selectedCategories.length}
                    </span>
                  )}
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
                <div className="absolute z-50 w-full md:w-64 max-h-80 overflow-y-auto bg-gray-200 rounded-b-lg shadow-lg border border-t-0 border-gray-300">
                  {categories.map((category) => (
                    <label
                      key={category.slug}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.slug)}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm md:text-base">
                        {category.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clear Filters Button - Show when filters are active */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className={cn(
                "w-full md:w-auto px-4 py-2 rounded-lg transition-colors",
                "bg-danger text-white hover:bg-danger/90",
                "text-sm md:text-base font-medium"
              )}
            >
              {translations.clearFilters || "Clear All"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
