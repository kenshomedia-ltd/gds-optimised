// src/app/page.tsx
import { getHomepageDataSplit } from "@/lib/strapi/homepage-query-splitter";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { DynamicBlock } from "@/components/common/DynamicBlock";
import { BreadcrumbsWithLayout } from "@/components/layout/Breadcrumbs";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import type { Metadata } from "next";
import type { BreadcrumbItem } from "@/types/breadcrumbs.types";
// Force dynamic rendering for ISR with on-demand revalidation
export const dynamic = "force-static";
export const revalidate = 60; // 1 minute for edge cache

// Generate metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const [layoutData, homepageData] = await Promise.all([
    getLayoutData({ cached: true }),
    getHomepageDataSplit(),
  ]);

  const { translations } = layoutData;
  const { homepage } = homepageData;

  return generateSEOMetadata({
    title: homepage.seo?.metaTitle || translations?.homePageTitle || "Home",
    description:
      homepage.seo?.metaDescription || translations?.homePageDescription || "",
    keywords: homepage.seo?.keywords,
    canonicalUrl: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

// Hero block types configuration
const HERO_BLOCK_TYPES = [
  "shared.introduction-with-image",
  "homepage.home-game-list",
  "homepage.home-featured-providers",
  "shared.overview-block",
];

export default async function HomePage() {
  // Performance timing
  const startTime = Date.now();

  // Parallel data fetching with split queries
  const [layoutData, homepageData] = await Promise.all([
    getLayoutData({ cached: true }),
    getHomepageDataSplit(),
  ]);

  const { homepage, games, blogs, casinos } = homepageData;
  const { layout, translations } = layoutData;

  // Additional data for blocks
  const additionalData = {
    games,
    blogs,
    casinos,
    translations,
  };

  // Separate blocks by section
  const blocks = homepage?.blocks || [];
  const heroBlocks = blocks.filter(
    (block, index) => index < 4 && HERO_BLOCK_TYPES.includes(block.__component)
  );
  const mainBlocks = blocks.filter(
    (block, index) =>
      !(index < 4 && HERO_BLOCK_TYPES.includes(block.__component))
  );

  // Log performance in development
  if (process.env.NODE_ENV === "development") {
    console.log(`Homepage data fetching took: ${Date.now() - startTime}ms`);
  }

  // Schema.org structured data
  const homepageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: process.env.NEXT_PUBLIC_SITE_NAME,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    description:
      homepage.seo?.metaDescription || translations?.homePageDescription || "",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Get all layout breadcrumb collections
  const layoutBreadcrumbs: Record<string, BreadcrumbItem[]> = {};
  Object.keys(layout).forEach((key) => {
    if (key.endsWith("Breadcrumbs") && Array.isArray(layout[key])) {
      layoutBreadcrumbs[key] = layout[key];
    }
  });

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />

      {/* Breadcrumbs for homepage */}
      <BreadcrumbsWithLayout
        items={[]}
        breadcrumbKey="homeBreadcrumbs"
        layoutBreadcrumbs={layoutBreadcrumbs}
        showHome={false} // Don't show home on homepage
      />

      {/* Hero Section with Featured Blocks */}
      {heroBlocks.length > 0 && (
        <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
          <div className="container relative mx-auto px-4 z-10">
            {heroBlocks.map((block, index) => (
              <div key={`hero-${block.__component}-${index}`} className="mb-8">
                <DynamicBlock
                  blockType={block.__component}
                  blockData={block}
                  additionalData={additionalData}
                />
              </div>
            ))}
          </div>

          {/* Starry Sky Background Effect */}
          <div className="absolute top-0 left-0 w-full pointer-events-none">
            <div className="h-[80vh] bg-[#0e1a2f]" />
            <div className="h-[300px] bg-[#0e1a2f] rounded-b-[50%_300px]" />
          </div>
        </section>
      )}

      {/* Main Content Section with Progressive Loading */}
      <section className="main container mx-auto px-4 py-8">
        <div className="space-y-12">
          {mainBlocks.map((block, index) => (
            <section
              key={`main-${block.__component}-${index}`}
              className="opacity-0 animate-[fadeIn_0.6s_ease-out_100ms_forwards]"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <DynamicBlock
                blockType={block.__component}
                blockData={block}
                additionalData={additionalData}
              />
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
