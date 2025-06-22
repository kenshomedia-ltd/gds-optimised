// src/types/provider.types.ts

import type { SEOData, StrapiImage, CasinoData } from "./strapi.types";
import type { GameData } from "./game.types";

/**
 * FAQ structure for provider pages
 */
export interface ProviderFAQ {
  id: number;
  question: string;
  answer: string;
}

/**
 * Introduction with image structure for provider pages
 */
export interface ProviderIntroWithImage {
  id: number;
  heading?: string;
  introduction?: string;
  image?: StrapiImage;
}

/**
 * Complete provider page data structure
 */
export interface ProviderPageData {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  heading?: string;
  content1?: string;
  content2?: string;
  content3?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  seo?: SEOData;
  images?: StrapiImage;
  IntroductionWithImage?: ProviderIntroWithImage;
  games?: GameData[];
  relatedCasinos?: CasinoData[];
  faqs?: ProviderFAQ[];
}

/**
 * Provider page metadata for lightweight queries
 */
export interface ProviderPageMetadata {
  id: number;
  title: string;
  slug: string;
  publishedAt?: string;
  seo?: SEOData;
}

/**
 * Split query data for provider pages
 */
export interface ProviderPageSplitData {
  staticData: {
    id: number;
    documentId?: string;
    title: string;
    slug: string;
    heading?: string;
    content1?: string;
    content2?: string;
    content3?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    seo?: SEOData;
    images?: StrapiImage;
    IntroductionWithImage?: ProviderIntroWithImage;
    faqs?: ProviderFAQ[];
  };
  dynamicData: {
    games?: GameData[];
    relatedCasinos?: CasinoData[];
  };
}

/**
 * Provider page response with split queries
 */
export interface ProviderPageResponse {
  pageData: ProviderPageData | null;
  games: GameData[];
  casinos: CasinoData[];
}

/**
 * Provider page props
 */
export interface ProviderPageProps {
  params: {
    slug: string;
  };
}

/**
 * Provider listing page data
 */
export interface ProviderListingPageData {
  id: number;
  documentId?: string;
  title: string;
  heading?: string;
  content1?: string;
  content2?: string;
  seo?: SEOData;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
