// src/types/homepage.types.ts

import type {
  GameData,
  BlogData,
  CasinoData,
  SEOData,
  StrapiImage,
} from "./strapi.types";

/**
 * Homepage block component types
 */
export type HomepageBlockComponent =
  | "shared.single-content"
  | "homepage.home-game-list"
  | "homepage.home-casino-list"
  | "shared.introduction-with-image"
  | "homepage.home-providers"
  | "homepage.home-testimonies"
  | "homepage.home-featured-providers"
  | "homepage.home-featured-categories"
  | "shared.overview-block"
  | "homepage.home-blog-list";

/**
 * Base homepage block
 */
export interface BaseHomepageBlock {
  id: number;
  __component: HomepageBlockComponent;
}

/**
 * Single content block
 */
export interface SingleContentBlock extends BaseHomepageBlock {
  __component: "shared.single-content";
  content?: string;
  heading?: string;
}

/**
 * Game list block
 */
export interface HomeGameListBlock extends BaseHomepageBlock {
  __component: "homepage.home-game-list";
  numberOfGames?: number;
  sortBy?: string;
  gameListTitle?: string;
  providers?: Array<{
    id: number;
    slotProvider?: {
      id: number;
      title: string;
      slug: string;
      images?: StrapiImage;
    };
  }>;
  link?: {
    label: string;
    url: string;
  };
}

/**
 * Casino list block
 */
export interface HomeCasinoListBlock extends BaseHomepageBlock {
  __component: "homepage.home-casino-list";
  casinoTableTitle?: string;
  casinosList?: Array<{
    id: number;
    casinoName: string;
    casino?: CasinoData;
  }>;
}

/**
 * Introduction with image block
 */
export interface IntroductionWithImageBlock extends BaseHomepageBlock {
  __component: "shared.introduction-with-image";
  heading?: string;
  introduction?: string;
  image?: StrapiImage;
}

/**
 * Home providers block
 */
export interface HomeProvidersBlock extends BaseHomepageBlock {
  __component: "homepage.home-providers";
  providersList?: Array<{
    id: number;
    providers?: Array<{
      id: number;
      title: string;
      slug: string;
      images?: StrapiImage;
    }>;
  }>;
}

/**
 * Home testimonies block
 */
export interface HomeTestimoniesBlock extends BaseHomepageBlock {
  __component: "homepage.home-testimonies";
  title?: string;
  homeTestimonies?: Array<{
    id: number;
    title: string;
    testimony: string;
    testifierName: string;
    testifierTitle?: string;
    provider?: {
      id: number;
      title: string;
      slug: string;
      images?: StrapiImage;
    };
  }>;
}

/**
 * Home featured providers block
 */
export interface HomeFeaturedProvidersBlock extends BaseHomepageBlock {
  __component: "homepage.home-featured-providers";
  title?: string;
  homeFeaturedProviders?: Array<{
    id: number;
    providers?: Array<{
      id: number;
      title: string;
      slug: string;
      images?: StrapiImage;
    }>;
  }>;
}

/**
 * Home featured categories block
 */
export interface HomeFeaturedCategoriesBlock extends BaseHomepageBlock {
  __component: "homepage.home-featured-categories";
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

/**
 * Overview block
 */
export interface OverviewBlock extends BaseHomepageBlock {
  __component: "shared.overview-block";
  overview_type?: string;
  overviews?: Array<{
    id: number;
    title: string;
    url: string;
    card_img?: StrapiImage;
  }>;
}

/**
 * Blog list block
 */
export interface HomeBlogListBlock extends BaseHomepageBlock {
  __component: "homepage.home-blog-list";
  numOfBlogs?: number;
  link?: {
    label: string;
    url: string;
  };
}

/**
 * Union type for all homepage blocks
 */
export type HomepageBlock =
  | SingleContentBlock
  | HomeGameListBlock
  | HomeCasinoListBlock
  | IntroductionWithImageBlock
  | HomeProvidersBlock
  | HomeTestimoniesBlock
  | HomeFeaturedProvidersBlock
  | HomeFeaturedCategoriesBlock
  | OverviewBlock
  | HomeBlogListBlock;

/**
 * Homepage data structure
 */
export interface Homepage {
  id: number;
  documentId: string;
  title: string;
  heading?: string;
  updatedAt: string;
  blocks: HomepageBlock[];
  seo?: SEOData;
}

/**
 * Homepage data response with all loaded content
 */
export interface HomepageDataResponse {
  homepage: Homepage;
  games: GameData[];
  blogs: BlogData[];
  casinos?: CasinoData[];
}

/**
 * Extracted game settings for data loading
 */
export interface ExtractedGameSettings {
  providers: string[];
  totalGamesToDisplay: number;
  gamesQuotaPerProvider: number;
  sortBy: string;
}

/**
 * Props for homepage components
 */
export interface HomepageProps {
  data: HomepageDataResponse;
  locale?: string;
}

/**
 * Props for individual homepage blocks
 */
export interface HomepageBlockProps<T extends HomepageBlock = HomepageBlock> {
  block: T;
  index: number;
  locale?: string;
}

/**
 * Cache configuration for homepage
 */
export interface HomepageCacheConfig {
  ttl: number;
  tags: string[];
  revalidate: number;
}

/**
 * Metadata for homepage
 */
export interface HomepageMetadata {
  title: string;
  description: string;
  openGraph?: {
    title: string;
    description: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
  twitter?: {
    card: "summary" | "summary_large_image";
    title?: string;
    description?: string;
    images?: string[];
  };
}
