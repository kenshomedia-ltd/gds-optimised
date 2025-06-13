// src/app/[...slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Image } from "@/components/common/Image";
import {
  getCustomPageMetadata,
  getCustomPageDataSplit,
} from "@/lib/strapi/custom-page-split-query";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { BreadcrumbsWithLayout } from "@/components/layout/Breadcrumbs";
import { DynamicBlock } from "@/components/common/DynamicBlock";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import type { CustomPageBlock } from "@/types/custom-page.types";
import type { BreadcrumbItem } from "@/types/breadcrumbs.types";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 60; // 1 minute for edge cache

// Hero block types configuration (same as homepage)
const HERO_BLOCK_TYPES = [
  "shared.introduction-with-image",
  "homepage.home-game-list",
  "homepage.home-featured-providers",
  "shared.overview-block",
  "games.games-carousel", // Also support custom page blocks in hero
  "games.new-and-loved-slots",
];

// Generate static params for known pages
export async function generateStaticParams() {
  // Implement this when you want to pre-generate pages
  // For now, return empty array to rely on on-demand generation
  return [];
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  // Await params as required in Next.js 15
  const { slug } = await params;
  const path = slug.join("/");

  try {
    const metadata = await getCustomPageMetadata(path);

    if (!metadata) {
      return {
        title: "Page Not Found",
        description: "The requested page could not be found.",
      };
    }

    return generateSEOMetadata({
      title: metadata.seo?.metaTitle || metadata.title,
      description: metadata.seo?.metaDescription || "",
      keywords: metadata.seo?.keywords,
      canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/${path}`,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Page Not Found",
      description: "The requested page could not be found.",
    };
  }
}

// Main page component
export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  try {
    const startTime = Date.now();

    // Await params as required in Next.js 15
    const { slug } = await params;
    const path = slug.join("/");

    // Parallel data fetching
    const [layoutData, customPageResponse] = await Promise.all([
      getLayoutData({ cached: true }),
      getCustomPageDataSplit(path),
    ]);

    const { pageData, games, casinos, dynamicGamesData } = customPageResponse;
    const { layout, translations } = layoutData;

    if (!pageData) {
      notFound();
    }

    // Additional data for blocks
    const additionalData = {
      games,
      casinos,
      translations,
      dynamicGamesData,
    };

    // Separate blocks by section with proper typing
    const blocks = (pageData?.blocks || []) as CustomPageBlock[];
    const heroBlocks = blocks.filter(
      (block: CustomPageBlock, index: number) =>
        index < 4 && HERO_BLOCK_TYPES.includes(block.__component)
    );
    const mainBlocks = blocks.filter(
      (block: CustomPageBlock, index: number) =>
        !(index < 4 && HERO_BLOCK_TYPES.includes(block.__component))
    );

    // Log performance in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Custom page data fetching took: ${Date.now() - startTime}ms`
      );
    }

    // Get all layout breadcrumb collections
    const layoutBreadcrumbs: Record<string, BreadcrumbItem[]> = {};
    Object.keys(layout).forEach((key) => {
      if (key.endsWith("Breadcrumbs") && Array.isArray(layout[key])) {
        layoutBreadcrumbs[key] = layout[key];
      }
    });

    // Schema.org structured data for custom pages
    const pageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: pageData.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${path}`,
      description: pageData.seo?.metaDescription || "",
      ...(pageData.author && {
        author: {
          "@type": "Person",
          name: `${pageData.author.firstName} ${pageData.author.lastName}`,
          ...(pageData.author.jobTitle && {
            jobTitle: pageData.author.jobTitle,
          }),
        },
      }),
      ...(pageData.updatedAt && {
        dateModified: pageData.updatedAt,
      }),
      ...(pageData.createdAt && {
        datePublished: pageData.createdAt,
      }),
    };

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
        />

        {/* Breadcrumbs */}
        <BreadcrumbsWithLayout
          items={pageData.breadcrumbs || []}
          breadcrumbKey="customPageBreadcrumbs"
          layoutBreadcrumbs={layoutBreadcrumbs}
          showHome={true}
        />

        {/* Hero Section with Featured Blocks (same structure as homepage) */}
        {heroBlocks.length > 0 && (
          <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
            <div className="container relative mx-auto px-4 z-10">
              {heroBlocks.map((block: CustomPageBlock, index: number) => (
                <div
                  key={`hero-${block.__component}-${index}`}
                  className="mb-8"
                >
                  <DynamicBlock
                    blockType={block.__component}
                    blockData={block}
                    additionalData={additionalData}
                  />
                </div>
              ))}
            </div>

            {/* Starry Sky Background Effect (same as homepage) */}
            <div className="absolute top-0 left-0 w-full pointer-events-none">
              <div className="h-[80vh] bg-[#0e1a2f]" />
              <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
            </div>
          </section>
        )}

        {/* Main Content Section (same structure as homepage) */}
        <main className="container mx-auto px-4 py-8">
          {/* Show author and date if enabled */}
          {pageData.showContentDate && (
            <div className="mb-8 flex items-center gap-4 text-sm text-muted-foreground">
              {pageData.author && (
                <div className="flex items-center gap-2">
                  {pageData.author.photo && (
                    <Image
                      src={pageData.author.photo.url}
                      alt={`${pageData.author.firstName} ${pageData.author.lastName}`}
                      width={32}
                      height={32}
                      className="rounded-full"
                      quality={90}
                      loading="eager"
                    />
                  )}
                  <span>
                    {pageData.author.firstName} {pageData.author.lastName}
                  </span>
                </div>
              )}
              {pageData.updatedAt && (
                <time dateTime={pageData.updatedAt}>
                  {new Date(pageData.updatedAt).toLocaleDateString()}
                </time>
              )}
            </div>
          )}

          <div className="space-y-12">
            {mainBlocks.map((block: CustomPageBlock, index: number) => (
              <section
                key={`main-${block.__component}-${index}`}
                className="opacity-0 animate-fadeIn"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <DynamicBlock
                  blockType={block.__component}
                  blockData={block}
                  additionalData={additionalData}
                />
              </section>
            ))}
          </div>

          {/* Sidebar if specified */}
          {pageData.sideBarToShow && (
            <aside className="mt-8 lg:mt-0 lg:ml-8 lg:w-1/3">
              {/* Implement sidebar content based on sideBarToShow value */}
              <div className="sticky top-4">{/* Sidebar content */}</div>
            </aside>
          )}
        </main>
      </>
    );
  } catch (error) {
    console.error("Error loading custom page:", error);
    notFound();
  }
}
