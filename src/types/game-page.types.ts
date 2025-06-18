// src/types/game-page.types.ts

import type { StrapiBaseEntity, ImageData, SEOData } from "./strapi.types";
import type { GameData } from "./game.types";
import type { AuthorData } from "./author.types";

/**
 * Game info table structure from Strapi
 */
export interface GameInfoTable {
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
 * How-to group structure
 */
export interface HowToGroup {
  id: number;
  heading?: string;
  copy?: string;
  image?: ImageData;
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
  pros?: Array<string | { id: number; list: string }>;
  cons?: Array<string | { id: number; list: string }>;
  proImage?: ImageData;
  conImage?: ImageData;
}

/**
 * Image carousel block
 */
export interface ImageCarouselBlock {
  id: number;
  __component: "shared.image-carousel";
  carouselTitle?: string;
  image?: ImageData[];
}

/**
 * Union type for all possible blocks
 */
export type GamePageBlock = ImageCarouselBlock;

/**
 * Complete game page data structure
 */
export interface GamePageData extends StrapiBaseEntity {
  title: string;
  heading?: string;
  slug: string;
  introduction?: string;
  content1?: string;
  ratingAvg: number;
  ratingCount: number;
  views?: number;
  isGameDisabled?: boolean;
  gameDisableText?: string;
  gamesApiOverride?: string;
  blocks?: GamePageBlock[];
  author?: AuthorData;
  howTo?: HowToSection;
  proscons?: ProsConsSection;
  categories?: Array<{ title: string }>;
  embedCode?: EmbedCode;
  faqs?: FAQ[];
  gameInfoTable?: GameInfoTable;
  images?: ImageData[];
  provider?: {
    title: string;
    slug: string;
  };
  seo?: SEOData;
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
    title: string;
    heading?: string;
    slug: string;
    introduction?: string;
    content1?: string;
    blocks?: GamePageBlock[];
    author?: AuthorData;
    howTo?: HowToSection;
    proscons?: ProsConsSection;
    faqs?: FAQ[];
    gameInfoTable?: GameInfoTable;
    seo?: SEOData;
  };
  dynamicData: {
    ratingAvg: number;
    ratingCount: number;
    views?: number;
    isGameDisabled?: boolean;
    gameDisableText?: string;
    gamesApiOverride?: string;
    embedCode?: EmbedCode;
    images?: ImageData[];
    provider?: {
      title: string;
      slug: string;
    };
    categories?: Array<{ title: string }>;
  };
}
