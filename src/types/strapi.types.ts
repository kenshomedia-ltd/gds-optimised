// src/types/strapi.types.ts

/**
 * Base Strapi response wrapper
 */
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Strapi media format
 */
export interface StrapiImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
}

/**
 * Strapi image data
 */
export interface StrapiImage {
  id: number;
  documentId: string;
  name?: string;
  alternativeText?: string | null;
  caption?: string | null;
  width: number;
  height: number;
  formats?: {
    large?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    small?: StrapiImageFormat;
    thumbnail?: StrapiImageFormat;
  };
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
  url: string;
  previewUrl?: string | null;
  provider?: string;
  provider_metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Navigation item structure
 */
export interface NavigationItem {
  id: number;
  title: string;
  url: string | null;
  images: StrapiImage | null;
  subMenu: NavigationItem[];
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  id: number;
  breadCrumbText: string;
  breadCrumbUrl: string;
}

/**
 * Footer image item
 */
export interface FooterImageItem {
  id: number;
  imageName: string;
  imageLink: string | null;
  image: StrapiImage;
}

/**
 * Layout data structure
 */
export interface LayoutData {
  id: number;
  documentId: string;
  legalText: string;
  footerContent: string;
  cookiesHeaderText: string;
  cookiesDescription: string;
  cookiesUrl: string;
  cookiesLinkText: string;
  Logo: StrapiImage;
  footerImages: FooterImageItem[];
  homeBreadcrumbs: BreadcrumbItem[];
}

/**
 * Navigation data structure
 */
export interface NavigationData {
  id: number;
  documentId: string;
  mainNavigation: NavigationItem[];
  footerNavigation: NavigationItem[];
  footerNavigations: NavigationItem[];
  subNavigation: NavigationItem[];
}

/**
 * Translation data
 */
export interface TranslationData {
  [key: string]: string;
}

/**
 * Combined layout response
 */
export interface LayoutDataResponse {
  layout: LayoutData;
  navigation: NavigationData;
  translations: TranslationData;
}

/**
 * Game provider
 */
export interface GameProvider {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
}

/**
 * Game category
 */
export interface GameCategory {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
}

/**
 * Game author
 */
export interface GameAuthor {
  id: number;
  documentId?: string;
  firstName: string;
  lastName: string;
  slug: string;
  photo?: StrapiImage;
}

/**
 * Game embed code
 */
export interface GameEmbedCode {
  desktopEmbedCode: string;
  mobileEmbedCode: string;
}

/**
 * Game info table
 */
export interface GameInfoTable {
  rtp?: string;
  volatilita?: string;
  layout?: string;
  lineeDiPuntata?: string;
  puntataMinima?: string;
  puntataMassima?: string;
  jackpot?: boolean;
  freeSpins?: boolean;
  bonusGame?: boolean;
}

/**
 * SEO metadata
 */
export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalURL?: string;
  metaRobots?: string;
  structuredData?: any;
  metaSocial?: {
    socialNetwork: string;
    title: string;
    description: string;
    image?: StrapiImage;
  }[];
}

/**
 * FAQ item
 */
export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

/**
 * Game data structure
 */
export interface GameData {
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
  gamesApiOverride?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  images: StrapiImage[];
  provider: GameProvider;
  categories: GameCategory[];
  author?: GameAuthor;
  embedCode?: GameEmbedCode;
  gameInfoTable?: GameInfoTable;
  seo?: SEOData;
  faqs?: FAQItem[];
  howTo?: any;
  proscons?: any;
  blocks?: any[];
}

/**
 * Games list response
 */
export interface GamesListResponse {
  data: GameData[];
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
 * Casino data structure
 */
export interface CasinoData {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  description?: string;
  rating: number;
  ratingCount: number;
  bonus?: string;
  bonusPercentage?: number;
  freeSpins?: number;
  depositMin?: number;
  website?: string;
  established?: number;
  license?: string[];
  paymentMethods?: string[];
  currencies?: string[];
  languages?: string[];
  supportEmail?: string;
  supportPhone?: string;
  supportChat?: boolean;
  logo: StrapiImage;
  images?: StrapiImage[];
  pros?: string[];
  cons?: string[];
  termsAndConditions?: string;
  seo?: SEOData;
}

/**
 * Blog/Article data structure
 */
export interface BlogData {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  publishedAt: string;
  readingTime?: number;
  featuredImage: StrapiImage;
  author: GameAuthor;
  categories?: GameCategory[];
  tags?: string[];
  seo?: SEOData;
}
