// src/types/dynamic-block.types.ts

export type BlockType =
  | "homepage.home-game-list"
  | "homepage.home-casino-list"
  | "homepage.home-blog-list"
  | "shared.introduction-with-image"
  | "casinos.casino-list"
  | "homepage.home-featured-providers"
  | "shared.overview-block"
  | "shared.single-content"
  | "homepage.home-testimonies";

export interface DynamicBlockProps {
  blockType: BlockType | string;
  blockData: any;
  additionalData?: {
    translations?: Record<string, string>;
    games?: any[];
    casinos?: any[];
    blogs?: any[];
    country?: string;
  };
}

export interface BlockComponentProps {
  translations?: Record<string, string>;
  [key: string]: any;
}
