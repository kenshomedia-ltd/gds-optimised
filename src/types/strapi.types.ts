// src/types/strapi.types.ts

import type { BreadcrumbItem } from "./breadcrumbs.types";
import type { GameData } from "./game.types";
import type { CasinoData } from "./casino.types";

/**
 * Basic Strapi image structure
 */
export interface StrapiImage {
  id: number;
  url: string;
  width: number;
  height: number;
  alternativeText?: string;
  mime?: string;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
}

export interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  mime: string;
}

/**
 * SEO data structure
 */
export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalURL?: string;
  metaImage?: StrapiImage;
  metaSocial?: Array<{
    socialNetwork: string;
    title: string;
    description: string;
    image?: StrapiImage;
  }>;
}

/**
 * Navigation item structure
 */
export interface NavigationItem {
  id: number;
  title: string;
  url?: string;
  images?: StrapiImage;
  subMenu?: NavigationItem[];
}

/**
 * Footer image item structure
 */
export interface FooterImageItem {
  id: number;
  imageName: string;
  imageLink?: string;
  image: StrapiImage;
}

/**
 * Layout data structure with breadcrumb support
 */
export interface LayoutData {
  id: number;
  documentId?: string;
  Logo: StrapiImage;
  legalText: string;
  footerContent: string;
  footerImages: FooterImageItem[];
  // Breadcrumb collections - dynamic keys based on your CMS setup
  homeBreadcrumbs?: BreadcrumbItem[];
  casinoProvidersBreadcrumbs?: BreadcrumbItem[];
  gameProvidersBreadcrumbs?: BreadcrumbItem[];
  blogBreadcrumbs?: BreadcrumbItem[];
  // Add more breadcrumb collections as needed
  [key: string]: unknown; // Changed from 'any' to 'unknown' for dynamic breadcrumb keys
}

/**
 * Navigation data structure
 */
export interface NavigationData {
  mainNavigation: NavigationItem[];
  subNavigation: NavigationItem[];
  footerNavigation: NavigationItem[];
  footerNavigations: NavigationItem[];
}

/**
 * Translation data structure
 */
export interface TranslationData {
  [key: string]: string;
}

/**
 * Combined layout data response
 */
export interface LayoutDataResponse {
  layout: LayoutData;
  navigation: NavigationData;
  translations: TranslationData;
}

/**
 * Nested Strapi image structure (for related fields)
 */
export interface NestedStrapiImage {
  data: {
    id: number;
    attributes: {
      url: string;
      width: number;
      height: number;
      alternativeText?: string;
      mime?: string;
      formats?: {
        thumbnail?: StrapiImageFormat;
        small?: StrapiImageFormat;
        medium?: StrapiImageFormat;
        large?: StrapiImageFormat;
      };
    };
  };
}

/**
 * Author structure
 */
export interface Author {
  id: number;
  documentId?: string;
  firstName: string;
  lastName: string;
  slug?: string;
  linkedInLink?: string;
  twitterLink?: string;
  facebookLink?: string;
  content1?: string;
  jobTitle?: string;
  experience?: string;
  areaOfWork?: string;
  specialization?: string;
  photo?: StrapiImage;
}

/**
 * Dynamic block component interface
 * Each block component should extend this base interface
 */
export interface BlockComponent {
  id: number;
  __component: string;
}

/**
 * Homepage data structure
 */
export interface HomepageData {
  id: number;
  documentId?: string;
  title: string;
  heading?: string;
  updatedAt: string;
  blocks: BlockComponent[]; // Changed from 'any[]' to 'BlockComponent[]'
  seo: SEOData;
}

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
  showContentDate: boolean;
  sideBarToShow?: string | null;
  seo: SEOData;
  breadcrumbs: BreadcrumbItem[];
  author?: Author; // Changed from 'any' to 'Author'
  blocks: BlockComponent[]; // Changed from 'any[]' to 'BlockComponent[]'
}

/**
 * Games list response structure
 */
export interface GamesListResponse {
  games: GameData[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Game provider structure
 */
export interface GameProvider {
  id: number;
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
 * Casino bonus structure
 */
export interface CasinoBonus {
  id: number;
  bonusUrl: string;
  bonusLabel: string;
  bonusCode?: string | null;
}

/**
 * Blog category structure
 */
export interface BlogCategory {
  id: number;
  documentId?: string;
  blogCategory: string;
  slug: string;
}

/**
 * Blog data structure
 */
export interface BlogData {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  blogBrief?: string;
  excerpt?: string;
  content?: string;
  publishedAt: string;
  createdAt: string;
  images?: StrapiImage;
  author?: Author;
  blogCategory?: BlogCategory;
}

/**
 * Re-export game and casino types to maintain consistency
 */
export type { GameData, CasinoData };
