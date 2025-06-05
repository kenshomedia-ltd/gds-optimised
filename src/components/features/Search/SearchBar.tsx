// src/components/features/Search/SearchBar.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { icons } from "@/lib/icons/icons";
import type { SearchBarProps } from "./search.types";

/**
 * SearchBar Component with smooth animations
 *
 * Features:
 * - Smooth expand/collapse animations
 * - Keyboard shortcuts (Cmd/Ctrl + K)
 * - Mobile-optimized overlay
 * - Auto-focus and click-outside handling
 * - Accessible with proper ARIA labels
 * - Optimized for CWV with minimal re-renders
 */
export function SearchBar({
  position = "header",
  placeholder = "Search games...",
  onSearch,
  className = "",
  autoFocus = false,
}: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsExpanded(true);
      }

      // Handle escape key
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      // Small delay to ensure animation starts before focus
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        isExpanded &&
        position !== "page"
      ) {
        setIsExpanded(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, position]);

  // Auto-focus on mount if specified
  useEffect(() => {
    if (autoFocus && position === "page" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, position]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        if (onSearch) {
          onSearch(query);
        } else {
          router.push(`/search?q=${encodeURIComponent(query)}`);
        }
        setQuery("");
        if (position === "header") {
          setIsExpanded(false);
        }
      }
    },
    [query, onSearch, router, position]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  const toggleSearch = useCallback(() => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setQuery("");
    }
  }, [isExpanded]);

  const handleClose = useCallback(() => {
    setQuery("");
    setIsExpanded(false);
  }, []);

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return null;
  }

  // Mobile: Expandable search with overlay
  if (position === "header") {
    return (
      <>
        {/* Search Container */}
        <div
          ref={containerRef}
          className={`relative flex items-center ${className}`}
        >
          {/* Desktop Animated Search Bar */}
          <div
            className={`
              hidden lg:flex items-center overflow-hidden
              transition-all duration-300 ease-in-out
              bg-white/10 backdrop-blur-sm rounded-full
              ${
                isExpanded
                  ? "w-80 border border-white/20 shadow-lg"
                  : "w-10 h-10 border border-transparent hover:border-white/10"
              }
            `}
          >
            <button
              type="button"
              onClick={toggleSearch}
              className={`
                h-10 w-10 rounded-full flex-shrink-0
                flex items-center justify-center
                text-navbar-text hover:bg-white/10
                transition-colors duration-200
              `}
              aria-label={isExpanded ? "Close search" : "Open search"}
              aria-expanded={isExpanded}
            >
              <div
                className="w-5 h-5"
                dangerouslySetInnerHTML={{
                  __html: isExpanded ? icons.close : icons.search,
                }}
              />
            </button>

            <form onSubmit={handleSubmit} className="flex-1 flex items-center">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className={`
                  bg-transparent border-0 outline-none w-full
                  text-navbar-text placeholder-navbar-text/60
                  transition-all duration-300
                  ${
                    isExpanded
                      ? "opacity-100 px-3 py-2"
                      : "opacity-0 w-0 p-0 pointer-events-none"
                  }
                `}
                aria-hidden={!isExpanded}
                aria-label="Search games"
                autoComplete="off"
                spellCheck={false}
              />

              {/* Clear button */}
              {query && isExpanded && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="
                    mr-3 text-navbar-text/60 hover:text-navbar-text
                    transition-colors duration-200
                  "
                  aria-label="Clear search"
                >
                  <div
                    className="w-4 h-4"
                    dangerouslySetInnerHTML={{ __html: icons.close }}
                  />
                </button>
              )}
            </form>
          </div>

          {/* Keyboard shortcut hint */}
          {!isExpanded && (
            <kbd
              className="
              hidden xl:inline-flex ml-2 px-2 py-1
              text-xs text-navbar-text/60 
              bg-white/5 rounded border border-white/10
            "
            >
              ⌘K
            </kbd>
          )}

          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className={`
              p-2 rounded-md text-navbar-text hover:bg-white/10 
              transition-colors lg:hidden
            `}
            aria-label="Search"
          >
            <div
              className="w-5 h-5"
              dangerouslySetInnerHTML={{ __html: icons.search }}
            />
          </button>
        </div>

        {/* Mobile Search Overlay */}
        {isExpanded && (
          <div
            className="
              fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
              lg:hidden animate-fadeIn
            "
            onClick={handleClose}
          >
            <div
              className="
                absolute top-0 left-0 right-0 bg-navbar-bkg
                border-b border-white/10 shadow-xl
                animate-slideDown
              "
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="p-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="
                      w-full pl-12 pr-24 py-4
                      bg-white/10 backdrop-blur-sm
                      border border-white/20 rounded-xl
                      text-navbar-text placeholder-navbar-text/60
                      focus:outline-none focus:ring-2 focus:ring-white/30
                      focus:bg-white/15 transition-all duration-200
                    "
                    aria-label="Search games"
                    autoComplete="off"
                    spellCheck={false}
                  />

                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navbar-text/60"
                    dangerouslySetInnerHTML={{ __html: icons.search }}
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="
                        absolute right-16 top-1/2 -translate-y-1/2
                        text-navbar-text/60 hover:text-navbar-text
                        transition-colors
                      "
                      aria-label="Clear search"
                    >
                      <div
                        className="w-5 h-5"
                        dangerouslySetInnerHTML={{ __html: icons.close }}
                      />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="
                      absolute right-2 top-1/2 -translate-y-1/2
                      px-3 py-2 text-sm text-navbar-text
                      hover:bg-white/10 rounded-lg
                      transition-colors
                    "
                    aria-label="Close search"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Page-level search bar (always expanded)
  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative group">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-12 py-3
            bg-gray-50 border-2 border-gray-200
            rounded-xl text-gray-900 placeholder-gray-500
            focus:outline-none focus:ring-0 focus:border-primary
            focus:bg-white transition-all duration-200
            group-hover:border-gray-300
          "
          aria-label="Search games"
          autoComplete="off"
          spellCheck={false}
        />

        <div
          className="
            absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 
            text-gray-400 group-focus-within:text-primary
            transition-colors duration-200
          "
          dangerouslySetInnerHTML={{ __html: icons.search }}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              text-gray-400 hover:text-gray-600
              transition-colors duration-200
            "
            aria-label="Clear search"
          >
            <div
              className="w-5 h-5"
              dangerouslySetInnerHTML={{ __html: icons.close }}
            />
          </button>
        )}
      </div>
    </form>
  );
}
