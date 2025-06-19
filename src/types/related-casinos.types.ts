// src/types/related-casinos.types.ts

import type { CasinoData } from "./casino.types";
import type { GameProvider } from "./game.types";

/**
 * Provider with related casinos data structure
 */
export interface ProviderWithCasinos extends GameProvider {
  relatedCasinos?: CasinoData[];
}

/**
 * Related casinos widget props
 */
export interface RelatedCasinosProps {
  provider?: GameProvider;
  translations?: Record<string, string>;
  className?: string;
  maxCasinos?: number;
  showTitle?: boolean;
}

/**
 * Related casinos widget block structure
 */
export interface RelatedCasinosBlock {
  id: number;
  __component: "games.related-casinos";
  title?: string;
  showCasinoTableHeader?: boolean;
  maxCasinos?: number;
}

/**
 * Provider API response structure
 */
export interface ProviderResponse {
  data: ProviderWithCasinos;
  meta?: Record<string, unknown>;
}
