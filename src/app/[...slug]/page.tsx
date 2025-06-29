// src/app/[...slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCustomPageDataSplit } from "@/lib/strapi/custom-page-split-query";
import { getAllCustomPagePaths } from "@/lib/strapi/custom-page-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { getCasinoSidebarData } from "@/lib/strapi/casino-sidebar-loader";
import { DynamicBlock } from "@/components/common/DynamicBlock";
import { CasinoListServer } from "@/components/widgets/CasinoList/CasinoListServer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import { AuthorBox } from "@/components/common/AuthorBox/AuthorBox";
import { CasinoSidebar } from "@/components/casino";
import { mapBlockToBlockData } from "@/lib/utils/block-type-utils";
import type { CasinoListBlock } from "@/types/casino-filters.types";
import type { SidebarCasinoSections } from "@/types/sidebar.types";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 60; // 1 minute

interface CustomPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Hero block types configuration
const HERO_BLOCK_TYPES = [
  "shared.introduction-with-image",
  "homepage.home-game-list",
  "homepage.home-featured-providers",
  "shared.overview-block",
  "games.games-carousel",
  "games.new-and-loved-slots",
  "casinos.casino-list",
];

/**
 * Generate metadata for custom pages
 */
export async function generateMetadata({
  params,
}: CustomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = "/" + slug.join("/");

  const { pageData } = await getCustomPageDataSplit(path);

  if (!pageData) {
    return {
      title: "Page Not Found",
      description: "The page you are looking for does not exist.",
    };
  }

  return generateSEOMetadata({
    title: pageData.seo?.metaTitle || pageData.title,
    description: pageData.seo?.metaDescription || "",
    keywords: pageData.seo?.keywords,
    canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}${path}`,
    // image: pageData.seo?.metaImage?.url,
  });
}

/**
 * Generate static params for ISR
 */
export async function generateStaticParams() {
  try {
    const paths = await getAllCustomPagePaths();
    return paths.map((path) => ({
      slug: path.split("/").filter(Boolean),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

/**
 * Helper to extract page number from URL
 */
function extractPageNumber(slug: string[]): {
  cleanSlug: string[];
  page: number;
} {
  const lastSegment = slug[slug.length - 1];
  const pageMatch = lastSegment?.match(/^p(\d+)$/);

  if (pageMatch) {
    const page = parseInt(pageMatch[1], 10);
    return {
      cleanSlug: slug.slice(0, -1),
      page: page >= 1 ? page : 1,
    };
  }

  return {
    cleanSlug: slug,
    page: 1,
  };
}

/**
 * Custom Page Component
 */
export default async function CustomPage({ params }: CustomPageProps) {
  try {
    const startTime = Date.now();
    const { slug } = await params;

    // Extract page number if present (for paginated casino lists)
    const { cleanSlug, page: currentPage } = extractPageNumber(slug);
    const path = "/" + cleanSlug.join("/");

    // First fetch page data to check if it exists
    const pageDataResult = await getCustomPageDataSplit(path);

    if (!pageDataResult.pageData) {
      notFound();
    }

    const { pageData, games, casinos, dynamicGamesData, dynamicCasinosData } =
      pageDataResult;

    // Fetch layout and sidebar data in parallel
    const [{ translations }, sidebarCasinos] = await Promise.all([
      getLayoutData({ cached: true }),
      (!pageData.sideBarToShow ||
      pageData.sideBarToShow === "casinos" ||
      pageData.sideBarToShow === "casino"
        ? getCasinoSidebarData({ cached: true })
        : Promise.resolve(null)) as Promise<SidebarCasinoSections | null>,
    ]);

    if (!pageData) {
      notFound();
    }

    // Additional data for dynamic blocks
    const additionalData = {
      translations,
      games,
      casinos,
      currentPage,
      dynamicGamesData: {
        ...dynamicGamesData,
        // Merge with game carousel blocks if they exist
        ...(pageData.blocks &&
          pageData.blocks.reduce((acc, block) => {
            if (
              block.__component === "games.games-carousel" &&
              games.length > 0
            ) {
              acc[`block-${block.id}`] = { games };
            }
            return acc;
          }, {} as Record<string, { games: typeof games }>)),
      },
      dynamicCasinosData,
    };

    // Separate blocks by type (hero vs main)
    const blocks = pageData?.blocks || [];
    const heroBlocks = blocks.filter(
      (block, index) =>
        index < 4 && HERO_BLOCK_TYPES.includes(block.__component)
    );
    const mainBlocks = blocks.filter(
      (block, index) =>
        !(index < 4 && HERO_BLOCK_TYPES.includes(block.__component))
    );

    // Log performance in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Custom page data fetching took: ${Date.now() - startTime}ms`
      );
    }

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

    // Build the base URL for pagination
    const baseUrl = `/${cleanSlug.join("/")}`;

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
        />

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={pageData.breadcrumbs || []}
          showHome={false} // Home is already included in the breadcrumbs from API
        />

        {/* Hero Section with Featured Blocks (same structure as homepage) */}
        {heroBlocks.length > 0 && (
          <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
            <div className="lg:container relative mx-auto lg:px-4 z-10">
              {heroBlocks.map((block, index: number) => (
                <div
                  key={`hero-${block.__component}-${index}`}
                  className="mb-8"
                >
                  <DynamicBlock
                    blockType={block.__component}
                    blockData={mapBlockToBlockData(block)}
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

        {/* Main Content Section with Sidebar Layout */}
        <section className="main lg:container mx-auto px-4 py-8">
          <div
            className={
              !pageData.sideBarToShow ||
              pageData.sideBarToShow === "casinos" ||
              pageData.sideBarToShow === "casino"
                ? "lg:flex lg:gap-8"
                : ""
            }
          >
            {/* Main Content */}
            <div
              className={
                !pageData.sideBarToShow ||
                pageData.sideBarToShow === "casinos" ||
                pageData.sideBarToShow === "casino"
                  ? "flex-1 min-w-0"
                  : ""
              }
            >
              <div className="space-y-12">
                {mainBlocks.map((block, index: number) => {
                  // Special handling for casino list blocks
                  if (block.__component === "casinos.casino-list") {
                    const casinoBlock = block as CasinoListBlock;
                    // Get casinos for this specific block
                    const blockCasinos =
                      dynamicCasinosData[`block-${block.id}`] || [];

                    // If showLoadMore is enabled, use server-side rendering for no-JS support
                    if (
                      casinoBlock.showLoadMore &&
                      casinoBlock.numberPerLoadMore
                    ) {
                      // Calculate which casinos to show based on current page
                      const itemsPerPage = casinoBlock.numberPerLoadMore;
                      const paginatedCasinos = blockCasinos.slice(
                        0,
                        currentPage * itemsPerPage
                      );

                      return (
                        <section
                          key={`main-${block.__component}-${index}`}
                          className="opacity-0 animate-fadeIn"
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animationFillMode: "forwards",
                          }}
                        >
                          {/* Server-side rendered version for no-JS */}
                          <noscript>
                            <CasinoListServer
                              block={casinoBlock}
                              casinos={blockCasinos}
                              translations={translations}
                              currentPage={currentPage}
                              baseUrl={baseUrl}
                            />
                          </noscript>

                          {/* Client-side enhanced version */}
                          <DynamicBlock
                            blockType={block.__component}
                            blockData={mapBlockToBlockData(block)}
                            additionalData={{
                              ...additionalData,
                              casinos: paginatedCasinos,
                            }}
                          />
                        </section>
                      );
                    }

                    // Regular casino list without pagination
                    return (
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
                          blockData={mapBlockToBlockData(block)}
                          additionalData={{
                            ...additionalData,
                            casinos: blockCasinos,
                          }}
                        />
                      </section>
                    );
                  }

                  // Regular block rendering
                  return (
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
                        blockData={mapBlockToBlockData(block)}
                        additionalData={additionalData}
                      />
                    </section>
                  );
                })}
              </div>

              {/* Author Box - Show after main content if author exists */}
              {pageData.author && (
                <div className="mt-12">
                  <AuthorBox author={pageData.author} />
                </div>
              )}
            </div>

            {/* Casino Sidebar */}
            {(!pageData.sideBarToShow ||
              pageData.sideBarToShow === "casinos" ||
              pageData.sideBarToShow === "casino") &&
              sidebarCasinos && (
                <aside className="mt-8 lg:mt-0 lg:w-80 xl:w-96">
                  <CasinoSidebar
                    casinos={sidebarCasinos}
                    translations={translations}
                  />
                </aside>
              )}
          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error("Error loading custom page:", error);
    notFound();
  }
}
