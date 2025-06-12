// src/app/[...slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getCustomPageMetadata,
  getCustomPageDataSplit,
} from "@/lib/strapi/custom-page-split-query";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { DynamicBlock } from "@/components/common/DynamicBlock";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 60; // 1 minute for edge cache

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

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  // Performance timing
  const startTime = Date.now();

  // Await params before using
  const { slug } = await params;

  // Join the slug array without leading/trailing slashes for the API
  const path = slug.join("/");

  console.log("Loading custom page for path:", path);

  try {
    // Get country code from environment or headers
    const casinoCountry = process.env.NEXT_PUBLIC_COUNTRY_CODE;
    const localisation = !!casinoCountry;

    // Parallel data fetching with split queries
    const [layoutData, customPageResponse] = await Promise.all([
      getLayoutData({ cached: true }),
      getCustomPageDataSplit(path, casinoCountry, localisation),
    ]);

    const { pageData, games, casinos } = customPageResponse;
    const { translations } = layoutData;

    if (!pageData) {
      console.log("No page data found for path:", path);
      notFound();
    }

    // Log performance in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Custom page data fetching took: ${Date.now() - startTime}ms`
      );
      console.log("Page data loaded:", {
        title: pageData.title,
        blocks: pageData.blocks?.length || 0,
        games: games.length,
        casinos: casinos.length,
      });
    }

    const { blocks = [], breadcrumbs, author, showContentDate } = pageData;

    // Additional data for blocks (similar to homepage)
    const additionalData = {
      games,
      casinos,
      translations,
      country: casinoCountry,
      localisation,
    };

    // Schema.org structured data
    const pageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: pageData.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${path}`,
      description: pageData.seo?.metaDescription || "",
      ...(author && {
        author: {
          "@type": "Person",
          name: `${author.firstName} ${author.lastName}`,
          jobTitle: author.jobTitle,
        },
      }),
      ...(showContentDate && {
        dateModified: pageData.updatedAt,
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
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-4">
            <ol className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  {crumb.breadCrumbUrl ? (
                    <a
                      href={crumb.breadCrumbUrl}
                      className="text-primary hover:underline"
                    >
                      {crumb.breadCrumbText}
                    </a>
                  ) : (
                    <span className="text-gray-600">
                      {crumb.breadCrumbText}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Page Content */}
        <article className="custom-page">
          <div className="space-y-8">
            {blocks.map((block, index) => (
              <section
                key={`block-${block.__component}-${index}`}
                className="block-section opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
                style={{
                  animationDelay: `${Math.min(index * 50, 300)}ms`,
                }}
                data-block-type={block.__component}
                data-block-index={index}
              >
                <DynamicBlock
                  blockType={block.__component}
                  blockData={block}
                  additionalData={additionalData}
                />
              </section>
            ))}
          </div>
        </article>
      </>
    );
  } catch (error) {
    console.error("Error loading page:", error);
    notFound();
  }
}
