// src/types/single-content.types.ts

/**
 * Single content block data structure from Strapi
 */
export interface SingleContentBlockData {
  id?: number;
  content?: string;
  heading?: string;
}

/**
 * Single content component props
 */
export interface SingleContentProps {
  block: SingleContentBlockData;
  loading?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * Single content skeleton props
 */
export interface SingleContentSkeletonProps {
  className?: string;
}

/**
 * Processed content result
 */
export interface ProcessedContent {
  sanitizedContent: string;
  processedContent: string;
  textPreview: string;
}

/**
 * Schema.org structured data for SingleContent
 */
export interface SingleContentSchema {
  "@context": string;
  "@type": string;
  "@id": string;
  text: string;
  name?: string;
}
