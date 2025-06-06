// src/types/overview.types.ts

import type { StrapiImage } from "./strapi.types";

/**
 * Overview item structure
 */
export interface OverviewItem {
  id: number;
  title: string;
  url: string;
  card_img?: StrapiImage;
}

/**
 * Overview block data structure
 */
export interface OverviewBlockData {
  id?: number;
  overview_type?: "Version 2" | string;
  overviews?: OverviewItem[];
}

/**
 * Overview block component props
 */
export interface OverviewBlockProps {
  data: OverviewBlockData;
  className?: string;
}

/**
 * Overview card component props
 */
export interface OverviewCardProps {
  overview: OverviewItem;
  overviewType?: "Version 2" | string;
  priority?: boolean;
}
