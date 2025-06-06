// src/types/casino.types.ts

import type { StrapiImage } from "./strapi.types";

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
 * No deposit section structure
 */
export interface NoDepositSection {
  id: number;
  bonusAmount: number | null;
  termsConditions: string | null;
}

/**
 * Free spins section structure
 */
export interface FreeSpinsSection {
  id: number;
  bonusAmount: number | null;
  termsConditions: string | null;
}

/**
 * Terms and conditions structure
 */
export interface TermsAndConditions {
  id: number;
  copy: string;
  gambleResponsibly: string;
}

/**
 * Bonus section structure
 */
export interface BonusSection {
  id: number;
  bonusAmount: number | null;
  termsConditions: string;
  cashBack?: string | null;
  freeSpin?: string | null;
}

/**
 * Casino data structure
 */
export interface CasinoData {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  ratingAvg: number;
  ratingCount: number;
  publishedAt: string;
  createdAt?: string;
  Badges?: string | null;
  images: StrapiImage;
  casinoBonus: CasinoBonus;
  noDepositSection?: NoDepositSection | null;
  freeSpinsSection?: FreeSpinsSection | null;
  termsAndConditions: TermsAndConditions;
  bonusSection: BonusSection;
}

/**
 * Casino list block structure
 */
export interface HomeCasinoListBlock {
  id: number;
  __component: "homepage.home-casino-list";
  casinoTableTitle?: string;
  showCasinoTableHeader?: boolean;
  casinosList?: Array<{
    id: number;
    casinoName: string;
    casino?: CasinoData;
  }>;
  link?: {
    label: string;
    url: string;
  };
}

/**
 * Props for casino list component
 */
export interface CasinoListProps {
  block: HomeCasinoListBlock;
  casinos: CasinoData[];
  translations?: Record<string, string>;
  showCasinoTableHeader?: boolean;
  className?: string;
}

/**
 * Props for individual casino row
 */
export interface CasinoRowProps {
  casino: CasinoData;
  index: number;
  translations?: Record<string, string>;
}

/**
 * Props for casino bonus display
 */
export interface CasinoBonusProps {
  casino: CasinoData;
  type: "welcome" | "noDeposit";
  translations?: Record<string, string>;
}
