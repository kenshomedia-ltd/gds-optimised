// src/components/common/DynamicBlock/DynamicBlock.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { DynamicBlockProps } from "@/types/dynamic-block.types";
import { Skeleton } from "@/components/ui/Skeleton";

// Lazy load components for better performance
const componentMap = {
    "homepage.home-game-list": dynamic(
      () => import("@/components/widgets/HomeGameList").then((mod) => mod.HomeGameList),
      { loading: () => <Skeleton className="h-96 w-full" /> }
    ),
  //   "homepage.home-casino-list": dynamic(
  //     () =>
  //       import("@/components/casino/CasinoTable").then((mod) => mod.CasinoTable),
  //     { loading: () => <Skeleton className="h-96 w-full" /> }
  //   ),
  //   "homepage.home-blog-list": dynamic(
  //     () =>
  //       import("@/components/widgets/LatestBlogs").then((mod) => mod.LatestBlogs),
  //     { loading: () => <Skeleton className="h-64 w-full" /> }
  //   ),
  "shared.introduction-with-image": dynamic(
    () =>
      import("@/components/common/IntroWithImage").then(
        (mod) => mod.IntroWithImage
      ),
    { loading: () => <Skeleton className="h-48 w-full" /> }
  ),
  //   "casinos.casino-list": dynamic(
  //     () =>
  //       import("@/components/casino/CasinoTable").then((mod) => mod.CasinoTable),
  //     { loading: () => <Skeleton className="h-96 w-full" /> }
  //   ),
  //   "homepage.home-featured-providers": dynamic(
  //     () =>
  //       import("@/components/widgets/FeaturedProviders").then(
  //         (mod) => mod.FeaturedProviders
  //       ),
  //     { loading: () => <Skeleton className="h-64 w-full" /> }
  //   ),
  "shared.overview-block": dynamic(
    () => import("@/components/widgets/Overview").then((mod) => mod.Overview),
    { loading: () => <Skeleton className="h-48 w-full" /> }
  ),
  //   "shared.single-content": dynamic(
  //     () =>
  //       import("@/components/common/SingleContent").then(
  //         (mod) => mod.SingleContent
  //       ),
  //     { loading: () => <Skeleton className="h-32 w-full" /> }
  //   ),
  //   "homepage.home-testimonies": dynamic(
  //     () =>
  //       import("@/components/widgets/Testimonials").then(
  //         (mod) => mod.Testimonials
  //       ),
  //     { loading: () => <Skeleton className="h-64 w-full" /> }
  //   ),
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
    const baseProps = {
      ...blockData,
      translations: additionalData?.translations,
    };

    switch (blockType) {
      case "homepage.home-game-list":
        return {
          block: blockData,
          games: additionalData?.games || [],
          translations: additionalData?.translations,
        };

    //   case "homepage.home-blog-list":
    //     return {
    //       ...blockData,
    //       blogs: additionalData?.blogs || [],
    //       translations: additionalData?.translations,
    //     };

    //   case "homepage.home-casino-list":
    //     return {
    //       ...blockData,
    //       casinos: additionalData?.casinos || [],
    //       translations: additionalData?.translations,
    //     };

    //   case "casinos.casino-list":
    //     return {
    //       casinos:
    //         blockData.casinosList?.map((item: any) => item.casino?.data) || [],
    //       showCasinoTableHeader: blockData.showCasinoFilters !== true,
    //       country: additionalData?.country,
    //       translations: additionalData?.translations,
    //     };

      case "shared.introduction-with-image":
        return {
          heading: blockData.heading,
          introduction: blockData.introduction,
          image: blockData.image,
          translations: additionalData?.translations,
          isHomePage: true,
        };

    //   case "homepage.home-featured-providers":
    //     return {
    //       ...blockData,
    //       translations: additionalData?.translations,
    //     };

      case "shared.overview-block":
        return {
          data: blockData,
        };

    //   case "shared.single-content":
    //     return {
    //       block: blockData,
    //     };

    //   case "homepage.home-testimonies":
    //     return {
    //       data: blockData,
    //     };

      default:
        return baseProps;
    }
  };

  return (
    <Suspense fallback={<Skeleton className="h-48 w-full animate-pulse" />}>
      <Component {...getComponentProps()} />
    </Suspense>
  );
}
