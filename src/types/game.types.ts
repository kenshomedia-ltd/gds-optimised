// src/types/game.types.ts

import type { StrapiImage } from "./strapi.types";

/**
 * Game provider structure
 */
export interface GameProvider {
  id?: number;
  documentId?: string;
  title: string;
  slug: string;
  images?: StrapiImage;
}

/**
 * Game category structure
 */
export interface GameCategory {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  images?: StrapiImage;
}

/**
 * Normalized game structure for frontend use
 */
export interface GameData {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  ratingAvg: number;
  ratingCount?: number;
  views?: number;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  images?: StrapiImage | StrapiImage[];
  provider?: GameProvider;
  categories?: GameCategory[];
  isGameDisabled?: boolean;
  gameDisableText?: string;
}

/**
 * Game card props
 */
export interface GameCardProps {
  game: GameData;
  translations?: Record<string, string>;
  priority?: boolean;
  loading?: "lazy" | "eager";
  className?: string;
  index?: number;
}

/**
 * Game grid configuration
 */
export interface GameGridConfig {
  numberOfGames: number;
  sortBy: string;
  showFilters?: boolean;
  showLoadMore?: boolean;
  providers?: string[];
  categories?: string[];
  author?: string;
  page?: number;
}

/**
 * Game filters
 */
export interface GameFilters {
  providers?: string[];
  categories?: string[];
  sort?: string;
  search?: string;
}

/**
 * Homepage game list block structure
 */
export interface HomeGameListBlock {
  id: number;
  __component: "homepage.home-game-list";
  numberOfGames?: number;
  sortBy?: string;
  gameListTitle?: string;
  providers?: Array<{
    id: number;
    slotProvider?: GameProvider;
  }>;
  link?: {
    label: string;
    url: string;
  };
}

/**
 * Game list props
 */
export interface GameListProps {
  block: HomeGameListBlock;
  games: GameData[];
  translations?: Record<string, string>;
  className?: string;
}

/**
 * Game API response
 */
export interface GameListResponse {
  games: GameData[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type TDashboardGame = {
  id: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  game: TUserGame;
};

export type TUserGame = {
  id: number;
  title: string;
  slug: string;
  ratingAvg: number;
  createdAt: string;
  publishedAt: string;
  images: TUserGameImage;
  provider: TUserGameProvider;
  categories?: {
    title: string;
  }[];
};

export type TUserGameImage = {
  url: string;
};

export type TUserGameProvider = {
  slug: string;
  title: string;
};
