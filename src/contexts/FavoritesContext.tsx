// src/contexts/FavoritesContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type {
  FavoriteGame,
  FavoritesContextValue,
} from "@/types/favorite.types";
import type { GameData } from "@/types/game.types";
import { useUser } from "./UserContext";

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

interface FavoritesProviderProps {
  children: React.ReactNode;
}

// localStorage key as specified
const FAVORITES_STORAGE_KEY = "_favourites";

/**
 * FavoritesProvider - Manages favorite games state
 *
 * Features:
 * - Local storage persistence with "_favourites" key
 * - Optimistic updates
 * - Simple add/remove functionality
 */
export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [isLoading] = useState(false);
  const { state, getUserFavouriteGames } = useUser();

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse favorites from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem(FAVORITES_STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage when favorites change
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } else {
      // Remove key if no favorites
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
    }
  }, [favorites]);

  // Convert GameData to FavoriteGame format
  const gameToFavorite = useCallback((game: GameData): FavoriteGame => {
    // Handle images - get the first image if it's an array
    const gameImage = Array.isArray(game.images) ? game.images[0] : game.images;

    return {
      id: game.id,
      title: game.title,
      slug: game.slug,
      ratingAvg: game.ratingAvg || 0,
      publishedAt: game.publishedAt,
      provider: game.provider
        ? {
            slug: game.provider.slug,
            title: game.provider.title || game.provider.slug,
          }
        : undefined,
      images: gameImage
        ? {
            url: gameImage.url,
          }
        : undefined,
      categories: game.categories?.map((cat) => ({ title: cat.title })),
    };
  }, []);

  // Add favorite
  const addFavorite = useCallback(
    async (game: GameData) => {
      const newFavorite = gameToFavorite(game);

      setFavorites((prev) => {
        // Check if already exists
        if (prev.some((fav) => fav.id === newFavorite.id)) {
          return prev;
        }
        return [...prev, newFavorite];
      });

      // If logged in, make API request
      if (state.user) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/user-games/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ games: [game.id] }),
            }
          );
          if (response.ok) {
            await getUserFavouriteGames();
          }
        } catch (error) {
          console.error("Failed to sync favorite with server:", error);
          // Optionally rollback optimistic update here
        }
      }
    },
    [gameToFavorite, state.user]
  );

  // Remove favorite
  const removeFavorite = useCallback(
    async (gameId: number) => {
      setFavorites((prev) => prev.filter((fav) => fav.id !== gameId));
      const userFavouritedGame = state.favouriteGames.find(
        ({ game }) => game.id === gameId
      );
      if (userFavouritedGame) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/user-games/?` +
            new URLSearchParams(`favoriteId=${userFavouritedGame?.id}`),
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          await getUserFavouriteGames();
        }
      }
    },
    [state.favouriteGames, getUserFavouriteGames]
  );

  // Check if game is favorited
  const isFavorited = useCallback(
    (gameId: number): boolean => {
      return (
        favorites.some((fav) => fav.id === gameId) ||
        state.favouriteGames.some((fav) => fav.game.id === gameId)
      );
    },
    [favorites, state.favouriteGames]
  );

  // Get total favorites count
  const favoritesCount = favorites.length;

  const value: FavoritesContextValue = {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorited,
    favoritesCount,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
