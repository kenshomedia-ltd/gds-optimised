// src/types/image.types.ts

/**
 * Base image properties
 */
export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: "blur" | "empty" | "none";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fill?: boolean;
  style?: React.CSSProperties;
  unoptimized?: boolean;
  // SVG specific options
  embedSvg?: boolean;
  svgProps?: React.SVGProps<SVGSVGElement>;
}

/**
 * AWS Image Handler configuration
 */
export interface ImageHandlerConfig {
  baseUrl: string;
  bucket: string;
  defaultQuality: number;
  supportedFormats: string[];
}

/**
 * Image transformation parameters
 */
export interface ImageTransformParams {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
}

/**
 * Image optimization edits for AWS
 */
export interface ImageEdits {
  resize?: {
    width?: number;
    height?: number;
    fit?: string;
    withoutEnlargement?: boolean;
  };
  toFormat?: string;
  webp?: {
    quality: number;
  };
  jpeg?: {
    quality: number;
  };
}

/**
 * AWS Image Handler payload
 */
export interface ImageHandlerPayload {
  bucket: string;
  key: string;
  edits: ImageEdits;
}
