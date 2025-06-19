// src/types/game-page.types.ts

import type { StrapiImage, SEOData, Author } from "./strapi.types";

/**
 * Game info table structure from Strapi
 */
export interface GameInfoTable {
  id: number;
  rtp?: string;
  volatilita?: string;
  layout?: string;
  lineeDiPuntata?: string;
  puntataMinima?: string;
  puntataMassima?: string;
  jackpot?: string;
  freeSpins?: string;
  bonusGame?: string;
}

/**
 * Embed code structure
 */
export interface EmbedCode {
  desktopEmbedCode?: string;
  mobileEmbedCode?: string;
}

/**
 * FAQ structure
 */
export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

/**
 * Pros/cons item structure
 */
export interface ProConItem {
  id: number;
  list: string;
}

/**
 * How-to group structure
 */
export interface HowToGroup {
  id: number;
  heading?: string;
  copy?: string;
  image?: StrapiImage;
}

/**
 * How-to section structure
 */
export interface HowToSection {
  id: number;
  title?: string;
  description?: string;
  howToGroup?: HowToGroup[];
}

/**
 * Pros and cons section
 */
export interface ProsConsSection {
  id: number;
  heading?: string;
  pros?: ProConItem[];
  cons?: ProConItem[];
  proImage?: StrapiImage;
  conImage?: StrapiImage;
}

/**
 * Image carousel block
 */
export interface ImageCarouselBlock {
  id: number;
  __component: "shared.image-carousel";
  carouselTitle?: string;
  image?: StrapiImage[];
}

/**
 * Union type for all possible blocks
 */
export type GamePageBlock = ImageCarouselBlock;

/**
 * Category structure
 */
export interface GameCategory {
  id: number;
  documentId: string;
  title: string;
  slug: string;
}

/**
 * Provider structure
 */
export interface GameProvider {
  id: number;
  documentId: string;
  title: string;
  slug: string;
}

/**
 * Complete game page data structure
 */
export interface GamePageData {
  id: number;
  documentId?: string;
  title: string;
  heading?: string;
  slug: string;
  introduction?: string;
  content1?: string;
  ratingAvg: number;
  ratingCount: number;
  views: number;
  isGameDisabled?: boolean;
  gameDisableText?: string;
  gamesApiOverride?: boolean;
  blocks?: GamePageBlock[];
  author?: Author;
  howTo?: HowToSection;
  proscons?: ProsConsSection;
  categories?: GameCategory[];
  embedCode?: EmbedCode;
  faqs?: FAQ[];
  gameInfoTable?: GameInfoTable;
  images?: StrapiImage;
  provider?: GameProvider;
  seo?: SEOData;
  // Date fields that were missing
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

/**
 * Game player component props
 */
export interface GamePlayerProps {
  game: GamePageData;
  translations?: Record<string, string>;
}

/**
 * Game player state
 */
export interface GamePlayerState {
  isPlaying: boolean;
  isFullscreen: boolean;
  showInfo: boolean;
  isMobile: boolean;
}

/**
 * Split query data for game pages
 */
export interface GamePageSplitData {
  staticData: {
    id: number;
    documentId?: string;
    title: string;
    heading?: string;
    slug: string;
    introduction?: string;
    content1?: string;
    blocks?: GamePageBlock[];
    author?: Author;
    howTo?: HowToSection;
    proscons?: ProsConsSection;
    faqs?: FAQ[];
    gameInfoTable?: GameInfoTable;
    seo?: SEOData;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
  dynamicData: {
    ratingAvg: number;
    ratingCount: number;
    views: number;
    isGameDisabled?: boolean;
    gameDisableText?: string;
    gamesApiOverride?: boolean;
    embedCode?: EmbedCode;
    images?: StrapiImage;
    provider?: GameProvider;
    categories?: GameCategory[];
  };
}