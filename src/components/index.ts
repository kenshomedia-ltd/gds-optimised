// src/components/index.ts

// Layout components
export {
  Header,
  MainNav,
  SubNav,
  MobileMenu,
  Footer,
  FooterServer,
  FooterLinks,
  FooterImages,
  FooterBottom,
  FooterContent,
  Legal,
  LegalServer,
} from "./layout";

// Common components
export {
  Image,
  BackToTop,
  IntroWithImage,
  DynamicBlock,
  SingleContent,
  SingleContentSkeleton,
  TimeDate,
  HeaderAuthor,
  ErrorBoundary,
  GlobalErrorBoundary,
} from "./common";

// Feature components
export {
  SearchBar,
  FavoriteButton,
  FavoritesProvider,
  useFavorites,
} from "./features";

// UI components
export { Skeleton, SkeletonText, Collapsible } from "./ui";

// Game components
export { GameCard, GameCardSkeleton, GameList } from "./games";

// Casino components
export { CasinoTable, CasinoRow, CasinoBadge } from "./casino";

// Blog components
export { BlogCard, BlogCardSkeleton, BlogList } from "./blog";

// Widget components
export {
  Overview,
  HomeGameList,
  FeaturedProviders,
  FeaturedProvidersServer,
  FeaturedProvidersSkeleton,
  Testimonials,
  TestimonialsSkeleton,
  CasinoList,
  HomeLatestBlogs,
  HomeLatestBlogsSkeleton,
} from "./widgets";

// Provider components
export { ClientProviders } from "./providers";

// Re-export types
export type { HeaderProps } from "./layout";
export type { FooterProps } from "./layout";
export type { LegalProps } from "./layout";
export type { ImageProps } from "@/types/image.types";
export type { SearchBarProps, SearchResult } from "./features";
export type { FavoriteButtonProps } from "@/types/favorite.types";
export type { GameCardProps } from "@/types/game.types";
export type { BlogCardProps } from "@/types/blog.types";
export type { DynamicBlockProps, BlockType } from "./common";
export type { IntroWithImageProps } from "./common";
export type { SingleContentProps } from "./common";
