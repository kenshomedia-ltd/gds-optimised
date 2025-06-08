// src/lib/utils/seo.ts
import { Metadata } from "next";
interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}



// Define interfaces for the data structure of each JSON-LD type
interface JsonLdWebSiteData {
  name?: string;
}

interface JsonLdArticleData {
  title: string;
  description: string;
  image: string;
  authorName: string;
  publishedTime: string;
  modifiedTime?: string;
}

interface JsonLdGameData {
  title: string;
  description: string;
  image: string;
  ratingAvg?: number;
  ratingCount?: number;
  provider?: string;
}

interface JsonLdCasinoData {
  title: string;
  description: string;
  image: string;
  ratingAvg?: number;
  ratingCount?: number;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface JsonLdFaqPageData {
  faqs?: FaqItem[];
}

// Create a discriminated union for the config object
type JsonLdConfig =
  | { type: "WebSite"; data: JsonLdWebSiteData }
  | { type: "Article"; data: JsonLdArticleData }
  | { type: "Game"; data: JsonLdGameData }
  | { type: "Casino"; data: JsonLdCasinoData }
  | { type: "FAQPage"; data: JsonLdFaqPageData };

interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

/**
 * Generate metadata object for Next.js pages
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Casino Games";

  const {
    title = siteName,
    description = "Play the best casino games and read expert reviews",
    image,
    keywords,
    canonicalUrl,
    // type = "website",
    author,
    // publishedTime,
    // modifiedTime,
    // section,
    tags,
  } = config;

  // Build Open Graph images array
  // const ogImages = image
  //   ? [
  //       {
  //         url: image.startsWith("http") ? image : `${siteUrl}${image}`,
  //         width: 1200,
  //         height: 630,
  //         alt: title,
  //       },
  //     ]
  //   : [];

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords || tags?.join(", "),
    authors: author ? [{ name: author }] : undefined,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl || undefined,
    },
    // openGraph: {
    //   title,
    //   description,
    //   url: canonicalUrl || siteUrl,
    //   siteName,
    //   type: type as string,
    //   images: ogImages,
    //   locale: "en_US",
    //   ...(type === "article" && {
    //     publishedTime,
    //     modifiedTime,
    //     authors: author ? [author] : undefined,
    //     section,
    //     tags,
    //   }),
    // },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
      creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
      site: process.env.NEXT_PUBLIC_TWITTER_SITE,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
  };

  return metadata;
}

/**
 * Generate JSON-LD structured data
 */
export function generateJsonLd(config: JsonLdConfig): string {
  const { type, data } = config;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  let jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
  };

  switch (type) {
    case "WebSite":
      jsonLd = {
        ...jsonLd,
        "@type": "WebSite",
        name: data.name || process.env.NEXT_PUBLIC_SITE_NAME,
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      };
      break;

    case "Article":
      jsonLd = {
        ...jsonLd,
        "@type": "Article",
        headline: data.title,
        description: data.description,
        image: data.image,
        author: {
          "@type": "Person",
          name: data.authorName,
        },
        publisher: {
          "@type": "Organization",
          name: process.env.NEXT_PUBLIC_SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/logo.png`,
          },
        },
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime || data.publishedTime,
      };
      break;

    case "Game":
      jsonLd = {
        ...jsonLd,
        "@type": "VideoGame",
        name: data.title,
        description: data.description,
        image: data.image,
        aggregateRating: data.ratingAvg
          ? {
              "@type": "AggregateRating",
              ratingValue: data.ratingAvg,
              ratingCount: data.ratingCount || 0,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
        provider: data.provider
          ? {
              "@type": "Organization",
              name: data.provider,
            }
          : undefined,
      };
      break;

    case "Casino":
      jsonLd = {
        ...jsonLd,
        "@type": "Casino",
        name: data.title,
        description: data.description,
        image: data.image,
        aggregateRating: data.ratingAvg
          ? {
              "@type": "AggregateRating",
              ratingValue: data.ratingAvg,
              ratingCount: data.ratingCount || 0,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
      };
      break;

    // case "FAQPage":
    //   jsonLd = {
    //     ...jsonLd,
    //     "@type": "FAQPage",
    //     mainEntity: data.faqs?.map((faq: any) => ({
    //       "@type": "Question",
    //       name: faq.question,
    //       acceptedAnswer: {
    //         "@type": "Answer",
    //         text: faq.answer,
    //       },
    //     })),
    //   };
    //   break;
  }

  return JSON.stringify(jsonLd);
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };

  return JSON.stringify(jsonLd);
}

/**
 * Clean and truncate description for meta tags
 */
export function cleanDescription(
  text: string | undefined,
  maxLength: number = 160
): string {
  if (!text) return "";

  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, "");

  // Remove extra whitespace
  const normalizedText = cleanText.replace(/\s+/g, " ").trim();

  // Truncate if necessary
  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  // Truncate at word boundary
  const truncated = normalizedText.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + "..."
    : truncated + "...";
}
