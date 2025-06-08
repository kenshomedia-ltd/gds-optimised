// src/types/dynamic-block.types.ts

// CHANGED: Imported the data types directly from the source
import type {
  StrapiImage,
  GameData,
  BlogData,
  CasinoData,
} from "./strapi.types";

interface Provider {
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

interface Overview {
  id: number;
  title: string;
  url: string;
  card_img?: StrapiImage;
}

interface Testimony {
  id: number;
  title: string;
  testimony: string;
  testifierName: string;
  testifierTitle?: string;
  provider?: Provider;
}

// Block-Specific Interfaces
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
  overview_type?: string;
  overviews?: Overview[];
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
  homeFeaturedProviders?: Array<{
    id: number;
    providers?: Provider[];
  }>;
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
  homeCategoriesList?: Array<{
    id: number;
    slot_categories?: Array<{
      id: number;
      title: string;
      slug: string;
      images?: StrapiImage;
    }>;
  }>;
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

// Union type for all possible block data structures
export type BlockData =
  | IntroductionWithImageBlock
  | OverviewBlock
  | HomeGameListBlock
  | HomeFeaturedProvidersBlock
  | HomeProvidersBlock
  | HomeFeaturedCategoriesBlock
  | SingleContentBlock
  | HomeCasinoListBlock
  | HomeTestimoniesBlock
  | HomeBlogListBlock;

export type BlockType =
  | "homepage.home-game-list"
  | "homepage.home-casino-list"
  | "homepage.home-blog-list"
  | "shared.introduction-with-image"
  | "casinos.casino-list"
  | "homepage.home-providers"
  | "homepage.home-featured-providers"
  | "shared.overview-block"
  | "shared.single-content"
  | "homepage.home-testimonies"
  | "homepage.home-featured-categories";

// REMOVED: The incorrect placeholder interfaces for Game, Casino, and Blog are no longer needed.

export interface DynamicBlockProps {
  blockType: BlockType | string;
  blockData: BlockData;
  additionalData?: {
    translations?: Record<string, string>;
    games?: GameData[]; // FIX: Using the imported GameData type
    casinos?: CasinoData[]; // FIX: Using the imported CasinoData type
    blogs?: BlogData[]; // FIX: Using the imported BlogData type
    country?: string;
  };
}

export interface BlockComponentProps {
  translations?: Record<string, string>;
  [key: string]: unknown;
}
