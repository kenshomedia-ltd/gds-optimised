// src/components/common/index.ts

// Image components
export { Image } from "./Image";

// BackToTop component
export { BackToTop } from "./BackToTop/BackToTop";

// Content components
export { IntroWithImage } from "./IntroWithImage";
export type { IntroWithImageProps } from "./IntroWithImage";

// Dynamic block renderer
export { DynamicBlock } from "./DynamicBlock";
export type { DynamicBlockProps, BlockType } from "./DynamicBlock";

// SingleContent component
export { SingleContent, SingleContentSkeleton } from "./SingleContent";
export type { SingleContentProps, SingleContentSkeletonProps } from "./SingleContent";

// Time and Author components
export { TimeDate } from "./TimeDate/TimeDate";
export { HeaderAuthor } from "./HeaderAuthor/HeaderAuthor";
export { AuthorBox } from "./AuthorBox/AuthorBox";

// Error handling
export { ErrorBoundary, GlobalErrorBoundary } from "./ErrorBoundary/ErrorBoundary";

// ChunkLoadErrorHandler
export { ChunkLoadErrorHandler } from "./ChunkLoadErrorHandler/ChunkLoadErrorHandler";

// Add other common components as they are created:
// export { Icon } from "./Icon";
// export { SEO } from "./SEO";
// export { ErrorBoundary } from "./ErrorBoundary";
