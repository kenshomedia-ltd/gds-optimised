// src/types/favorite.types.ts

import type { GameData } from "./game.types";

/**
 * Favorite game structure stored in local storage/state
 */
export interface FavoriteGame {
  id: number;
  title: string;
  slug: string;
  ratingAvg: number;
  publishedAt?: string;
  provider?: {
    slug: string;
    title: string;
  };
  images?: {
    url: string;
  };
  categories?: Array<{ title: string }>;
}

/**
 * User favorite game from API
 */
export interface UserFavoriteGame {
  id: number;
  game: GameData;
  createdAt?: string;
}

/**
 * Favorite button props
 */
export interface FavoriteButtonProps {
  gameId: number;
  gameTitle: string;
  game?: GameData;
  translations?: Record<string, string>;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Favorites context value
 */
export interface FavoritesContextValue {
  favorites: FavoriteGame[];
  userFavorites: UserFavoriteGame[];
  isLoading: boolean;
  addFavorite: (game: GameData) => Promise<void>;
  removeFavorite: (gameId: number) => Promise<void>;
  isFavorited: (gameId: number) => boolean;
}
