// src/components/common/DynamicBlock/DynamicBlock.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { DynamicBlockProps } from "@/types/dynamic-block.types";
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

      case "homepage.home-blog-list":
        return {
          block: blockData,
          blogs: additionalData?.blogs || [],
          translations: additionalData?.translations,
        };

        case "homepage.home-casino-list":
          return {
            block: blockData,
            casinos: additionalData?.casinos || [],
            translations: additionalData?.translations,
          };

      case "shared.introduction-with-image":
        return {
          heading: blockData.heading,
          introduction: blockData.introduction,
          image: blockData.image,
          translations: additionalData?.translations,
          isHomePage: true,
        };

      case "homepage.home-featured-providers":
        return {
          data: blockData,
          translations: additionalData?.translations,
        };

      case "shared.overview-block":
        return {
          data: blockData,
        };

        case "shared.single-content":
          return {
            block: blockData,
          };

        case "homepage.home-testimonies":
          return {
            data: blockData,
          };

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
