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

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Hero Section */}
      <CasinoHero casino={casinoData} translations={translations} />

      {/* Main Content */}
      <CasinoContent
        casino={casinoData}
        games={games}
        translations={translations}
      />

      {/* Mobile Sticky Footer - will be implemented later */}
      {/* <CasinoMobileFooter casino={casinoData} translations={translations} /> */}
    </>
  );
}

// Generate structured data for the review
function generateStructuredData(
  casino: CasinoPageData,
  translations: Record<string, string>
): object[] {
  const schemas: object[] = [];

  // Review Schema
  const reviewSchema = {
    "@context": "https://schema.org/",
    "@type": "Review",
    mainEntityOfPage: {
      "@type": "WebPage",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/casino/recensione/${casino.slug}`,
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/casino/recensione/${casino.slug}`,
    },
    datePublished: casino.createdAt,
    dateModified: casino.updatedAt,
    description: casino.introduction?.replace(/(<([^>]+)>)/gi, "") || "",
    itemReviewed: {
      "@type": "Organization",
      image: casino.images?.url,
      name: casino.title,
      makesOffer: casino.casinoBonus
        ? [
            {
              "@type": "Offer",
              "@id": process.env.NEXT_PUBLIC_SITE_URL,
              name: casino.casinoBonus.bonusLabel,
              description: `${
                translations.reviewAndBonus || "Review and Bonus"
              } ${casino.title}`,
              url: casino.casinoBonus.bonusUrl,
            },
          ]
        : undefined,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: casino.authorRatings || casino.ratingAvg,
      bestRating: "5",
      worstRating: "0",
    },
    name: `${translations.reviewAndBonus || "Review and Bonus"} ${
      casino.title
    }`,
    author: casino.author
      ? {
          "@type": "Person",
          name: `${casino.author.firstName} ${casino.author.lastName}`,
          url: `${
            process.env.NEXT_PUBLIC_SITE_URL
          }/author/${casino.author.firstName.toLowerCase()}.${casino.author.lastName.toLowerCase()}`,
        }
      : undefined,
    ...(casino.proscons && {
      positiveNotes: {
        "@type": "ItemList",
        itemListElement: casino.proscons.pros.map((pro: string, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          name: pro,
        })),
      },
      negativeNotes: {
        "@type": "ItemList",
        itemListElement: casino.proscons.cons.map((con: string, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          name: con,
        })),
      },
    }),
    ...(casino.testimonial && {
      contributor: {
        "@type": "Person",
        name: `${casino.testimonial.approvedBy?.firstName} ${casino.testimonial.approvedBy?.lastName}`,
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL
        }/author/${casino.testimonial.approvedBy?.firstName.toLowerCase()}.${casino.testimonial.approvedBy?.lastName.toLowerCase()}`,
        sameAs: [casino.testimonial.approvedBy?.jobTitle].filter(Boolean),
        worksFor: {
          "@type": "Organization",
          "@id": process.env.NEXT_PUBLIC_SITE_URL,
        },
      },
      reviewBody: casino.testimonial.testimonial,
    }),
    publisher: {
      "@type": "Organization",
      name: process.env.NEXT_PUBLIC_SITE_NAME,
      url: process.env.NEXT_PUBLIC_SITE_URL,
      logo: casino.images?.url,
    },
  };

  schemas.push(reviewSchema);

  // Add FAQ schema if FAQs exist

  if (casino.faqs && casino.faqs.length > 0) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntityOfPage: {
        "@type": "WebPage",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/casino/recensione/${casino.slug}`,
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/casino/recensione/${casino.slug}`,
      },
      mainEntity: casino.faqs.map((faq: FAQ) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
    schemas.push(faqSchema);
  }

  // Add HowTo schema if exists
  if (casino.howTo) {
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      mainEntityOfPage: {
        "@type": "WebPage",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/casino/recensione/${casino.slug}`,
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/casino/recensione/${casino.slug}`,
      },
      name: casino.howTo.title,
      totalTime: "PT15M",
      description: casino.howTo.title,
      tool: [
        {
          "@type": "HowToTool",
          name: "smartphone, PC, tablet, payment method",
        },
      ],
      step: casino.howTo.howToGroup.map((step: HowToStep, i: number) => ({
        "@type": "HowToStep",
        url: `${casino.slug}#step0${i + 1}`,
        name: step.heading,
        itemListElement: {
          "@type": "HowToDirection",
          text: step.copy,
        },
        ...(step.image && {
          image: {
            "@type": "ImageObject",
            url: step.image.url,
          },
        }),
      })),
    };
    schemas.push(howToSchema);
  }

  return schemas;
}
