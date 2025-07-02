// src/types/featured-providers.types.ts

import type { StrapiImage } from "./strapi.types";

/**
 * Featured provider item structure
 */
export interface FeaturedProvider {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  images?: StrapiImage;
}

/**
 * Featured providers list structure
 */
export interface HomeFeaturedProvidersList {
  id: number;
  providers?: FeaturedProvider[];
}

/**
 * Featured providers block data
 */
export interface HomeFeaturedProvidersBlockData {
  id?: number;
  title?: string;
  homeFeaturedProviders?: HomeFeaturedProvidersList;
}

/**
 * Featured providers component props
 */
export interface FeaturedProvidersProps {
  data: HomeFeaturedProvidersBlockData;
  translations?: Record<string, string>;
  className?: string;
  isHomepage?: boolean;
}