// src/types/casino-provider.types.ts

import type { CasinoData } from "./casino.types";
import type { StrapiImage, SEOData } from "./strapi.types";

/**
 * Introduction with image structure
 */
export interface IntroductionWithImage {
  id: number;
  heading?: string;
  introduction?: string;
  image?: StrapiImage;
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
 * Casino provider page data structure
 */
export interface CasinoProviderPageData {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content1?: string;
  content2?: string;
  content3?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  seo?: SEOData;
  IntroductionWithImage?: IntroductionWithImage;
  faqs?: FAQ[];
  casinoComparison?: CasinoData[];
  casinoLists?: CasinoData[];
}

/**
 * Split data structure for casino provider pages
 */
export interface CasinoProviderPageSplitData {
  staticData: {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    content1?: string;
    content2?: string;
    content3?: string;
    IntroductionWithImage?: IntroductionWithImage;
    faqs?: FAQ[];
    seo?: SEOData;
    createdAt: string;
    updatedAt: string;
  };
  dynamicData: {
    casinoComparison?: CasinoData[];
    casinoLists?: CasinoData[];
  };
}

/**
 * Response structure for split queries
 */
export interface CasinoProviderPageResponse {
  pageData: CasinoProviderPageData | null;
  comparisonCasinos: CasinoData[];
  casinoLists: CasinoData[];
}

/**
 * Casino provider page metadata structure
 */
export interface CasinoProviderPageMetadata {
  id: number;
  title: string;
  slug: string;
  publishedAt?: string;
  seo?: SEOData;
}
