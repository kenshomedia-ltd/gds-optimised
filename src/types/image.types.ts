// src/types/image.types.ts

/**
 * Comprehensive image properties for the unified Image component
 *
 * This interface consolidates all image functionality into a single component:
 * - Basic Next.js Image props
 * - Progressive/lazy loading capabilities
 * - SVG embedding and handling
 * - Custom fallbacks and placeholders
 * - Advanced optimization features
 */
export interface ImageProps {
  // Core image properties
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;

  // Next.js Image properties
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

  // Progressive/Lazy loading (replaces LazyImage)
  progressive?: boolean;
  lowQualityUrl?: string;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  onInView?: () => void;
  keepPlaceholder?: boolean;

  // SVG specific options (replaces SvgImage)
  embedSvg?: boolean;
  svgProps?: React.HTMLAttributes<HTMLDivElement>;

  // Additional optimization features
  responsive?: boolean;
  isLocal?: boolean;
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
 * Image transformation parameters for AWS optimization
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

// Extended props for the unified component
export interface UnifiedImageProps extends ImageProps {
  // Progressive/Lazy loading
  progressive?: boolean;
  lowQualityUrl?: string;
  threshold?: number;
  rootMargin?: string;

  // SVG specific - using more flexible typing
  embedSvg?: boolean;
  svgProps?: React.HTMLAttributes<HTMLDivElement>;

  // LazyImage specific
  fallback?: React.ReactNode;
  onInView?: () => void;
  keepPlaceholder?: boolean;

  // Additional
  responsive?: boolean;
  isLocal?: boolean;
}

// /**
//  * Migration helper types for backward compatibility
//  * @deprecated Use ImageProps directly with the unified Image component
//  */
// export interface LazyImageProps extends ImageProps {
//   /** @deprecated Use progressive={true} instead */
//   lazy?: boolean;
// }

// /**
//  * @deprecated Use ImageProps directly with the unified Image component
//  */
// export interface SvgImageProps
//   extends Pick<
//     ImageProps,
//     | "src"
//     | "alt"
//     | "width"
//     | "height"
//     | "className"
//     | "embedSvg"
//     | "svgProps"
//     | "onLoad"
//     | "onError"
//   > {}
