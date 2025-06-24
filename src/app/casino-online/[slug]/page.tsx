// src/app/casino-online/[slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { IntroWithImage } from "@/components/common/IntroWithImage";
import { SingleContent } from "@/components/common/SingleContent";
import { CasinoComparison } from "@/components/widgets/CasinoComparison";
import { FAQWidget } from "@/components/widgets/FAQWidget";
import { CasinoSidebar } from "@/components/casino/CasinoSidebar/CasinoSidebar";
import { getCasinoProviderPageDataSplit } from "@/lib/strapi/casino-provider-query-splitter";
import { getAllCasinoProviderSlugs } from "@/lib/strapi/casino-provider-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import type { CasinoProviderPageData } from "@/types/casino-provider.types";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 60; // 1 minute

interface CasinoProviderPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate static params for all casino provider pages
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllCasinoProviderSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

/**
 * Generate metadata for casino provider pages
 */
export async function generateMetadata({
  params,
}: CasinoProviderPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { pageData } = await getCasinoProviderPageDataSplit(slug);

    if (!pageData) {
      return {
        title: "Casino Provider Not Found",
      };
    }

    const description =
      pageData.seo?.metaDescription ||
      pageData.IntroductionWithImage?.introduction ||
      `Explore the best online casinos for ${pageData.title}. Compare bonuses, games, and features.`;

    return generateSEOMetadata({
      title:
        pageData.seo?.metaTitle || `${pageData.title} - Best Online Casinos`,
      description,
      path: `/casino-online/${slug}`,
      modifiedTime: pageData.updatedAt,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Casino Provider",
    };
  }
}

/**
 * Main casino provider page component
 */
export default async function CasinoProviderPage({
  params,
}: CasinoProviderPageProps) {
  const { slug } = await params;

  // Fetch data in parallel
  const [casinoProviderResponse, layoutData, sidebarCasinos] =
    await Promise.all([
      getCasinoProviderPageDataSplit(slug),
      getLayoutData({ cached: true }),
      import("@/lib/strapi/casino-sidebar-loader").then((mod) =>
        mod.getCasinoSidebarData({ cached: true })
      ),
    ]);

  const { pageData, comparisonCasinos, casinoLists } = casinoProviderResponse;
  const { translations } = layoutData;

  if (!pageData) {
    notFound();
  }

  // Generate breadcrumbs
  const breadcrumbs = [
    { breadCrumbText: translations.home || "Home", breadCrumbUrl: "/" },
    { breadCrumbText: "Casino Online", breadCrumbUrl: "/casino-online" },
    { breadCrumbText: pageData.title, breadCrumbUrl: "" },
  ];

  // Generate schema.org structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageData.title,
    description:
      pageData.seo?.metaDescription ||
      pageData.IntroductionWithImage?.introduction,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/casino-online/${slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: comparisonCasinos.length,
      itemListElement: comparisonCasinos.map((casino, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Casino",
          name: casino.title,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/casino/recensione/${casino.slug}`,
          aggregateRating:
            casino.ratingAvg > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: casino.ratingAvg,
                  reviewCount: casino.ratingCount,
                }
              : undefined,
        },
      })),
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} showHome={false} />

      {/* Hero Section with Introduction and Casino Comparison */}
      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="container relative mx-auto px-4 z-10 pb-12">
          {/* Introduction with Image */}
          {pageData.IntroductionWithImage && (
            <div className="py-12">
              <IntroWithImage
                heading={
                  pageData.IntroductionWithImage.heading || pageData.title
                }
                introduction={pageData.IntroductionWithImage.introduction}
                image={pageData.IntroductionWithImage.image}
              />
            </div>
          )}

          {/* Casino Comparison Table - In Hero */}
          {comparisonCasinos.length > 0 && (
            <div className="relative z-10">
              <CasinoComparison
                casinos={comparisonCasinos}
                translations={translations}
              />
            </div>
          )}
        </div>

        {/* Starry Sky Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="star-field absolute inset-0" aria-hidden="true">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="star absolute bg-white rounded-full animate-twinkle"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main py-12">
        <div className="container mx-auto px-4">
          <div className="lg:flex lg:gap-8">
            {/* Main Content Column */}
            <div className="flex-1">
              <div className="space-y-12">
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

                {/* Casino Lists Table - After Content 1 */}
                {casinoLists.length > 0 && (
                  <section
                    className="opacity-0 animate-fadeIn"
                    style={{
                      animationDelay: "150ms",
                      animationFillMode: "forwards",
                    }}
                    aria-label="Casino Comparison Table"
                  >
                    <CasinoComparison
                      casinos={casinoLists}
                      translations={translations}
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

                {/* FAQs - Using direct prop like in other pages */}
                {pageData.faqs && pageData.faqs.length > 0 && (
                  <section
                    className="opacity-0 animate-fadeIn"
                    style={{
                      animationDelay: "400ms",
                      animationFillMode: "forwards",
                    }}
                    aria-label="Frequently Asked Questions"
                  >
                    <FAQWidget
                      faqs={pageData.faqs}
                      title={translations.faq || "Frequently Asked Questions"}
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
        </div>
      </section>
    </>
  );
}
