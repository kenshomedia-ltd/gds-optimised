// src/app/casino/recensione/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getCasinoPageDataWithGames,
  getCasinoMetadata,
} from "@/lib/strapi/casino-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import { CasinoHero } from "@/components/casino/CasinoHero/CasinoHero";
import { CasinoContent } from "@/components/casino/CasinoContent/CasinoContent";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { CasinoPageData, FAQ, HowToStep } from "@/types/casino-page.types";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

interface CasinoPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all casino pages
export async function generateStaticParams() {
  // This would fetch all casino slugs from Strapi
  // For now, return empty array to allow dynamic generation
  return [];
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CasinoPageProps): Promise<Metadata> {
  const { slug } = params;

  try {
    // Use lightweight metadata query for better performance
    const casinoMetadata = await getCasinoMetadata(slug);

    if (!casinoMetadata) {
      return {};
    }

    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/casino/recensione/${slug}`;

    return generateSEOMetadata({
      title: casinoMetadata.seo?.metaTitle || `${casinoMetadata.title} Review`,
      description:
        casinoMetadata.seo?.metaDescription ||
        casinoMetadata.introduction?.substring(0, 160),
      keywords: casinoMetadata.seo?.keywords,
      canonicalUrl,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {};
  }
}

export default async function CasinoPage({ params }: CasinoPageProps) {
  const { slug } = params;

  // Fetch casino data with games and layout data in parallel
  const [casinoResponse, layoutData] = await Promise.all([
    getCasinoPageDataWithGames(slug, { cached: true, gamesLimit: 12 }),
    getLayoutData({ cached: true }),
  ]);

  if (!casinoResponse.casinoData) {
    notFound();
  }

  const { casinoData, games } = casinoResponse;
  const { translations } = layoutData;

  if (!casinoData) {
    notFound();
  }

  // Generate breadcrumbs
  const breadcrumbItems = [
    {
      breadCrumbText: translations.home || "Home",
      breadCrumbUrl: "/",
    },
    {
      breadCrumbText: translations.casinos || "Casinos",
      breadCrumbUrl: "/casino",
    },
    {
      breadCrumbText: casinoData.title,
      breadCrumbUrl: "", // Empty string for current page
    },
  ];

  // Generate structured data for SEO
  const structuredData = generateStructuredData(casinoData, translations);

  return (
    <>
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Breadcrumbs - Outside hero section to match other pages */}
      <Breadcrumbs items={breadcrumbItems} showHome={false} />

      {/* Hero Section - Consistent with other pages */}
      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="container relative mx-auto px-4 z-10">
          {/* Casino Hero Component */}
          <CasinoHero casino={casinoData} translations={translations} />
        </div>

        {/* Starry Sky Background Effect - Same as other pages */}
        <div className="absolute top-0 left-0 w-full pointer-events-none">
          <div className="h-[80vh] bg-[#0e1a2f]" />
          <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
        </div>
      </section>

      {/* Main Content Section */}
      <CasinoContent
        casino={casinoData}
        games={games}
        translations={translations}
      />
    </>
  );
}

// Generate structured data for better SEO
function generateStructuredData(
  casino: CasinoPageData,
  _translations: Record<string, string>
) {
  const schemas = [];

  // Organization Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "OnlineGamblingService",
    name: casino.title,
    url: casino.casinoGeneralInfo?.website,
    description: casino.introduction,
    image: casino.images?.url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: casino.ratingAvg,
      ratingCount: casino.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
  });

  // FAQ Schema
  if (casino.faqs && casino.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: casino.faqs.map((faq: FAQ) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  // How-To Schema
  if (casino.howTo?.howToGroup && casino.howTo.howToGroup.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: casino.howTo.title,
      description: casino.howTo.description,
      step: casino.howTo.howToGroup.map((step: HowToStep, index: number) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.heading,
        text: step.copy,
      })),
    });
  }

  return schemas;
}
