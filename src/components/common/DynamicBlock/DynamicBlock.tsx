// src/components/common/DynamicBlock/DynamicBlock.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import type {
  DynamicBlockProps,
  GamesCarouselBlock,
  HomeBlogListBlock,
  HomeCasinoListBlock,
  HomeFeaturedProvidersBlock,
  HomeGameListBlock,
  HomeTestimoniesBlock,
  IntroductionWithImageBlock,
  OverviewBlock,
  SingleContentBlock,
} from "@/types/dynamic-block.types";
import type { NewAndLovedSlotsBlock } from "@/types/new-and-loved-slots.types";
import { Skeleton } from "@/components/ui/Skeleton";

// Lazy load components for better performance
const componentMap = {
  "homepage.home-game-list": dynamic(
    () =>
      import("@/components/widgets/HomeGameList").then(
        (mod) => mod.HomeGameList
      ),
    { loading: () => <Skeleton className="h-96 w-full" /> }
  ),
  "homepage.home-blog-list": dynamic(
    () =>
      import("@/components/widgets/HomeLatestBlogs").then(
        (mod) => mod.HomeLatestBlogs
      ),
    {
      loading: () =>
        import("@/components/widgets/HomeLatestBlogs").then((mod) => (
          <mod.HomeLatestBlogsSkeleton />
        )),
    }
  ),
  "shared.introduction-with-image": dynamic(
    () =>
      import("@/components/common/IntroWithImage").then(
        (mod) => mod.IntroWithImage
      ),
    { loading: () => <Skeleton className="h-48 w-full" /> }
  ),
  "homepage.home-casino-list": dynamic(
    () =>
      import("@/components/widgets/CasinoList").then((mod) => mod.CasinoList),
    { loading: () => <Skeleton className="h-96 w-full" /> }
  ),
  "homepage.home-featured-providers": dynamic(
    () =>
      import("@/components/widgets/FeaturedProviders").then(
        (mod) => mod.FeaturedProviders
      ),
    {
      loading: () =>
        import("@/components/widgets/FeaturedProviders").then((mod) => (
          <mod.FeaturedProvidersSkeleton />
        )),
    }
  ),
  "shared.overview-block": dynamic(
    () => import("@/components/widgets/Overview").then((mod) => mod.Overview),
    { loading: () => <Skeleton className="h-48 w-full" /> }
  ),
  "shared.single-content": dynamic(
    () =>
      import("@/components/common/SingleContent").then(
        (mod) => mod.SingleContent
      ),
    { loading: () => <Skeleton className="h-32 w-full" /> }
  ),
  "homepage.home-testimonies": dynamic(
    () =>
      import("@/components/widgets/Testimonials").then(
        (mod) => mod.Testimonials
      ),
    {
      loading: () =>
        import("@/components/widgets/Testimonials").then((mod) => (
          <mod.TestimonialsSkeleton />
        )),
    }
  ),
  "games.new-and-loved-slots": dynamic(
    () =>
      import("@/components/widgets/NewAndLovedSlots").then(
        (mod) => mod.NewAndLovedSlots
      ),
    {
      loading: () => <Skeleton className="h-64 w-full" />,
    }
  ),
  "games.games-carousel": dynamic(
    () =>
      import("@/components/widgets/GameListWidget").then(
        (mod) => mod.GameListWidget
      ),
    { loading: () => <Skeleton className="h-96 w-full" /> }
  ),
};

/**
 * DynamicBlock Component
 *
 * Renders different components based on the block type
 * Features:
 * - Lazy loading for better performance
 * - Type-safe component mapping
 * - Loading states for each component
 * - Error boundary support
 */
export function DynamicBlock({
  blockType,
  blockData,
  additionalData,
}: DynamicBlockProps) {
  const Component = componentMap[blockType as keyof typeof componentMap];

  if (!Component) {
    console.warn(`Unknown block type: ${blockType}`);
    return null;
  }

  // Prepare props based on block type
  const getComponentProps = () => {
    // Removed baseProps to ensure type safety within each case.

    switch (blockType) {
      case "homepage.home-game-list":
        return {
          block: blockData as HomeGameListBlock,
          games: additionalData?.games || [],
          translations: additionalData?.translations,
        };

      case "homepage.home-blog-list":
        return {
          block: blockData as HomeBlogListBlock,
          blogs: additionalData?.blogs || [],
          translations: additionalData?.translations,
        };

      case "homepage.home-casino-list":
        return {
          block: blockData as HomeCasinoListBlock,
          casinos: additionalData?.casinos || [],
          translations: additionalData?.translations,
        };

      case "shared.introduction-with-image":
        const introData = blockData as IntroductionWithImageBlock;
        return {
          heading: introData.heading,
          introduction: introData.introduction,
          image: introData.image,
          translations: additionalData?.translations,
          isHomePage: true,
        };

      case "homepage.home-featured-providers":
        return {
          data: blockData as HomeFeaturedProvidersBlock,
          translations: additionalData?.translations,
        };

      case "shared.overview-block":
        return {
          data: blockData as OverviewBlock,
        };

      case "shared.single-content":
        return {
          block: blockData as SingleContentBlock,
        };

      case "homepage.home-testimonies":
        return {
          data: blockData as HomeTestimoniesBlock,
        };

      case "games.new-and-loved-slots":
        // Get the block-specific games data from dynamicGamesData
        const newAndLovedData =
          additionalData?.dynamicGamesData?.[`block-${blockData.id}`];

        return {
          blockData: blockData as NewAndLovedSlotsBlock,
          translations: additionalData?.translations,
          newGames: newAndLovedData?.newGames || [],
          popularGames: newAndLovedData?.popularGames || [],
        };

      case "games.games-carousel":
        const gamesCarouselData = blockData as GamesCarouselBlock;
        // Extract games from dynamicGamesData if available
        const carouselGames =
          additionalData?.dynamicGamesData?.[`block-${gamesCarouselData.id}`]
            ?.games ||
          gamesCarouselData.games ||
          additionalData?.games ||
          [];
        return {
          block: gamesCarouselData,
          games: carouselGames,
          translations: additionalData?.translations,
        };

      // Ensure all components in the map have a case here
      default:
        return { data: blockData };
    }
  };

  // The type-safe alternative to using 'any'
  const TypedComponent = Component as unknown as React.FC<
    Record<string, unknown>
  >;


  return (
    <Suspense fallback={<Skeleton className="h-48 w-full animate-pulse" />}>
      <TypedComponent {...getComponentProps()} />
    </Suspense>
  );
}