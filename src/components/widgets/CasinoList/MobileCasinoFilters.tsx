// src/components/widgets/CasinoList/MobileCasinoFilters.tsx
// Mobile-specific filter component for CasinoListWidget
// This component provides a mobile-optimized filter interface with:
// - Slide-up bottom sheet panel for filters
// - Combined bonus filters in one filter button
// - Separate sort dropdown button
// - Touch-optimized interactions

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faSliders,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import {
  faTimes,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type {
  CasinoFiltersProps,
  CasinoFiltersState,
} from "@/types/casino-filters.types";
import {
  CASINO_SORT_OPTIONS,
  BONUS_TYPE_OPTIONS,
  CONDITION_OPTIONS,
  BONUS_AMOUNT_OPTIONS,
  WAGERING_OPTIONS,
} from "@/lib/utils/sort-mappings";
import { cn } from "@/lib/utils/cn";

export function MobileCasinoFilters({
  selectedFilters,
  onFilterChange,
  onClearFilters,
  translations = {},
  className = "",
  loading = false,
}: CasinoFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Use casino-specific sort options from centralized location
  const sortOptions = CASINO_SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: translations?.[option.label] || option.label,
  }));

  // Calculate if there are active filters
  const hasActiveFilters =
    selectedFilters.bonusKey !== "bonusSection" ||
    selectedFilters.condition !== "" ||
    selectedFilters.amount !== "" ||
    selectedFilters.wagering !== "" ||
    selectedFilters.speed !== "" ||
    selectedFilters.providers.length > 0;

  const activeFiltersCount = [
    selectedFilters.bonusKey !== "bonusSection" ? 1 : 0,
    selectedFilters.condition !== "" ? 1 : 0,
    selectedFilters.amount !== "" ? 1 : 0,
    selectedFilters.wagering !== "" ? 1 : 0,
    selectedFilters.speed !== "" ? 1 : 0,
    selectedFilters.providers.length,
  ].reduce((sum, count) => sum + count, 0);

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

  // Handle filter change
  const handleFilterChange = (
    key: keyof CasinoFiltersState,
    value: string | string[]
  ) => {
    if (key === "sort" && typeof value === "string") {
      // When selecting from dropdown, preserve the current sort order
      const newSortKey = value.split(":")[0];
      const currentOrder = selectedFilters.sort?.split(":")[1] || "desc";
      value = `${newSortKey}:${currentOrder}`;
    }
    onFilterChange({ [key]: value });
  };

  // Handle sort selection
  const handleSortChange = (sortValue: string) => {
    handleFilterChange("sort", sortValue);
    setIsSortOpen(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onClearFilters();
  };

  // Get current sort label
  const currentSortLabel =
    sortOptions.find((option) => {
      const sortKey = selectedFilters.sort?.split(":")[0] || "ratingAvg";
      return option.value.startsWith(sortKey + ":");
    })?.label ||
    translations?.sortRating ||
    "Top Rated";

  // Get label by value helper
  const getLabelByValue = (
    options: ReadonlyArray<{ readonly value: string; readonly label: string }>,
    value: string
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option ? translations[option.label] || option.label : "";
  };

  return (
    <div className={cn("mobile-casino-filters", className)}>
      {/* Top Menu Bar */}
      <div className="flex gap-2 mt-6 p-4 bg-white/30 rounded-lg backdrop-blur-sm">
        {/* Filter Button - 50% width */}
        <button
          onClick={() => setIsFilterOpen(true)}
          disabled={loading}
          className={cn(
            "w-1/2 flex items-center justify-center gap-2 px-2 py-2",
            "rounded-lg border transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
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
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-2 py-2 bg-blue-100 border border-blue-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="absolute top-full left-0 mt-1 z-[100] w-full bg-white rounded-lg shadow-xl border border-gray-200">
              {sortOptions.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors",
                    selectedFilters.sort?.startsWith(option.value.split(":")[0])
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
            className="fixed inset-0 z-[9999] bg-black/60"
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
                <FontAwesomeIcon
                  icon={faTimes}
                  className="text-black w-6 h-6"
                />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Bonus Type Section */}
              <div className="p-4">
                <h3 className="text-base font-semibold text-gray-700 mb-4">
                  Tipo Di Bonus
                </h3>
                <div className="flex flex-wrap gap-2">
                  {BONUS_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleFilterChange("bonusKey", option.value)
                      }
                      className={cn(
                        "px-3 py-2 text-sm rounded-full border transition-colors whitespace-nowrap",
                        selectedFilters.bonusKey === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {getLabelByValue(BONUS_TYPE_OPTIONS, option.value) ||
                        option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Section */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-700 mb-4">
                  Condizione
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CONDITION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleFilterChange("condition", option.value)
                      }
                      className={cn(
                        "px-3 py-2 text-sm rounded-full border transition-colors whitespace-nowrap",
                        selectedFilters.condition === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {getLabelByValue(CONDITION_OPTIONS, option.value) ||
                        option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bonus Amount Section */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-700 mb-4">
                  Importo Bonus
                </h3>
                <div className="flex flex-wrap gap-2">
                  {BONUS_AMOUNT_OPTIONS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() =>
                        handleFilterChange("amount", amount.toString())
                      }
                      className={cn(
                        "px-3 py-2 text-sm rounded-full border transition-colors whitespace-nowrap",
                        selectedFilters.amount === amount.toString()
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {amount}€
                    </button>
                  ))}
                </div>
              </div>

              {/* Wagering Requirements Section */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-700 mb-4">
                  Requisiti
                </h3>
                <div className="flex flex-wrap gap-2">
                  {WAGERING_OPTIONS.map((wagering) => (
                    <button
                      key={wagering}
                      onClick={() => handleFilterChange("wagering", wagering)}
                      className={cn(
                        "px-3 py-2 text-sm rounded-full border transition-colors whitespace-nowrap",
                        selectedFilters.wagering === wagering
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {wagering}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Section */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-700 mb-4">
                  Immediato
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleFilterChange(
                        "speed",
                        selectedFilters.speed === "immediate" ? "" : "immediate"
                      )
                    }
                    className={cn(
                      "px-3 py-2 text-sm rounded-full border transition-colors whitespace-nowrap",
                      selectedFilters.speed === "immediate"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    IMMEDIATO
                  </button>
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-4 py-3 bg-danger hover:bg-danger text-black font-medium rounded-lg transition-colors"
                >
                  Cancella
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 px-4 py-3 bg-misc hover:bg-misc text-white font-medium rounded-lg transition-colors"
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
