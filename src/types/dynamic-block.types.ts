// src/types/dynamic-block.types.ts

import type { NewAndLovedSlotsBlock } from "./new-and-loved-slots.types";
import type {
  StrapiImage,
  BlogData,
} from "./strapi.types";
import type { GameData } from "./game.types";
import type { CasinoData } from "./casino.types";
import { AuthorData } from "./author.types";

// Define Provider and Category interfaces locally since they're not exported from strapi.types
interface Provider {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  images?: StrapiImage;
}

interface Category {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  images?: StrapiImage;
}

interface Link {
  label: string;
  url: string;
}

interface Testimony {
  id: number;
  title: string;
  testimony: string;
  testifierName: string;
  testifierTitle?: string;
  provider?: Provider;
}

// Homepage Block Interfaces
export interface IntroductionWithImageBlock {
  __component: "shared.introduction-with-image";
  id: number;
  heading?: string;
  introduction?: string;
  image?: StrapiImage;
}

export interface OverviewBlock {
  __component: "shared.overview-block";
  id: number;
  title?: string;
  overview_type?: string;
  overviews?: Array<{
    title: string;
    url: string;
    card_img?: StrapiImage;
  }>;
}

export interface HomeGameListBlock {
  __component: "homepage.home-game-list";
  id: number;
  numberOfGames?: number;
  sortBy?: string;
  gameListTitle?: string;
  providers?: {
    id: number;
    slotProvider?: Provider;
  }[];
  link?: Link;
}

export interface HomeFeaturedProvidersBlock {
  __component: "homepage.home-featured-providers";
  id: number;
  title?: string;
  homeFeaturedProviders?:
    | Array<{
        id: number;
        providers?: Provider[];
      }>
    | {
        providers?: Provider[];
      };
}

export interface HomeProvidersBlock {
  __component: "homepage.home-providers";
  id: number;
  providersList?: Array<{
    id: number;
    providers?: Provider[];
  }>;
}

export interface HomeFeaturedCategoriesBlock {
  __component: "homepage.home-featured-categories";
  id: number;
  homeCategoriesList?:
    | Array<{
        id: number;
        slot_categories?: Category[];
      }>
    | {
        slot_categories?: Category[];
      };
}

export interface SingleContentBlock {
  __component: "shared.single-content";
  id: number;
  content?: string;
}

export interface HomeCasinoListBlock {
  __component: "homepage.home-casino-list";
  id: number;
  casinoTableTitle?: string;
}

export interface HomeTestimoniesBlock {
  __component: "homepage.home-testimonies";
  id: number;
  title?: string;
  homeTestimonies?: Testimony[];
}

export interface HomeBlogListBlock {
  __component: "homepage.home-blog-list";
  id: number;
  numOfBlogs?: number;
  link?: Link;
}

// Custom Page Specific Block Interfaces
export interface ImageBlock {
  __component: "shared.image";
  id: number;
  image?: StrapiImage;
}

export interface GamesCarouselBlock {
  __component: "games.games-carousel";
  id: number;
  numberOfGames?: number;
  sortBy?: string;
  showGameFilterPanel?: boolean;
  showGameMoreButton?: boolean;
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
  games?: GameData[];
}

export interface CasinoListBlock {
  __component: "casinos.casino-list";
  id: number;
  showCasinoTableHeader?: boolean;
  casinoSort?: string;
  casinoFilters?: string;
  showCasinoFilters?: boolean;
  showLoadMore?: boolean;
  numberPerLoadMore?: number;
  casinosList?: Array<{
    id: number;
    casino?: CasinoData;
  }>;
}

export interface CasinoComparisonBlock {
  __component: "casinos.casinos-comparison";
  id: number;
  heading?: string;
  casinos?: Array<{
    id: number;
    casino?: CasinoData;
  }>;
}

export interface ProviderListBlock {
  __component: "shared.provider-list";
  id: number;
  providers?: Provider[];
}

