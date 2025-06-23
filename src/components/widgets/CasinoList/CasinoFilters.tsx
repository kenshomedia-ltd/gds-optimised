// src/components/widgets/CasinoList/CasinoFilters.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faAngleDown,
  faAngleUp,
  faTimes,
} from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import type {
  CasinoFiltersProps,
  CasinoFiltersState,
} from "@/types/casino-filters.types";
import { cn } from "@/lib/utils/cn";
import {
  CASINO_SORT_OPTIONS,
  BONUS_TYPE_OPTIONS,
  CONDITION_OPTIONS,
  BONUS_AMOUNT_OPTIONS,
  WAGERING_OPTIONS,
} from "@/types/casino-filters.types";

/**
 * CasinoFilters Component
 *
 * Provides filtering UI for casinos
 * Features:
 * - Bonus type selection
 * - Condition filtering
 * - Amount and wagering dropdowns
 * - Immediate speed toggle
 * - Sort order with direction toggle
 * - Mobile-responsive design
 */
export function CasinoFilters({
  providers,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  translations = {},
  className,
  loading = false,
}: CasinoFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get label by value helper
  const getLabelByValue = (
    options: ReadonlyArray<{ readonly value: string; readonly label: string }>,
    value: string
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option ? translations[option.label] || option.label : "";
  };

  // Sort order from sort value
  const sortOrder = selectedFilters.sort?.split(":")[1] || "desc";
  const sortKey = selectedFilters.sort?.split(":")[0] || "ratingAvg";

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Toggle dropdown
  const toggleDropdown = useCallback((key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback(
    (key: keyof CasinoFiltersState, value: string | string[]) => {
      onFilterChange({ [key]: value });
      setOpenDropdown(null);
    },
    [onFilterChange]
  );

  // Handle clear filter
  const handleClearFilter = useCallback(
    (e: React.MouseEvent, key: keyof CasinoFiltersState) => {
      e.stopPropagation();
      onFilterChange({ [key]: key === "providers" ? [] : "" });
    },
    [onFilterChange]
  );

  // Toggle sort order
  const toggleSortOrder = useCallback(() => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    onFilterChange({ sort: `${sortKey}:${newOrder}` });
  }, [sortKey, sortOrder, onFilterChange]);

  // Check if filters can be applied based on bonus type
  const canApplyFilters = selectedFilters.bonusKey !== "";

  return (
    <div className={cn("relative mx-auto", className)}>
      <section
        aria-labelledby="filter-heading"
        className="p-2.5 bg-white/30 backdrop-blur-sm relative z-10 rounded-lg border border-white/30"
      >
        <h2 id="filter-heading" className="sr-only">
          {translations.filter || "Filter"}
        </h2>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {/* Bonus Type Dropdown */}
          <div
            className="relative w-full md:w-52"
            ref={(el) => {
              dropdownRefs.current.bonusType = el;
            }}
          >
            <button
              type="button"
              className={cn(
                "w-full p-2 md:p-2.5 h-11 flex items-center justify-between text-xs md:text-sm font-medium rounded border transition-colors",
                selectedFilters.bonusKey
                  ? "bg-purple-100 border-purple-300"
                  : "bg-gray-100 border-gray-300",
                "hover:bg-gray-200"
              )}
              onClick={() => toggleDropdown("bonusType")}
              disabled={loading}
            >
              <span className="uppercase truncate">
                {selectedFilters.bonusKey
                  ? getLabelByValue(
                      BONUS_TYPE_OPTIONS,
                      selectedFilters.bonusKey
                    )
                  : translations.welcomeBonus || "Welcome Bonus"}
              </span>
              {selectedFilters.bonusKey ? (
                <FontAwesomeIcon
                  icon={faTimes}
                  className="w-3 h-3 ml-2"
                  onClick={(e) => handleClearFilter(e, "bonusKey")}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={cn(
                    "w-3 h-3 ml-2 transition-transform",
                    openDropdown === "bonusType" && "rotate-180"
                  )}
                />
              )}
            </button>

            {openDropdown === "bonusType" && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg z-[100] border border-gray-200 max-h-64 overflow-y-auto">
                <div className="p-2 flex flex-col gap-1">
                  {BONUS_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={cn(
                        "w-full p-2 text-xs md:text-sm text-left rounded transition-colors",
                        selectedFilters.bonusKey === option.value
                          ? "bg-purple-100 text-purple-900"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() =>
                        handleFilterChange("bonusKey", option.value)
                      }
                    >
                      {translations[option.label] || option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Condition Dropdown */}
          <div
            className="relative w-full md:w-52"
            ref={(el) => {
              dropdownRefs.current.condition = el;
            }}
          >
            <button
              type="button"
              className={cn(
                "w-full p-2 md:p-2.5 h-11 flex items-center justify-between text-xs md:text-sm font-medium rounded border transition-colors",
                selectedFilters.condition
                  ? "bg-purple-100 border-purple-300"
                  : "bg-gray-100 border-gray-300",
                !canApplyFilters && "opacity-50 cursor-not-allowed",
                "hover:bg-gray-200"
              )}
              onClick={() => canApplyFilters && toggleDropdown("condition")}
              disabled={loading || !canApplyFilters}
            >
              <span className="uppercase truncate">
                {selectedFilters.condition
                  ? getLabelByValue(
                      CONDITION_OPTIONS,
                      selectedFilters.condition
                    )
                  : translations.condition || "Condition"}
              </span>
              {selectedFilters.condition ? (
                <FontAwesomeIcon
                  icon={faTimes}
                  className="w-3 h-3 ml-2"
                  onClick={(e) => handleClearFilter(e, "condition")}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={cn(
                    "w-3 h-3 ml-2 transition-transform",
                    openDropdown === "condition" && "rotate-180"
                  )}
                />
              )}
            </button>

            {openDropdown === "condition" && canApplyFilters && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg z-[100] border border-gray-200 max-h-64 overflow-y-auto">
                <div className="p-2 flex flex-col gap-1">
                  {CONDITION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={cn(
                        "w-full p-2 text-xs md:text-sm text-left rounded transition-colors",
                        selectedFilters.condition === option.value
                          ? "bg-purple-100 text-purple-900"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() =>
                        handleFilterChange("condition", option.value)
                      }
                    >
                      {translations[option.label] || option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Amount Dropdown */}
          <div
            className="relative w-full md:w-52"
            ref={(el) => {
              dropdownRefs.current.amount = el;
            }}
          >
            <button
              type="button"
              className={cn(
                "w-full p-2 md:p-2.5 h-11 flex items-center justify-between text-xs md:text-sm font-medium rounded border transition-colors",
                selectedFilters.amount
                  ? "bg-purple-100 border-purple-300"
                  : "bg-gray-100 border-gray-300",
                !canApplyFilters && "opacity-50 cursor-not-allowed",
                "hover:bg-gray-200"
              )}
              onClick={() => canApplyFilters && toggleDropdown("amount")}
              disabled={loading || !canApplyFilters}
            >
              <span className="uppercase truncate">
                {selectedFilters.amount ||
                  translations.bonusAmount ||
                  "Bonus Amount"}
              </span>
              {selectedFilters.amount ? (
                <FontAwesomeIcon
                  icon={faTimes}
                  className="w-3 h-3 ml-2"
                  onClick={(e) => handleClearFilter(e, "amount")}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={cn(
                    "w-3 h-3 ml-2 transition-transform",
                    openDropdown === "amount" && "rotate-180"
                  )}
                />
              )}
            </button>

            {openDropdown === "amount" && canApplyFilters && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg z-[100] border border-gray-200 max-h-64 overflow-y-auto">
                <div className="p-2 flex flex-col gap-1">
                  {BONUS_AMOUNT_OPTIONS.map((amount) => (
                    <button
                      key={amount}
                      className={cn(
                        "w-full p-2 text-xs md:text-sm text-left rounded transition-colors",
                        selectedFilters.amount === amount.toString()
                          ? "bg-purple-100 text-purple-900"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() =>
                        handleFilterChange("amount", amount.toString())
                      }
                    >
                      {amount}€
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Wagering Dropdown */}
          <div
            className="relative w-full md:w-52"
            ref={(el) => {
              dropdownRefs.current.wagering = el;
            }}
          >
            <button
              type="button"
              className={cn(
                "w-full p-2 md:p-2.5 h-11 flex items-center justify-between text-xs md:text-sm font-medium rounded border transition-colors",
                selectedFilters.wagering
                  ? "bg-purple-100 border-purple-300"
                  : "bg-gray-100 border-gray-300",
                !canApplyFilters && "opacity-50 cursor-not-allowed",
                "hover:bg-gray-200"
              )}
              onClick={() => canApplyFilters && toggleDropdown("wagering")}
              disabled={loading || !canApplyFilters}
            >
              <span className="uppercase truncate">
                {selectedFilters.wagering ||
                  translations.wagering ||
                  "Wagering"}
              </span>
              {selectedFilters.wagering ? (
                <FontAwesomeIcon
                  icon={faTimes}
                  className="w-3 h-3 ml-2"
                  onClick={(e) => handleClearFilter(e, "wagering")}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={cn(
                    "w-3 h-3 ml-2 transition-transform",
                    openDropdown === "wagering" && "rotate-180"
                  )}
                />
              )}
            </button>

            {openDropdown === "wagering" && canApplyFilters && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg z-[100] border border-gray-200 max-h-64 overflow-y-auto">
                <div className="p-2 flex flex-col gap-1">
                  {WAGERING_OPTIONS.map((wagering) => (
                    <button
                      key={wagering}
                      className={cn(
                        "w-full p-2 text-xs md:text-sm text-left rounded transition-colors",
                        selectedFilters.wagering === wagering
                          ? "bg-purple-100 text-purple-900"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => handleFilterChange("wagering", wagering)}
                    >
                      {wagering}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Immediate Toggle */}
          <div className="flex items-center gap-2 ml-0 md:ml-4">
            <label
              htmlFor="immediate"
              className={cn(
                "text-xs md:text-sm font-medium cursor-pointer",
                !canApplyFilters && "opacity-50 cursor-not-allowed"
              )}
            >
              {translations.immediate || "Immediate"}
            </label>
            <input
              id="immediate"
              type="checkbox"
              className="w-4 h-4 rounded cursor-pointer disabled:cursor-not-allowed"
              checked={selectedFilters.speed === "immediate"}
              onChange={(e) =>
                handleFilterChange("speed", e.target.checked ? "immediate" : "")
              }
              disabled={!canApplyFilters}
            />
          </div>

          {/* Sort Dropdown with Order Toggle */}
          <div className="relative w-full md:w-60 ml-auto flex gap-1">
            <div
              className="flex-1"
              ref={(el) => {
                dropdownRefs.current.sort = el;
              }}
            >
              <button
                type="button"
                className={cn(
                  "w-full p-2 md:p-2.5 h-11 flex items-center justify-between text-xs md:text-sm font-medium rounded-l border transition-colors",
                  "bg-gray-100 border-gray-300",
                  "hover:bg-gray-200"
                )}
                onClick={() => toggleDropdown("sort")}
                disabled={loading}
              >
                <span className="uppercase truncate">
                  {getLabelByValue(
                    CASINO_SORT_OPTIONS,
                    selectedFilters.sort || "ratingAvg:desc"
                  )}
                </span>
              </button>

              {openDropdown === "sort" && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg z-[100] border border-gray-200 max-h-64 overflow-y-auto">
                  <div className="p-2 flex flex-col gap-1">
                    {CASINO_SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className={cn(
                          "w-full p-2 text-xs md:text-sm text-left rounded transition-colors",
                          selectedFilters.sort === option.value
                            ? "bg-purple-100 text-purple-900"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => handleFilterChange("sort", option.value)}
                      >
                        {translations[option.label] || option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className={cn(
                "p-2 md:p-2.5 h-11 flex items-center justify-center rounded-r border transition-colors",
                "bg-gray-100 border-gray-300 border-l-0",
                "hover:bg-gray-200"
              )}
              onClick={toggleSortOrder}
              disabled={loading}
            >
              <FontAwesomeIcon
                icon={sortOrder === "desc" ? faAngleDown : faAngleUp}
                className="w-4 h-4"
              />
            </button>
          </div>
        </div>

        {/* Clear All Filters Button - Mobile Only */}
        <div className="mt-4 md:hidden">
          <button
            type="button"
            className="w-full p-2 text-sm font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={onClearFilters}
          >
            {translations.clearFilters || "Clear All Filters"}
          </button>
        </div>
      </section>
    </div>
  );
}
