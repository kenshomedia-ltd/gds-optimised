// src/types/custom-page.types.ts

import type {
  BlockComponent,
  SEOData,
  StrapiImage,
  Author,
} from "./strapi.types";
import type { BreadcrumbItem } from "./breadcrumbs.types";
import type { GameData } from "./game.types";
import type { CasinoData } from "./casino.types";

/**
 * Base interface for all custom page blocks
 */
export interface BaseCustomPageBlock extends BlockComponent {
  id: number;
  __component: string;
}

/**
 * Introduction with image block
 */
export interface IntroductionWithImageBlock extends BaseCustomPageBlock {
  __component: "shared.introduction-with-image";
  heading?: string;
  introduction?: string;
  image?: StrapiImage;
}

/**
 * Single content block
 */
export interface SingleContentBlock extends BaseCustomPageBlock {
  __component: "shared.single-content";
  content?: string;
  heading?: string;
}

/**
 * Image block
 */
export interface ImageBlock extends BaseCustomPageBlock {
  __component: "shared.image";
  image?: StrapiImage;
  caption?: string;
  altText?: string;
}

/**
 * Games carousel block
 */
export interface GamesCarouselBlock extends BaseCustomPageBlock {
  __component: "games.games-carousel";
  numberOfGames?: number;
  sortBy?: string;
  showGameFilterPanel?: boolean;
  gameProviders?: Array<{
    id: number;
    slotProvider?: {
      id: number;
      slug: string;
      title: string;
    };
  }>;
  gameCategories?: Array<{
    id: number;
    slotCategory?: {
      id: number;
      slug: string;
      title: string;
    };
  }>;
  games?: GameData[]; // Populated after enrichment
}

/**
 * Casino list block
 */
export interface CasinoListBlock extends BaseCustomPageBlock {
  __component: "casinos.casino-list";
  showCasinoTableHeader?: boolean;
  casinoSort?: string;
  casinoFilters?: string;
  showCasinoFilters?: boolean;
  showLoadMore?: boolean;
  numberPerLoadMore?: number;
  casinosList?: Array<{
    id: number;
    casinoName: string;
    casino?: CasinoData;
  }>;
  link?: {
    url: string;
    label: string;
  };
}

/**
 * Overview block
 */
export interface OverviewBlock extends BaseCustomPageBlock {
  __component: "shared.overview-block";
  title?: string;
  overview_type?: string;
  overviews?: Array<{
    id: number;
    title: string;
    url: string;
    card_img?: StrapiImage;
  }>;
}

/**
 * Provider type for blocks
 */
interface Provider {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  images?: StrapiImage;
}

/**
 * Category type for blocks
 */
interface Category {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  images?: StrapiImage;
}

/**
 * New and loved slots block
 */
export interface NewAndLovedSlotsBlock extends BaseCustomPageBlock {
  __component: "games.new-and-loved-slots";
  newSlots?: boolean;
  slot_categories?: Category[];
  slot_providers?: Provider[];
}

/**
 * Quicklinks block
 */
export interface QuicklinksBlock extends BaseCustomPageBlock {
  __component: "shared.quicklinks";
  showQuickLinks: boolean;
}

/**
 * Dynamic games data structure
 */
export interface DynamicGamesData {
  [blockId: string]: {
    newGames?: GameData[];
    popularGames?: GameData[];
    games?: GameData[];
  };
}

/**
 * Dynamic casinos data structure
 */
export interface DynamicCasinosData {
  [blockId: string]: CasinoData[];
}

/**
 * Union type for all custom page blocks
 */
export type CustomPageBlock =
  | IntroductionWithImageBlock
  | SingleContentBlock
  | ImageBlock
  | GamesCarouselBlock
  | CasinoListBlock
  | OverviewBlock
  | NewAndLovedSlotsBlock
  | QuicklinksBlock;

/**
 * Custom page data structure
 */
export interface CustomPageData {
  id: number;
  documentId?: string;
  title: string;
  urlPath: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  showContentDate: boolean;
  sideBarToShow?: string | null;
  seo: SEOData;
  breadcrumbs: BreadcrumbItem[];
  author?: Author;
  blocks: CustomPageBlock[];
}

/**
 * Custom page metadata
 */
export interface CustomPageMetadata {
  id: number;
  title: string;
  urlPath: string;
  publishedAt?: string;
  seo?: SEOData;
}

/**
 * Custom page response with split queries
 */
export interface CustomPageResponse {
  pageData: CustomPageData | null;
  games?: GameData[]; // Deprecated - for backward compatibility
  casinos?: CasinoData[]; // Deprecated - for backward compatibility
  dynamicGamesData?: DynamicGamesData;
  dynamicCasinosData?: DynamicCasinosData;
  relatedPages?: CustomPageData[];
}

/**
 * Custom page response using split queries
 */
export interface CustomPageSplitResponse {
  pageData: CustomPageData | null;
  dynamicGamesData: DynamicGamesData;
  dynamicCasinosData: DynamicCasinosData;
}

/**
 * Helper type for game settings extraction
 */
export interface ExtractedGameSettings {
  providers: string[];
  categories: string[];
  totalGamesToDisplay: number;
  sortBy: string;
}
