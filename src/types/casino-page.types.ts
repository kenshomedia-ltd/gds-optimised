// src/types/casino-page.types.ts

import type { CasinoData } from "./casino.types";
import type { StrapiImage, Author, SEOData } from "./strapi.types";
import type { GameProvider } from "./game.types";

/**
 * Casino feature structure
 */
export interface CasinoFeature {
  id: number;
  feature: string;
}

/**
 * How-to step structure
 */
export interface HowToStep {
  id: number;
  heading: string;
  copy: string;
  image?: StrapiImage;
}

/**
 * How-to group structure
 */
export interface HowToGroup {
  id: number;
  title: string;
  description: string;
  howToGroup: HowToStep[];
}

/**
 * Pros and cons structure
 */
export interface ProsCons {
  id: number;
  pros: string[];
  cons: string[];
  proImage?: StrapiImage;
  conImage?: StrapiImage;
}

/**
 * Payment options structure
 */
export interface PaymentOptions {
  id: number;
  creditCard: boolean;
  skrill: boolean;
  paypal: boolean;
  postepay: boolean;
  wireTransfer: boolean;
  neteller: boolean;
  ukash: boolean;
  paysafe: boolean;
}

/**
 * General info structure
 */
export interface GeneralInfo {
  id: number;
  website?: string;
  regulationLicense?: string;
  telephone?: string;
  societa?: string;
  email?: string;
  address?: string;
  wageringRequirements?: string;
  downloadApp?: boolean;
  vip?: boolean;
}

/**
 * Testimonial structure
 */
export interface Testimonial {
  id: number;
  testimonial: string;
  approvedBy?: {
    firstName: string;
    lastName: string;
    jobTitle?: string;
    photo?: StrapiImage;
  };
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
 * Payment channel structure
 */
export interface PaymentChannel {
  id: number;
  name: string;
  logo?: StrapiImage;
}

/**
 * Image carousel block structure
 */
export interface ImageCarouselBlock {
  id: number;
  __component: "shared.image-carousel";
  carouselTitle?: string;
  image?: StrapiImage;
}

/**
 * Extended casino page data with all fields
 */
export interface CasinoPageData extends CasinoData {
  heading?: string;
  introduction?: string;
  authorRatings?: number;
  content1?: string;
  content2?: string;
  content3?: string;
  content4?: string;
  playthrough?: string;
  casinoFeatures?: CasinoFeature[];
  howTo?: HowToGroup;
  proscons?: ProsCons;
  paymentOptions?: PaymentOptions;
  casinoGeneralInfo?: GeneralInfo;
  testimonial?: Testimonial;
  faqs?: FAQ[];
  author?: Author;
  providers?: GameProvider[];
  seo?: SEOData;
  casinoComparison?: CasinoData[];
  paymentChannels?: PaymentChannel[];
  blocks?: ImageCarouselBlock[];
  updatedAt?: string;
}

/**
 * Split data structure for casino pages
 */
export interface CasinoPageSplitData {
  staticData: {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    publishedAt: string;
    heading?: string;
    introduction?: string;
    content1?: string;
    content2?: string;
    content3?: string;
    content4?: string;
    casinoFeatures?: CasinoFeature[];
    howTo?: HowToGroup;
    proscons?: ProsCons;
    paymentOptions?: PaymentOptions;
    casinoGeneralInfo?: GeneralInfo;
    testimonial?: Testimonial;
    faqs?: FAQ[];
    author?: Author;
    seo?: SEOData;
    paymentChannels?: PaymentChannel[];
    blocks?: ImageCarouselBlock[];
    createdAt?: string;
    updatedAt?: string;
  };
  dynamicData: {
    ratingAvg: number;
    ratingCount: number;
    authorRatings?: number;
    playthrough?: string;
    images: StrapiImage;
    bonusSection: CasinoPageData["bonusSection"];
    noDepositSection?: CasinoPageData["noDepositSection"];
    freeSpinsSection?: CasinoPageData["freeSpinsSection"];
    termsAndConditions: CasinoPageData["termsAndConditions"];
    casinoBonus: CasinoPageData["casinoBonus"];
    providers?: GameProvider[];
    casinoComparison?: CasinoData[];
  };
}

/**
 * Response structure for split queries
 */
export interface CasinoPageDataResponse {
  casinoData: CasinoPageData | null;
  relatedProviders: GameProvider[];
  comparisonCasinos: CasinoData[];
}

/**
 * Casino page metadata structure
 */
export interface CasinoPageMetadata {
  id: number;
  title: string;
  slug: string;
  publishedAt?: string;
  seo?: SEOData;
}
