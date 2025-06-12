// src/app/[...slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getCustomPageData,
  getCustomPageMetadata,
} from "@/lib/strapi/custom-page-loader";
import { DynamicBlock } from "@/components/common/DynamicBlock";
import { IntroWithImage } from "@/components/common/IntroWithImage";
// import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

// Generate static params for known pages
export async function generateStaticParams() {
  // This will be implemented when you want to pre-generate pages
  // For now, return empty array to rely on on-demand generation
  return [];
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
}): Promise<Metadata> {
  // Join the slug array without leading/trailing slashes for the API
  const path = params.slug.join("/");

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

export default async function CatchAllPage({
  params,
}: {
  params: { slug: string[] };
}) {
  // Join the slug array without leading/trailing slashes for the API
  const path = params.slug.join("/");

  console.log("Loading custom page for path:", path);

  try {
    // Get country code from environment or headers
    const casinoCountry = process.env.NEXT_PUBLIC_COUNTRY_CODE;
    const localisation = !!casinoCountry;

    // Fetch page data with split queries for better caching
    const pageData = await getCustomPageData(path, casinoCountry, localisation);

    if (!pageData) {
      console.log("No page data found for path:", path);
      notFound();
    }

    console.log("Page data loaded:", {
      title: pageData.title,
      blocks: pageData.blocks?.length || 0,
      author: pageData.author?.firstName,
    });

    const { blocks = [], breadcrumbs, author, showContentDate } = pageData;

    return (
      <>
        {/* Breadcrumbs */}
        {/* {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            items={breadcrumbs}
            className="container mx-auto px-4 mb-6"
          />
        )} */}

        {/* Page Content */}
        <article className="custom-page">
          {/* Render dynamic blocks */}
          <div className="space-y-8">
            {blocks.map((block, index) => {
              console.log(`Rendering block ${index}:`, block.__component);

              // Handle introduction with image separately for better control
              if (block.__component === "shared.introduction-with-image") {
                return (
                  <IntroWithImage
                    key={`block-${index}`}
                    heading={block.heading || pageData.title}
                    introduction={block.introduction}
                    image={block.image}
                    timeDate={showContentDate ? pageData.updatedAt : undefined}
                    authorData={author}
                    isDateEnabled={showContentDate}
                  />
                );
              }

              return (
                <DynamicBlock
                  key={`block-${index}`}
                  blockType={block.__component}
                  blockData={block}
                  additionalData={{
                    translations: {},
                    country: casinoCountry,
                  }}
                />
              );
            })}
          </div>
        </article>
      </>
    );
  } catch (error) {
    console.error("Error loading page:", error);
    notFound();
  }
}
