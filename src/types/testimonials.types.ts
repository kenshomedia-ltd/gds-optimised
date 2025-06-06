// src/types/testimonials.types.ts

import type { StrapiImage } from "./strapi.types";

/**
 * Individual testimony structure
 */
export interface Testimony {
  id: number;
  title: string;
  testimony: string;
  testifierName: string;
  testifierTitle?: string | null;
  provider?: {
    id: number;
    documentId?: string;
    title: string;
    slug: string;
    images?: StrapiImage;
  };
}

/**
 * Home testimonies block data
 */
export interface HomeTestimoniesBlockData {
  id?: number;
  title?: string;
  homeTestimonies?: Testimony[];
}

/**
 * Testimonials component props
 */
export interface TestimonialsProps {
  data: HomeTestimoniesBlockData;
  className?: string;
}

/**
 * Optimized testimony with image URL
 */
export interface OptimizedTestimony extends Testimony {
  provider?: Testimony["provider"] & {
    imageUrl: string;
  };
}

/**
 * Carousel state
 */
export interface CarouselState {
  currentIndex: number;
  isTransitioning: boolean;
  touchStartX: number;
  touchEndX: number;
}
