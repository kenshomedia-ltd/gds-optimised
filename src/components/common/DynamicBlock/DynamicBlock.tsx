// src/components/common/DynamicBlock/DynamicBlock.tsx
"use client";

import dynamic from "next/dynamic";
import type {
  HomeGameListBlock,
  HomeCasinoListBlock,
  HomeBlogListBlock,
  HomeFeaturedProvidersBlock,
  IntroductionWithImageBlock,
  SingleContentBlock,
  GamesCarouselBlock,
  GamesNewAndLovedSlotsBlock,
  QuicklinksBlock,
  DynamicBlockProps
} from "@/types/dynamic-block.types";
import type { OverviewBlock } from "@/types/homepage.types";
import type { CasinoListBlock } from "@/types/casino-filters.types";
import type { FeaturedProvider } from "@/types/featured-providers.types";
import { Skeleton } from "@/components/ui";
// Lazy load all widget components
const IntroWithImage = dynamic(
  () =>
    import("@/components/common/IntroWithImage").then(
      (mod) => mod.IntroWithImage
    ),
  { loading: () => <Skeleton className="h-96" /> }
);

const Overview = dynamic(
  () => import("@/components/widgets/Overview").then((mod) => mod.Overview),
  { loading: () => <Skeleton className="h-96" /> }
);

const HomeGameList = dynamic(
  () =>
    import("@/components/widgets/HomeGameList").then((mod) => mod.HomeGameList),
  { loading: () => <Skeleton className="h-96" /> }
);

const CasinoList = dynamic(
  () => import("@/components/widgets/CasinoList").then((mod) => mod.CasinoList),
  { loading: () => <Skeleton className="h-96" /> }
);

const CasinoListWidget = dynamic(
  () =>
    import("@/components/widgets/CasinoList").then(
      (mod) => mod.CasinoListWidget
    ),
  { loading: () => <Skeleton className="h-96" /> }
);

const HomeLatestBlogs = dynamic(
  () =>
    import("@/components/widgets/HomeLatestBlogs").then(
      (mod) => mod.HomeLatestBlogs
    ),
  { loading: () => <Skeleton className="h-96" /> }
);

const SingleContent = dynamic(
  () =>
    import("@/components/common/SingleContent").then(
      (mod) => mod.SingleContent
    ),
  { loading: () => <Skeleton className="h-64" /> }
);

const NewAndLovedSlots = dynamic(
  () =>
    import("@/components/widgets/NewAndLovedSlots").then(
      (mod) => mod.NewAndLovedSlots
    ),
  { loading: () => <Skeleton className="h-96" /> }
);

const GameListWidget = dynamic(
  () =>
    import("@/components/widgets/GameListWidget").then(
      (mod) => mod.GameListWidget
    ),
  { loading: () => <Skeleton className="h-96" /> }
);

const QuicklinksWidget = dynamic(
  () =>
    import("@/components/widgets/QuicklinksWidget").then(
      (mod) => mod.QuicklinksWidget
    ),
  { loading: () => <Skeleton className="h-32" /> }
);

const FeaturedProviders = dynamic(
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
);

/**
 * DynamicBlock Component
 *
 * Renders different block components based on the block type.
 * Handles both homepage and custom page blocks.
 *
 * Features:
 * - Dynamic component loading
 * - Type-safe block rendering
 * - Loading states
 * - Support for additional data (translations, games, casinos, etc.)
 */
export function DynamicBlock({
  blockType,
  blockData,
  additionalData = {},
}: DynamicBlockProps) {
  const { translations = {}, games = [], casinos = [] } = additionalData;

  // Handle unknown block types
  if (!blockType) {
    console.warn("DynamicBlock: No block type provided");
    return null;
  }

  switch (blockType) {
    // Homepage blocks
    case "homepage.home-game-list":
      return (
        <HomeGameList
          block={blockData as HomeGameListBlock}
          translations={translations}
          games={games}
        />
      );

    case "homepage.home-casino-list":
      // Use the original CasinoList for homepage (no filters)
      return (
        <CasinoList
          block={blockData as HomeCasinoListBlock}
          casinos={casinos}
          translations={translations}
        />
      );

    case "homepage.home-blog-list":
      return (
        <HomeLatestBlogs
          block={blockData as HomeBlogListBlock}
          blogs={additionalData.blogs || []}
          translations={translations}
        />
      );

    // Shared blocks
    case "shared.introduction-with-image":
      const introBlock = blockData as IntroductionWithImageBlock;
      return (
        <IntroWithImage
          heading={introBlock.heading || ""}
          introduction={introBlock.introduction}
          image={introBlock.image}
          translations={translations}
        />
      );

    case "shared.overview-block":
      return <Overview data={blockData as OverviewBlock} />;

    case "shared.single-content":
      return <SingleContent block={blockData as SingleContentBlock} />;

    // Custom page blocks
    case "games.games-carousel":
      return (
        <GameListWidget
          block={blockData as GamesCarouselBlock}
          games={games}
          translations={translations}
        />
      );

    case "casinos.casino-list":
      // For custom pages, check if filters should be shown
      const casinoBlock = blockData as CasinoListBlock;
      return (
        <CasinoListWidget
          block={casinoBlock}
          casinos={casinos}
          translations={translations}
          showCasinoFilters={casinoBlock.showCasinoFilters || false}
        />
      );

    case "games.new-and-loved-slots":
      return (
        <NewAndLovedSlots
          blockData={blockData as GamesNewAndLovedSlotsBlock}
          translations={translations}
          newGames={additionalData.dynamicGamesData?.[blockData.id]?.newGames}
          popularGames={
            additionalData.dynamicGamesData?.[blockData.id]?.popularGames
          }
        />
      );

    case "shared.quicklinks":
      return (
        <QuicklinksWidget
          block={blockData as QuicklinksBlock}
          // translations={translations}
        />
      );

    case "homepage.home-featured-providers":
      const featuredProvidersBlock = blockData as HomeFeaturedProvidersBlock;
      // Transform to match FeaturedProvidersProps expected structure
      let homeFeaturedProviders: {
        id: number;
        providers?: FeaturedProvider[];
      } = { id: 0, providers: [] };

      if (featuredProvidersBlock.homeFeaturedProviders) {
        if (Array.isArray(featuredProvidersBlock.homeFeaturedProviders)) {
          const firstItem = featuredProvidersBlock.homeFeaturedProviders[0];
          if (firstItem) {
            homeFeaturedProviders = {
              id: firstItem.id,
              providers: firstItem.providers || [],
            };
          }
        } else {
          // When it's not an array, it's just { providers?: Provider[] }
          // So we need to provide a default id
          homeFeaturedProviders = {
            id: 0, // Default id since the object doesn't have one
            providers:
              featuredProvidersBlock.homeFeaturedProviders.providers || [],
          };
        }
      }

      const featuredProvidersData = {
        id: featuredProvidersBlock.id,
        title: featuredProvidersBlock.title,
        homeFeaturedProviders,
      };

      return (
        <FeaturedProviders
          data={featuredProvidersData}
          translations={translations}
        />
      );
    // Add other custom page block cases as needed...

    default:
      console.warn(`DynamicBlock: Unknown block type "${blockType}"`);
      return null;
  }
}
