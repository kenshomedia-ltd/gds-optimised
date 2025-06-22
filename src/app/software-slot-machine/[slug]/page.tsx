// src/app/software-slot-machine/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { SingleContent } from "@/components/common/SingleContent";
import { IntroWithImage } from "@/components/common/IntroWithImage";
import { FAQWidget } from "@/components/widgets/FAQWidget";
import { CasinoSidebar } from "@/components/casino/";
import { GameListWidget } from "@/components/widgets/GameListWidget";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CasinoComparison } from "@/components/widgets/CasinoComparison";
import {
  getProviderPageMetadata,
  getProviderPageDataSplit,
} from "@/lib/strapi/provider-page-query-splitter";
import { getAllProviderSlugs } from "@/lib/strapi/provider-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import type { GamesCarouselBlock } from "@/types/dynamic-block.types";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 60; // 1 minute for edge cache

// Generate static params for known provider pages
export async function generateStaticParams() {
  try {
    const slugs = await getAllProviderSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const metadata = await getProviderPageMetadata(slug);

    if (!metadata) {
      return {
        title: "Provider Not Found",
        description: "The requested provider could not be found.",
      };
    }

    return generateSEOMetadata({
      title: metadata.seo?.metaTitle || metadata.title,
      description: metadata.seo?.metaDescription || "",
      keywords: metadata.seo?.keywords,
      canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/software-slot-machine/${slug}`,
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
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const startTime = Date.now();
    const { slug } = await params;

    // Fetch all data in parallel
    const [providerDataResponse, layoutData, sidebarCasinos] =
      await Promise.all([
        getProviderPageDataSplit(slug),
        getLayoutData({ cached: true }),
        import("@/lib/strapi/casino-sidebar-loader").then((mod) =>
          mod.getCasinoSidebarData({ cached: true })
        ),
      ]);

    const { pageData, games, casinos } = providerDataResponse;
    const { translations } = layoutData;

    if (!pageData) {
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
      numberOfGames: 24,
      sortBy: "ratingAvg:desc",
      showGameFilterPanel: true,
      showGameMoreButton: true,
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
        breadCrumbUrl: "/software-slot-machine",
      },
      { breadCrumbText: pageData.title.toUpperCase(), breadCrumbUrl: "" },
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
          <div className="container relative mx-auto px-4 z-10 py-12">
            {/* Introduction */}
            {(pageData.IntroductionWithImage || pageData.content1) && (
              <div className="mb-8">
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

            {/* Games Section - In Hero */}
            {games && games.length > 0 && (
              <div className="relative z-10">
                <GameListWidget block={gamesBlock} games={games} />
              </div>
            )}
          </div>

          {/* Starry Sky Background Effect (same as homepage) */}
          <div className="absolute top-0 left-0 w-full pointer-events-none">
            <div className="h-[80vh] bg-[#0e1a2f]" />
            <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
          </div>
        </section>

        {/* Main Content Section with Sidebar Layout */}
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
                      title={`${pageData.title} FAQs`}
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
      </>
    );
  } catch (error) {
    console.error("Error loading provider page:", error);
    notFound();
  }
}
