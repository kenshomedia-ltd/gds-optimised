// src/components/widgets/GameListWidget/MobileGameFilters.tsx
// Mobile-specific filter component for GameListWidget
// This component provides a mobile-optimized filter interface with:
// - Slide-up bottom sheet panel for filters
// - Combined categories and providers in one filter button
// - Separate sort dropdown button
// - Touch-optimized interactions

"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faTimes,
  faSliders,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type { GameFiltersProps } from "@/types/game-list-widget.types";
import { GAME_SORT_OPTIONS } from "@/lib/utils/sort-mappings";
import { cn } from "@/lib/utils/cn";

export function MobileGameFilters({
  providers = [],
  categories = [],
  selectedProviders = [],
  selectedCategories = [],
  selectedSort = "Most Popular",
  onProviderChange,
  onCategoryChange,
  onSortChange,
  translations = {},
  className = "",
}: GameFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Use game-specific sort options from centralized location
  const sortOptions = GAME_SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: translations?.[option.label] || option.label,
  }));

  // Calculate if there are active filters
  const hasActiveFilters =
    selectedProviders.length > 0 || selectedCategories.length > 0;
  const activeFiltersCount =
    selectedProviders.length + selectedCategories.length;

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFilterOpen(false);
        setIsSortOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Close sort dropdown when clicking outside
      if (
        isSortOpen &&
        !(e.target as Element).closest(".sort-dropdown-container")
      ) {
        setIsSortOpen(false);
      }
    };

    // Handle body scroll locking for filter panel only
    if (isFilterOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Handle sort dropdown listeners (no body scroll lock for dropdown)
    if (isSortOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
      // Always restore body scroll when component unmounts or effect cleans up
      document.body.style.overflow = "unset";
    };
  }, [isFilterOpen, isSortOpen]);

  // Handle provider toggle
  const handleProviderToggle = (providerSlug: string) => {
    const newProviders = selectedProviders.includes(providerSlug)
      ? selectedProviders.filter((p) => p !== providerSlug)
      : [...selectedProviders, providerSlug];
    onProviderChange(newProviders);
  };

  // Handle category toggle
  const handleCategoryToggle = (categorySlug: string) => {
    const newCategories = selectedCategories.includes(categorySlug)
      ? selectedCategories.filter((c) => c !== categorySlug)
      : [...selectedCategories, categorySlug];
    onCategoryChange(newCategories);
  };

  // Handle sort selection
  const handleSortChange = (sortValue: string) => {
    onSortChange(sortValue);
    setIsSortOpen(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onProviderChange([]);
    onCategoryChange([]);
  };

  // Get current sort label
  const currentSortLabel =
    sortOptions.find((option) => option.value === selectedSort)?.label ||
    translations?.filtersPopular ||
    "Most Popular";

  return (
    <div className={cn("mobile-game-filters", className)}>
      {/* Top Menu Bar */}
      <div className="flex gap-2 p-4 bg-white/30 rounded-lg backdrop-blur-sm">
        {/* Filter Button - 50% width */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className={cn(
            "w-1/2 flex items-center justify-center gap-2 px-4 py-3",
            "rounded-lg border transition-colors",
            hasActiveFilters
              ? "bg-blue-200 border-blue-300 text-blue-800"
              : "bg-blue-100 border-blue-200 text-gray-700"
          )}
        >
          <FontAwesomeIcon icon={faSliders} className="w-4 h-4" />
          <span className="font-medium">FILTRI</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Sort Button - 50% width */}
        <div className="w-1/2 relative sort-dropdown-container">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 border border-blue-200 text-gray-700 rounded-lg transition-colors"
          >
            <span className="font-medium">{currentSortLabel}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={cn(
                "w-4 h-4 transition-transform",
                isSortOpen && "rotate-180"
              )}
            />
          </button>

          {/* Sort Dropdown - positioned relative to this container */}
          {isSortOpen && (
            <div className="absolute top-full left-0 mt-1 z-[9999] w-full bg-white rounded-lg shadow-xl border border-gray-200">
              {sortOptions.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors",
                    selectedSort === option.value
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700",
                    index === 0 ? "rounded-t-lg" : "",
                    index === sortOptions.length - 1 ? "rounded-b-lg" : ""
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel - slides up from bottom */}
      {isFilterOpen && (
        <>
          {/* Backdrop with higher z-index */}
          <div
            className="fixed inset-0 z-[9999] bg-black bg-opacity-50"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Filter Panel with even higher z-index */}
          <div className="fixed inset-x-0 bottom-0 z-[10000] bg-white max-h-[80vh] overflow-hidden rounded-t-2xl flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">FILTRI</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Categories Section */}
              <div className="p-4">
                <h3 className="text-base font-semibold text-gray-700 mb-4">
                  Categorie
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => handleCategoryToggle(category.slug)}
                      className={cn(
                        "px-3 py-2 text-sm rounded-full border transition-colors whitespace-nowrap",
                        selectedCategories.includes(category.slug)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Software/Providers Section */}
              {providers.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <h3 className="text-base font-semibold text-gray-700 mb-4">
                    Software
                  </h3>
                  <div className="space-y-1">
                    {providers.map((provider) => (
                      <label
                        key={provider.slug}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProviders.includes(provider.slug)}
                          onChange={() => handleProviderToggle(provider.slug)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{provider.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors"
                >
                  Cancella
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cerca
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
