// src/app/slot-machine/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Image } from "@/components/common/Image";
import { SingleContent } from "@/components/common/SingleContent";
// import { AuthorBox } from "@/components/common";
import { FAQWidget } from "@/components/widgets/FAQWidget";
import { CasinoSidebar } from "@/components/casino/";
import { GameListWidget } from "@/components/widgets/GameListWidget";
import { IntroWithImage } from "@/components/common/IntroWithImage";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { QuicklinksWidget } from "@/components/widgets/QuicklinksWidget";
import {
  getCategoryPageMetadata,
  getCategoryPageDataSplit,
} from "@/lib/strapi/category-page-query-splitter";
import { getAllCategorySlugs } from "@/lib/strapi/category-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import type {
  GamesCarouselBlock,
} from "@/types/dynamic-block.types";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 60; // 1 minute for edge cache

// Generate static params for known category pages
export async function generateStaticParams() {
  try {
    const slugs = await getAllCategorySlugs();
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
    const metadata = await getCategoryPageMetadata(slug);

    if (!metadata) {
      return {
        title: "Category Not Found",
        description: "The requested category could not be found.",
      };
    }

    return generateSEOMetadata({
      title: metadata.seo?.metaTitle || metadata.title,
      description: metadata.seo?.metaDescription || "",
      keywords: metadata.seo?.keywords,
      canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/slot-machine/${slug}`,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }
}

// Main category page component
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;

    // Fetch all data in parallel
    const [categoryDataResponse, layoutData, sidebarCasinos] =
      await Promise.all([
        getCategoryPageDataSplit(slug),
        getLayoutData({ cached: true }),
        import("@/lib/strapi/casino-sidebar-loader").then((mod) =>
          mod.getCasinoSidebarData({ cached: true })
        ),
      ]);

    const { pageData, games, casinos } = categoryDataResponse;
    const { translations } = layoutData;

    if (!pageData) {
      notFound();
    }

    // Create games block for the GameListWidget
    const gamesBlock: GamesCarouselBlock = {
      __component: "games.games-carousel",
      id: 1,
      numberOfGames: 24,
      sortBy: "views:desc",
      showGameFilterPanel: true,
      showGameMoreButton: true,
      gameCategories: [
        {
          id: pageData.id,
          slotCategory: {
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
      "@type": "CollectionPage",
      name: pageData.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/slot-machine/${slug}`,
      description: pageData.seo?.metaDescription || "",
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
      { breadCrumbText: "SLOT MACHINE", breadCrumbUrl: "/slot-machine" },
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
          <div className="lg:container relative mx-auto lg:px-4 z-10 pb-4">
            {/* Introduction (if exists) */}
            {pageData.IntroductionWithImage && (
              <div className="mb-2">
                <IntroWithImage
                  heading={
                    pageData.IntroductionWithImage.heading ||
                    pageData.heading ||
                    pageData.title
                  }
                  introduction={pageData.IntroductionWithImage.introduction}
                  image={pageData.IntroductionWithImage.image}
                />
              </div>
            )}

            {/* Games Section - In Hero */}
            <div className="relative z-10">
              <GameListWidget block={gamesBlock} games={games} translations={translations} />
            </div>
          </div>

          {/* Starry Sky Background Effect (same as homepage) */}
          <div className="absolute top-0 left-0 w-full pointer-events-none">
            <div className="h-[80vh] bg-[#0e1a2f]" />
            <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
          </div>
        </section>

        {/* Main Content Section with Sidebar Layout */}
        <section className="main lg:container mx-auto px-2 py-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Main Content Column */}
            <div className="flex-1 min-w-0">
              {/* Page Title (if not already shown in intro) */}
              {!pageData.IntroductionWithImage?.heading && pageData.heading && (
                <h1 className="text-3xl md:text-4xl font-bold text-heading-text mb-8">
                  {pageData.heading}
                </h1>
              )}

              <div className="space-y-12">
                {/* Quicklinks Widget - At the top of main content */}
                <QuicklinksWidget
                  block={{
                    id: 0,
                    __component: "shared.quicklinks",
                    showQuickLinks: true,
                  }}
                />

                {/* Content Section 1 */}
                {pageData.content1 && (
                  <section
                    className="opacity-0 animate-fadeIn"
                    style={{
                      animationDelay: "100ms",
                      animationFillMode: "forwards",
                    }}
                  >
                    <SingleContent
                      block={{
                        content: pageData.content1,
                      }}
                    />
                  </section>
                )}

                {/* Content Section 2 */}
                {pageData.content2 && (
                  <section
                    className="opacity-0 animate-fadeIn"
                    style={{
                      animationDelay: "200ms",
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

                {/* Related Casinos (if any) */}
                {casinos.length > 0 && (
                  <section
                    className="opacity-0 animate-fadeIn"
                    style={{
                      animationDelay: "300ms",
                      animationFillMode: "forwards",
                    }}
                    aria-label="Related Casinos"
                  >
                    <h2 className="text-2xl md:text-3xl font-bold text-heading-text mb-6">
                      Best Casinos for {pageData.title} Games
                    </h2>
                    <div className="space-y-4">
                      {casinos.map((casino) => (
                        <div
                          key={casino.id}
                          className="bg-white rounded-lg shadow-sm p-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {casino.images && (
                                <Image
                                  src={casino.images.url}
                                  alt={casino.title}
                                  width={80}
                                  height={80}
                                  className="rounded"
                                />
                              )}
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {casino.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>★ {casino.ratingAvg.toFixed(1)}</span>
                                  <span>({casino.ratingCount} reviews)</span>
                                </div>
                              </div>
                            </div>
                            {casino.casinoBonus && (
                              <a
                                href={casino.casinoBonus.bonusUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                {casino.casinoBonus.bonusLabel}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Content Section 3 */}
                {pageData.content3 && (
                  <section
                    className="opacity-0 animate-fadeIn"
                    style={{
                      animationDelay: "400ms",
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
                      animationDelay: "500ms",
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

              {/* Author Box - Show after main content if author exists */}
              {/* Note: Category pages typically don't have authors, but including for consistency */}
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
    console.error("Error loading category page:", error);
    notFound();
  }
}
