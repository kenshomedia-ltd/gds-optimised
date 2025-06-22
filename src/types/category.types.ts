// src/types/category.types.ts

import type { SEOData, StrapiImage, CasinoData } from "./strapi.types";
import type { GameData } from "./game.types";

/**
 * FAQ structure for category pages
 */
export interface CategoryFAQ {
  id: number;
  question: string;
  answer: string;
}

/**
 * Complete category page data structure
 */
export interface CategoryPageData {
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
  IntroductionWithImage?: {
    id: number;
    heading?: string;
    introduction?: string;
    image?: StrapiImage;
  };
  relatedCasinos?: CasinoData[];
  faqs?: CategoryFAQ[];
}

/**
 * Category page metadata for lightweight queries
 */
export interface CategoryPageMetadata {
  id: number;
  title: string;
  slug: string;
  publishedAt?: string;
  seo?: SEOData;
}

/**
 * Split query data for category pages
 */
export interface CategoryPageSplitData {
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
    IntroductionWithImage?: {
      id: number;
      heading?: string;
      introduction?: string;
      image?: StrapiImage;
    };
    faqs?: CategoryFAQ[];
  };
  dynamicData: {
    relatedCasinos?: CasinoData[];
  };
}

/**
 * Category page response with split queries
 */
export interface CategoryPageResponse {
  pageData: CategoryPageData | null;
  games: GameData[];
  casinos: CasinoData[];
}

/**
 * Category page props
 */
export interface CategoryPageProps {
  params: {
    slug: string;
  };
}
