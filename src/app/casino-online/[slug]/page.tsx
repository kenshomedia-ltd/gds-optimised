// src/app/casino-online/[slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SingleContent } from "@/components/common";
import { Breadcrumbs } from "@/components/layout";
import { CasinoSidebar, CasinoTable } from "@/components/casino";
import { CasinoComparison } from "@/components/widgets";
import { IntroWithImage } from "@/components/common";
import { FAQWidget } from "@/components/widgets";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import { getLayoutData } from "@/lib/strapi/data-loader";
import {
  getCasinoProviderPageDataSplit,
  getCasinoProviderPageMetadata,
} from "@/lib/strapi/casino-provider-query-splitter";

interface CasinoProviderPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate metadata for the casino provider page
 */
export async function generateMetadata({
  params,
}: CasinoProviderPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const pageData = await getCasinoProviderPageMetadata(slug);

    if (!pageData) {
      return {
        title: "Casino Provider Not Found",
      };
    }

    const description =
      pageData.seo?.metaDescription ||
      `Discover the best online casinos offering ${pageData.title} games. Compare bonuses, games, and features.`;

    return generateSEOMetadata({
      title:
        pageData.seo?.metaTitle || `${pageData.title} - Best Online Casinos`,
      description,
      keywords: pageData.seo?.keywords,
      canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/casino-online/${slug}`,
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
      numberOfItems: casinoLists.length,
      itemListElement: casinoLists.map((casino, index) => ({
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
                  ratingCount: casino.ratingCount,
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

      {/* Hero Section with Introduction and Casino Table */}
      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="lg:container relative mx-auto lg:px-4 z-10 py-12">
          {/* Introduction (if exists) */}
          {pageData.IntroductionWithImage && (
            <div className="mb-2">
              <IntroWithImage
                heading={
                  pageData.IntroductionWithImage.heading ||
                  pageData.title
                }
                introduction={pageData.IntroductionWithImage.introduction}
                image={pageData.IntroductionWithImage.image}
              />
            </div>
          )}

          {/* Casino Table - In Hero */}
          {casinoLists.length > 0 && (
            <div className="relative z-10">
              <CasinoTable
                casinos={casinoLists}
                showCasinoTableHeader={true}
                translations={translations}
              />
            </div>
          )}
        </div>

        {/* Starry Sky Background Effect (same as slot-machine) */}
        <div className="absolute top-0 left-0 w-full pointer-events-none">
          <div className="h-[80vh] bg-[#0e1a2f]" />
          <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
        </div>
      </section>

      {/* Main Content Section with Sidebar Layout */}
      <section className="main lg:container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main Content Column */}
          <div className="flex-1 min-w-0">
            {/* Page Title (if not already shown in intro) */}
            {!pageData.IntroductionWithImage && (
              <h1 className="text-3xl font-bold mb-6">{pageData.title}</h1>
            )}

            {/* Content Section 1 */}
            {pageData.content1 && (
              <section className="mb-8">
                <SingleContent
                  block={{
                    content: pageData.content1,
                  }}
                />
              </section>
            )}

            {/* Casino Comparison - After Content 1 */}
            {comparisonCasinos.length > 0 && (
              <section className="mb-8" aria-label="Top 3 Casinos Comparison">
                <CasinoComparison
                  casinos={comparisonCasinos}
                  translations={translations}
                />
              </section>
            )}

            {/* Content Section 2 */}
            {pageData.content2 && (
              <section className="mb-8">
                <SingleContent
                  block={{
                    content: pageData.content2,
                  }}
                />
              </section>
            )}

            {/* Content Section 3 */}
            {pageData.content3 && (
              <section className="mb-8">
                <SingleContent
                  block={{
                    content: pageData.content3,
                  }}
                />
              </section>
            )}

            {/* FAQs */}
            {pageData.faqs && pageData.faqs.length > 0 && (
              <section aria-label="Frequently Asked Questions">
                <FAQWidget faqs={pageData.faqs} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-4 lg:h-fit">
            <CasinoSidebar
              casinos={sidebarCasinos}
              translations={translations}
            />
          </aside>
        </div>
      </section>
    </>
  );
}
