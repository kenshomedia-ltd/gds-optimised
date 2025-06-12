// src/types/custom-page-blocks.types.ts
import type {
  StrapiImage,
  Provider,
  Category,
  GameData,
  CasinoData,
} from "./strapi.types";

/**
 * Base block structure
 */
export interface BaseCustomPageBlock {
  id: number;
  __component: string;
}

/**
 * Introduction with Image Block
 */
export interface IntroductionWithImageBlock extends BaseCustomPageBlock {
  __component: "shared.introduction-with-image";
  heading?: string;
  introduction?: string;
  image?: StrapiImage;
}

/**
 * Single Content Block
 */
export interface SingleContentBlock extends BaseCustomPageBlock {
  __component: "shared.single-content";
  content?: string;
}

/**
 * Image Block
 */
export interface ImageBlock extends BaseCustomPageBlock {
  __component: "shared.image";
  image?: StrapiImage;
}

/**
 * Games New and Loved Slots Block
 */
export interface GamesNewAndLovedSlotsBlock extends BaseCustomPageBlock {
  __component: "games.new-and-loved-slots";
  newSlots?: boolean;
  slot_categories?: Category[];
  slot_providers?: Provider[];
}

/**
 * Games Carousel Block
 */
export interface GamesCarouselBlock extends BaseCustomPageBlock {
  __component: "games.games-carousel";
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
  games?: GameData[]; // Injected after fetching
}

/**
 * Casino List Block
 */
export interface CasinoListBlock extends BaseCustomPageBlock {
  __component: "casinos.casino-list";
  heading?: string;
  casinosList?: Array<{
    id: number;
    casino?: CasinoData;
  }>;
}

/**
 * Casino Comparison Block
 */
export interface CasinoComparisonBlock extends BaseCustomPageBlock {
  __component: "casinos.casinos-comparison";
  heading?: string;
  casinos?: Array<{
    id: number;
    casino?: CasinoData;
  }>;
}

/**
 * Overview Block
 */
export interface OverviewBlock extends BaseCustomPageBlock {
  __component: "shared.overview-block";
  title?: string;
  overviews?: Array<{
    title: string;
    url: string;
    card_img?: StrapiImage;
  }>;
}

/**
 * Provider List Block
 */
export interface ProviderListBlock extends BaseCustomPageBlock {
  __component: "shared.provider-list";
  providers?: Provider[];
}

/**
 * How To Group Block
 */
export interface HowToGroupBlock extends BaseCustomPageBlock {
  __component: "shared.how-to-group";
  title?: string;
  description?: string;
  howToGroup?: Array<{
    id: number;
    heading: string;
    copy: string;
    image?: StrapiImage;
  }>;
}

/**
 * Image With Paragraph Block
 */
export interface ImageWithParagraphBlock extends BaseCustomPageBlock {
  __component: "shared.image-with-paragraph";
  imageWithParagraph?: Array<{
    id: number;
    heading: string;
    copy: string;
    image?: StrapiImage;
  }>;
}

/**
 * Medium Image With Content Block
 */
export interface MediumImageWithContentBlock extends BaseCustomPageBlock {
  __component: "shared.medium-image-with-content";
  title?: string;
  content?: string;
  image?: StrapiImage;
}

/**
 * Pros and Cons Block
 */
export interface ProsAndConsBlock extends BaseCustomPageBlock {
  __component: "shared.pros-and-cons";
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

/**
 * Image Carousel Block
 */
export interface ImageCarouselBlock extends BaseCustomPageBlock {
  __component: "shared.image-carousel";
  carouselTitle?: string;
  image?: StrapiImage[];
}

/**
 * Homepage Featured Providers Block
 */
export interface HomeFeaturedProvidersBlock extends BaseCustomPageBlock {
  __component: "homepage.home-featured-providers";
  homeFeaturedProviders?: {
    providers?: Provider[];
  };
}

/**
 * Homepage Featured Categories Block
 */
export interface HomeFeaturedCategoriesBlock extends BaseCustomPageBlock {
  __component: "homepage.home-featured-categories";
  homeCategoriesList?: {
    slot_categories?: Category[];
  };
}

/**
 * Union type for all custom page blocks
 */
export type CustomPageBlock =
  | IntroductionWithImageBlock
  | SingleContentBlock
  | ImageBlock
  | GamesNewAndLovedSlotsBlock
  | GamesCarouselBlock
  | CasinoListBlock
  | CasinoComparisonBlock
  | OverviewBlock
  | ProviderListBlock
  | HowToGroupBlock
  | ImageWithParagraphBlock
  | MediumImageWithContentBlock
  | ProsAndConsBlock
  | ImageCarouselBlock
  | HomeFeaturedProvidersBlock
  | HomeFeaturedCategoriesBlock;
