// src/components/features/Search/SearchBar.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { MeiliSearch } from "meilisearch";
import { Image } from "@/components/common/Image";
import { icons } from "@/lib/icons/icons";
import { cn } from "@/lib/utils/cn";
import type { SearchBarProps, SearchResult } from "@/types/search.types";

// Initialize Meilisearch client
const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || "http://127.0.0.1:7700",
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY || "",
});

// Get the search index
const searchIndex = client.index(
  process.env.NEXT_PUBLIC_MEILISEARCH_INDEX_NAME || "games"
);

export function SearchBar({
  placeholder = "Search games...",
  className = "",
  maxResults = 8,
}: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || "";
  const gamePagePath = process.env.NEXT_PUBLIC_GAME_PAGE_PATH || "/slot-machines";

  // Debounced search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const debounceTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await searchIndex.search<SearchResult>(query, {
          limit: maxResults,
          attributesToHighlight: ["title"],
          highlightPreTag: "__ais-highlight__",
          highlightPostTag: "__/ais-highlight__",
        });

        setResults(searchResults.hits);
      } catch (err) {
        console.error("MeiliSearch error:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query, maxResults]);

  // Combined keyboard and outside click handler
  useEffect(() => {
    const handleInteraction = (e: MouseEvent | KeyboardEvent) => {
      if (!isExpanded) {
        if (
          (e as KeyboardEvent).key === "k" &&
          ((e as KeyboardEvent).metaKey || (e as KeyboardEvent).ctrlKey)
        ) {
          e.preventDefault();
          setIsExpanded(true);
        }
        return;
      }
      if ((e as KeyboardEvent).key === "Escape") {
        setIsExpanded(false);
      }
      if (
        e.type === "mousedown" &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("keydown", handleInteraction);
    document.addEventListener("mousedown", handleInteraction);
    return () => {
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("mousedown", handleInteraction);
    };
  }, [isExpanded]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  const resetSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsExpanded(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-end h-10 w-10",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 h-10",
          "flex items-center backdrop-blur-sm rounded-full",
          "transition-all duration-300 ease-in-out",
          isExpanded
            ? "w-80 border-white/20 bg-white/10 shadow-lg"
            : "w-10 border-transparent bg-transparent"
        )}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full text-navbar-text bg-transparent hover:bg-white/10 transition-colors"
          aria-label={isExpanded ? "Close search" : "Open search"}
        >
          <div
            className="w-5 h-5"
            dangerouslySetInnerHTML={{
              __html: isExpanded ? icons.close : icons.search,
            }}
          />
        </button>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full h-full bg-transparent border-0 outline-none pr-4 text-navbar-text placeholder-navbar-text/60",
            "transition-opacity duration-200",
            isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-hidden={!isExpanded}
        />
      </div>

      {/* Results Dropdown */}
      {isExpanded && query && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl overflow-hidden z-50">
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {isSearching && (
              <div className="p-4 text-center text-sm text-gray-500">
                Searching...
              </div>
            )}
            {!isSearching && results.length > 0 && (
              <ul>
                {results.map((hit) => {
                  // Handle highlighting
                  const highlightedTitle =
                    hit._highlightResult?.title?.value || hit.title;
                  const formattedTitle = highlightedTitle
                    .replace(
                      /__ais-highlight__/g,
                      '<mark class="font-semibold text-primary bg-transparent">'
                    )
                    .replace(/__\/ais-highlight__/g, "</mark>");

                  return (
                    <li key={hit.id}>
                      <Link
                        href={`${siteURL}${gamePagePath}/${hit.slug}/`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                        onClick={resetSearch}
                      >
                        <Image
                          src={hit.logo || "/images/placeholder-game.webp"}
                          alt={hit.title}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-medium text-sm text-gray-900 truncate group-hover:text-primary"
                            dangerouslySetInnerHTML={{ __html: formattedTitle }}
                          />
                          <div className="text-xs text-gray-500">
                            {hit.provider}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {!isSearching && results.length === 0 && query.length > 1 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No results for &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
