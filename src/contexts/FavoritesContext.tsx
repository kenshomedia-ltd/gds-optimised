// src/contexts/FavoritesContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import type {
  FavoriteGame,
  UserFavoriteGame,
  FavoritesContextValue,
} from "@/types/favorite.types";
import type { GameData } from "@/types/game.types";

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

interface FavoritesProviderProps {
  children: React.ReactNode;
  initialUserFavorites?: UserFavoriteGame[];
  isAuthenticated?: boolean;
}

/**
 * FavoritesProvider - Manages favorite games state
 *
 * Features:
 * - Local storage persistence for anonymous users
 * - API sync for authenticated users
 * - Optimistic updates
 * - Error handling with rollback
 */
export function FavoritesProvider({
  children,
  initialUserFavorites = [],
  isAuthenticated = false,
}: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [userFavorites, setUserFavorites] =
    useState<UserFavoriteGame[]>(initialUserFavorites);
  const [isLoading] = useState(false);
  const router = useRouter();

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated) {
      const stored = localStorage.getItem("favorites");
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (error) {
          console.error("Failed to parse favorites from localStorage:", error);
        }
      }
    }
  }, [isAuthenticated]);

  // Save to localStorage when favorites change (for anonymous users)
  useEffect(() => {
    if (!isAuthenticated && favorites.length > 0) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites, isAuthenticated]);

  // Convert GameData to FavoriteGame format
  const gameToFavorite = useCallback((game: GameData): FavoriteGame => {
    // Handle images - get the first image if it's an array
    const gameImage = Array.isArray(game.images) ? game.images[0] : game.images;

    return {
      id: game.id,
      title: game.title,
      slug: game.slug,
      ratingAvg: game.ratingAvg,
      publishedAt: game.publishedAt,
      provider: game.provider
        ? {
            slug: game.provider.slug,
            title: game.provider.title,
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
      const favoriteGame = gameToFavorite(game);

      // Optimistic update
      if (isAuthenticated) {
        setUserFavorites((prev) => [...prev, { id: Date.now(), game }]);
      } else {
        setFavorites((prev) => [...prev, favoriteGame]);
      }

      // API call for authenticated users
      if (isAuthenticated) {
        try {
          const response = await fetch("/api/user/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId: game.id }),
          });

          if (!response.ok) {
            throw new Error("Failed to add favorite");
          }

          const newFavorite = await response.json();

          // Update with actual server response
          setUserFavorites((prev) =>
            prev.map((fav) => (fav.id === Date.now() ? newFavorite : fav))
          );

          // Refresh router to update any server components
          router.refresh();
        } catch (error) {
          // Rollback on error
          console.error("Failed to add favorite:", error);
          setUserFavorites((prev) =>
            prev.filter((fav) => fav.game.id !== game.id)
          );
        }
      }
    },
    [isAuthenticated, gameToFavorite, router]
  );

  // Remove favorite
  const removeFavorite = useCallback(
    async (gameId: number) => {
      // Store current state for rollback
      // const prevFavorites = favorites;
      const prevUserFavorites = userFavorites;

      // Optimistic update
      if (isAuthenticated) {
        setUserFavorites((prev) =>
          prev.filter((fav) => fav.game.id !== gameId)
        );
      } else {
        setFavorites((prev) => prev.filter((fav) => fav.id !== gameId));
        localStorage.setItem(
          "favorites",
          JSON.stringify(favorites.filter((fav) => fav.id !== gameId))
        );
      }

      // API call for authenticated users
      if (isAuthenticated) {
        try {
          const userFavorite = userFavorites.find(
            (fav) => fav.game.id === gameId
          );
          if (!userFavorite) return;

          const response = await fetch(
            `/api/user/favorites/${userFavorite.id}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to remove favorite");
          }

          // Refresh router to update any server components
          router.refresh();
        } catch (error) {
          // Rollback on error
          console.error("Failed to remove favorite:", error);
          setUserFavorites(prevUserFavorites);
        }
      }
    },
    [favorites, userFavorites, isAuthenticated, router]
  );

  // Check if game is favorited
  const isFavorited = useCallback(
    (gameId: number): boolean => {
      if (isAuthenticated) {
        return userFavorites.some((fav) => fav.game.id === gameId);
      }
      return favorites.some((fav) => fav.id === gameId);
    },
    [favorites, userFavorites, isAuthenticated]
  );

  const value: FavoritesContextValue = {
    favorites,
    userFavorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorited,
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