export interface HowToGroupBlock {
  __component: "shared.how-to-group";
  id: number;
  title?: string;
  description?: string;
  howToGroup?: Array<{
    id: number;
    heading: string;
    copy: string;
    image?: StrapiImage;
  }>;
}

export interface ImageWithParagraphBlock {
  __component: "shared.image-with-paragraph";
  id: number;
  imageWithParagraph?: Array<{
    id: number;
    heading: string;
    copy: string;
    image?: StrapiImage;
  }>;
}

export interface MediumImageWithContentBlock {
  __component: "shared.medium-image-with-content";
  id: number;
  title?: string;
  content?: string;
  image?: StrapiImage;
}

export interface ProsAndConsBlock {
  __component: "shared.pros-and-cons";
  id: number;
  heading?: string;
  pros?: {
    list?: string[];
  };
  cons?: {
    list?: string[];
  };
  proImage?: StrapiImage;
  conImage?: StrapiImage;
}

export interface ImageCarouselBlock {
  __component: "shared.image-carousel";
  id: number;
  carouselTitle?: string;
  image?: StrapiImage[];
}

export interface GamesNewAndLovedSlotsBlock {
  __component: "games.new-and-loved-slots";
  id: number;
  newSlots?: boolean;
  slot_categories?: Category[];
  slot_providers?: Provider[];
}

// Union type for all possible block data structures
export type BlockData =
  // Homepage blocks
  | IntroductionWithImageBlock
  | OverviewBlock
  | HomeGameListBlock
  | HomeFeaturedProvidersBlock
  | HomeProvidersBlock
  | HomeFeaturedCategoriesBlock
  | SingleContentBlock
  | HomeCasinoListBlock
  | HomeTestimoniesBlock
  | HomeBlogListBlock
  | NewAndLovedSlotsBlock
  // Custom page blocks
  | ImageBlock
  | GamesCarouselBlock
  | CasinoListBlock
  | CasinoComparisonBlock
  | ProviderListBlock
  | HowToGroupBlock
  | ImageWithParagraphBlock
  | MediumImageWithContentBlock
  | ProsAndConsBlock
  | ImageCarouselBlock
  | GamesNewAndLovedSlotsBlock
  | QuicklinksBlock;

export type BlockType =
  // Homepage block types
  | "homepage.home-game-list"
  | "homepage.home-casino-list"
  | "homepage.home-blog-list"
  | "shared.introduction-with-image"
  | "homepage.home-providers"
  | "homepage.home-featured-providers"
  | "shared.overview-block"
  | "shared.single-content"
  | "homepage.home-testimonies"
  | "homepage.home-featured-categories"
  | "games.new-and-loved-slots"
  // Custom page block types
  | "shared.image"
  | "games.games-carousel"
  | "casinos.casino-list"
  | "casinos.casinos-comparison"
  | "shared.provider-list"
  | "shared.how-to-group"
  | "shared.image-with-paragraph"
  | "shared.medium-image-with-content"
  | "shared.pros-and-cons"
  | "shared.image-carousel"
  | "games.new-and-loved-slots"
  | "shared.quicklinks";

export interface DynamicBlockProps {
  blockType: BlockType | string;
  blockData: BlockData;
  additionalData?: {
    translations?: Record<string, string>;
    games?: GameData[];
    casinos?: CasinoData[];
    blogs?: BlogData[];
    country?: string;
    dynamicGamesData?: {
      [blockId: string]: {
        newGames?: GameData[];
        popularGames?: GameData[];
        games?: GameData[];
      };
    };
    dynamicCasinosData?: {
      // Add this
      [blockId: string]: CasinoData[];
    };
    showContentDate?: boolean;
    authorData?: AuthorData;
  };
}

export interface BlockComponentProps {
  translations?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Quicklinks block type
 */
export interface QuicklinksBlock {
  id: number;
  __component: "shared.quicklinks";
  showQuickLinks: boolean;
}
