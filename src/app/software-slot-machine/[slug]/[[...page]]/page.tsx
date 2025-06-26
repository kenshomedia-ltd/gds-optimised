// src/app/software-slot-machine/[slug]/[[...page]]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { SingleContent } from "@/components/common/SingleContent";
import { IntroWithImage } from "@/components/common/IntroWithImage";
import { FAQWidget } from "@/components/widgets/FAQWidget";
import { CasinoSidebar } from "@/components/casino/";
import { GameListWidget } from "@/components/widgets/GameListWidget/GameListWidget";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CasinoComparison } from "@/components/widgets/CasinoComparison";
import {
  getProviderPageMetadata,
  getProviderPageDataSplitWithPagination,
} from "@/lib/strapi/provider-page-query-splitter";
import { getAllProviderSlugs } from "@/lib/strapi/provider-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import type { GamesCarouselBlock } from "@/types/dynamic-block.types";
import { getFilterProviders } from "@/app/actions/games";
import type { SelectedFilters } from "@/types/game-list-widget.types";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 60; // 1 minute for edge cache

interface ProviderPageProps {
  params: Promise<{
    slug: string;
    page?: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Helper function to extract page number from params
function getPageNumber(pageParam?: string[]): number {
  if (!pageParam || pageParam.length === 0) return 1;

  const pageStr = pageParam[0];
  // Check if it matches p2, p3, etc.
  const match = pageStr.match(/^p(\d+)$/);
  if (match) {
    const pageNum = parseInt(match[1], 10);
    return pageNum >= 1 ? pageNum : 1;
  }

  return 1;
}

// Generate static params for known provider pages
export async function generateStaticParams() {
  try {
    const slugs = await getAllProviderSlugs();
    // Generate first 3 pages for each provider
    return slugs.flatMap((slug) => [
      { slug, page: undefined }, // Page 1 (no page param)
      { slug, page: ["p2"] },
      { slug, page: ["p3"] },
    ]);
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generate metadata
export async function generateMetadata({
  params,
}: ProviderPageProps): Promise<Metadata> {
  const { slug, page: pageParam } = await params;
  const currentPage = getPageNumber(pageParam);

  try {
    const metadata = await getProviderPageMetadata(slug);

    if (!metadata) {
      return {
        title: "Provider Not Found",
        description: "The requested provider could not be found.",
      };
    }

    const title =
      currentPage > 1
        ? `${metadata.title} Games - Page ${currentPage}`
        : metadata.seo?.metaTitle || metadata.title;

    const canonicalUrl =
      currentPage > 1
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/software-slot-machine/${slug}/p${currentPage}`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/software-slot-machine/${slug}`;

    return generateSEOMetadata({
      title,
      description: metadata.seo?.metaDescription || "",
      keywords: metadata.seo?.keywords,
      canonicalUrl,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Provider Not Found",
      description: "The requested provider could not be found.",
    };
  }
}

// Main provider page component
export default async function ProviderPage({
  params,
  searchParams,
}: ProviderPageProps) {
  try {
    const startTime = Date.now();
    const { slug, page: pageParam } = await params;
    const currentPage = getPageNumber(pageParam);
    const gamesPerPage = 24;

    // Validate page parameter format if it exists
    if (pageParam && pageParam.length > 0 && !pageParam[0].match(/^p\d+$/)) {
      notFound();
    }

    // Parse search params for filters
    const search = await searchParams;
    const selectedFilters: SelectedFilters = {
      providers: search?.providers
        ? typeof search.providers === "string"
          ? search.providers.split(",")
          : search.providers
        : [],
      categories: search?.categories
        ? typeof search.categories === "string"
          ? search.categories.split(",")
          : search.categories
        : [],
    };

    // Fetch all data in parallel
    const [providerDataResponse, layoutData, sidebarCasinos, allProviders] =
      await Promise.all([
        getProviderPageDataSplitWithPagination(
          slug,
          currentPage,
          gamesPerPage,
          selectedFilters
        ),
        getLayoutData({ cached: true }),
        import("@/lib/strapi/casino-sidebar-loader").then((mod) =>
          mod.getCasinoSidebarData({ cached: true })
        ),
        getFilterProviders(),
      ]);

    const { pageData, games, pagination, filterOptions } = providerDataResponse;
    const { translations } = layoutData;

    if (!pageData) {
      notFound();
    }

    // Check if page exists
    if (currentPage > pagination.pageCount && pagination.pageCount > 0) {
      notFound();
    }

    // Log performance in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Provider page data fetching took: ${Date.now() - startTime}ms`
      );
    }

    // Create games block for the GameListWidget
    const gamesBlock: GamesCarouselBlock = {
      __component: "games.games-carousel",
      id: 1,
      numberOfGames: gamesPerPage,
      sortBy: "ratingAvg:desc",
      showGameFilterPanel: true,
      showGameMoreButton: false, // Using pagination instead
      gameProviders: [
        {
          id: pageData.id,
          slotProvider: {
            id: pageData.id,
            slug: pageData.slug,
            title: pageData.title,
          },
        },
      ],
    };

    // Schema.org structured data
    const pageSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: pageData.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/software-slot-machine/${slug}`,
      description: pageData.seo?.metaDescription || "",
      ...(pageData.images?.url && {
        logo: {
          "@type": "ImageObject",
          url: pageData.images.url,
        },
      }),
      ...(pageData.updatedAt && {
        dateModified: pageData.updatedAt,
      }),
      ...(pageData.createdAt && {
        datePublished: pageData.createdAt,
      }),
    };

    // Generate breadcrumbs
    const breadcrumbs = [
      { breadCrumbText: "HOME", breadCrumbUrl: "/" },
      {
        breadCrumbText: "SOFTWARE SLOT MACHINE",
        breadCrumbUrl: "/slot-software",
      },
      {
        breadCrumbText: pageData.title.toUpperCase(),
        breadCrumbUrl: currentPage > 1 ? `/software-slot-machine/${slug}` : "",
      },
      ...(currentPage > 1
        ? [{ breadCrumbText: `PAGE ${currentPage}`, breadCrumbUrl: "" }]
        : []),
    ];

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
        />

        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} showHome={false} />

        {/* Hero Section with Introduction and Games */}
        <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
          <div className="container relative mx-auto px-4 z-10 pb-12">
            {/* Introduction - Only show on first page */}
            {currentPage === 1 &&
              (pageData.IntroductionWithImage || pageData.content1) && (
                <div>
                  <IntroWithImage
                    heading={
                      pageData.IntroductionWithImage?.heading ||
                      pageData.heading ||
                      pageData.title
                    }
                    introduction={
                      pageData.IntroductionWithImage?.introduction ||
                      pageData.content1
                    }
                    image={
                      pageData.IntroductionWithImage?.image || pageData.images
                    }
                  />
                </div>
              )}

            {/* Page title for subsequent pages */}
            {currentPage > 1 && (
              <div className="text-center py-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {pageData.title} Games
                </h1>
                <p className="text-xl text-gray-300">Page {currentPage}</p>
              </div>
            )}

            {/* Games Section - In Hero */}
            {games && (
              <div className="relative z-10">
                <GameListWidget
                  block={gamesBlock}
                  games={games}
                  translations={translations}
                  providers={allProviders}
                  categories={filterOptions?.categories}
                  usePagination={true}
                  currentPage={currentPage}
                  totalPages={pagination.pageCount}
                  totalGames={pagination.total}
                  baseUrl={`/software-slot-machine/${slug}`}
                />
              </div>
            )}
          </div>

          {/* Background gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-30" />
          </div>
        </section>

        {/* Main Content Section - Only show on first page */}
        {currentPage === 1 && (
          <section className="main container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Main Content Column */}
              <div className="flex-1 min-w-0">
                {/* Content sections with staggered animations */}
                <div className="space-y-8">
                  {/* Content Section 2 */}
                  {pageData.content2 && (
                    <section
                      className="opacity-0 animate-fadeIn"
                      style={{
                        animationDelay: "100ms",
                        animationFillMode: "forwards",
                      }}
                    >
                      <SingleContent
                        block={{
                          content: pageData.content2,
                        }}
                      />
                    </section>
                  )}

                  {/* Related Casinos - Using CasinoComparison */}
                  {pageData.relatedCasinos &&
                    pageData.relatedCasinos.length > 0 && (
                      <section
                        className="opacity-0 animate-fadeIn my-12"
                        style={{
                          animationDelay: "200ms",
                          animationFillMode: "forwards",
                        }}
                      >
                        <h2 className="text-2xl font-bold mb-6 text-center">
                          {translations.bestCasinosWithProvider ||
                            `Best Casinos with ${pageData.title}`}
                        </h2>
                        <CasinoComparison
                          casinos={pageData.relatedCasinos}
                          translations={translations}
                        />
                      </section>
                    )}

                  {/* Content Section 3 */}
                  {pageData.content3 && (
                    <section
                      className="opacity-0 animate-fadeIn"
                      style={{
                        animationDelay: "300ms",
                        animationFillMode: "forwards",
                      }}
                    >
                      <SingleContent
                        block={{
                          content: pageData.content3,
                        }}
                      />
                    </section>
                  )}

                  {/* FAQs */}
                  {pageData.faqs && pageData.faqs.length > 0 && (
                    <section
                      className="opacity-0 animate-fadeIn"
                      style={{
                        animationDelay: "400ms",
                        animationFillMode: "forwards",
                      }}
                    >
                      <FAQWidget
                        faqs={pageData.faqs}
                        title={translations.faq}
                        className="mt-12"
                        defaultOpen={true}
                      />
                    </section>
                  )}
                </div>
              </div>

              {/* Casino Sidebar */}
              {sidebarCasinos && (
                <aside className="mt-8 lg:mt-0 lg:w-80 xl:w-96">
                  <CasinoSidebar
                    casinos={sidebarCasinos}
                    translations={translations}
                  />
                </aside>
              )}
            </div>
          </section>
        )}
      </>
    );
  } catch (error) {
    console.error("Error loading provider page:", error);
    notFound();
  }
}
