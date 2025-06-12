// src/types/strapi.types.ts

import type { BreadcrumbItem } from "./breadcrumbs.types";

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
  [key: string]: any; // Allow for dynamic breadcrumb keys
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
 * Homepage data structure
 */
export interface HomepageData {
  id: number;
  documentId?: string;
  title: string;
  heading?: string;
  updatedAt: string;
  blocks: any[]; // Dynamic block components
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
  author?: any; // Author structure
  blocks: any[]; // Dynamic block components
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
  author?: any;
  blogCategory?: any;
}

/**
 * Game data structure
 */
export interface GameData {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  ratingAvg: number;
  ratingCount?: number;
  images?: StrapiImage;
  provider?: any;
  categories?: any[];
}

/**
 * Casino data structure
 */
export interface CasinoData {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  ratingAvg: number;
  images?: StrapiImage;
  casinoBonus?: any;
}
