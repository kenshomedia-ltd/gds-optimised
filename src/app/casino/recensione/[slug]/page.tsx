// src/app/casino/recensione/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getCasinoPageData,
  getCasinoMetadata,
} from "@/lib/strapi/casino-data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 60; // 1 minute for edge cache

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Await params as required in Next.js 15
  const { slug } = await params;

  try {
    // Use lightweight metadata query for better performance
    const casinoMetadata = await getCasinoMetadata(slug);

    if (!casinoMetadata) {
      return {
        title: "Casino Not Found",
        description: "The requested casino could not be found.",
      };
    }

    return generateSEOMetadata({
      title: casinoMetadata.seo?.metaTitle || `${casinoMetadata.title} Review`,
      description:
        casinoMetadata.seo?.metaDescription ||
        casinoMetadata.introduction ||
        `Read our comprehensive review of ${casinoMetadata.title}`,
      keywords: casinoMetadata.seo?.keywords,
      canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/casino/recensione/${slug}`,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Casino Not Found",
      description: "The requested casino could not be found.",
    };
  }
}

export default async function CasinoReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Await params as required in Next.js 15
  const { slug } = await params;

  // Performance timing
  const startTime = Date.now();

  // Fetch casino data using the split query approach with proper data loader
  const { casinoData, relatedProviders, comparisonCasinos } =
    await getCasinoPageData(slug, { cached: true });

  // Log the fetched data to console as requested
  console.log("=== CASINO PAGE DATA (SPLIT QUERIES) ===");
  console.log("Slug:", slug);
  console.log("Fetch time:", Date.now() - startTime, "ms");
  console.log("\n--- Casino Data ---");
  console.log(JSON.stringify(casinoData, null, 2));
  console.log("\n--- Related Providers ---");
  console.log(JSON.stringify(relatedProviders, null, 2));
  console.log("\n--- Comparison Casinos ---");
  console.log(JSON.stringify(comparisonCasinos, null, 2));
  console.log("=====================================\n");

  // Log performance in development
  if (process.env.NODE_ENV === "development") {
    console.log(`Casino page data fetching took: ${Date.now() - startTime}ms`);
  }

  // Handle not found
  if (!casinoData) {
    notFound();
  }

  // For now, just render a simple page with the data
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">
        {casinoData.heading || casinoData.title}
      </h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
        <p className="text-sm text-gray-600">
          This is a dummy page that logs casino data to the console.
        </p>
        <p className="text-sm text-gray-600">
          Check your browser console or terminal for the full data structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>Title:</strong> {casinoData.title}
            </li>
            <li>
              <strong>Slug:</strong> {casinoData.slug}
            </li>
            <li>
              <strong>Rating:</strong> {casinoData.ratingAvg}/5 (
              {casinoData.ratingCount} reviews)
            </li>
            <li>
              <strong>Author Ratings:</strong>{" "}
              {casinoData.authorRatings || "N/A"}
            </li>
            <li>
              <strong>Playthrough:</strong> {casinoData.playthrough || "N/A"}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Content Sections</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>Introduction:</strong>{" "}
              {casinoData.introduction ? "✓" : "✗"}
            </li>
            <li>
              <strong>Content 1:</strong> {casinoData.content1 ? "✓" : "✗"}
            </li>
            <li>
              <strong>Content 2:</strong> {casinoData.content2 ? "✓" : "✗"}
            </li>
            <li>
              <strong>Content 3:</strong> {casinoData.content3 ? "✓" : "✗"}
            </li>
            <li>
              <strong>Content 4:</strong> {casinoData.content4 ? "✓" : "✗"}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Features & Sections</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>Casino Features:</strong>{" "}
              {casinoData.casinoFeatures?.length || 0} items
            </li>
            <li>
              <strong>How To:</strong> {casinoData.howTo ? "✓" : "✗"}
            </li>
            <li>
              <strong>Pros/Cons:</strong> {casinoData.proscons ? "✓" : "✗"}
            </li>
            <li>
              <strong>FAQs:</strong> {casinoData.faqs?.length || 0} items
            </li>
            <li>
              <strong>Testimonial:</strong> {casinoData.testimonial ? "✓" : "✗"}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Bonuses</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>Bonus Section:</strong>{" "}
              {casinoData.bonusSection ? "✓" : "✗"}
            </li>
            <li>
              <strong>No Deposit:</strong>{" "}
              {casinoData.noDepositSection ? "✓" : "✗"}
            </li>
            <li>
              <strong>Free Spins:</strong>{" "}
              {casinoData.freeSpinsSection ? "✓" : "✗"}
            </li>
            <li>
              <strong>Casino Bonus:</strong>{" "}
              {casinoData.casinoBonus ? "✓" : "✗"}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Additional Data</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>Author:</strong>{" "}
              {casinoData.author
                ? `${casinoData.author.firstName} ${casinoData.author.lastName}`
                : "N/A"}
            </li>
            <li>
              <strong>Providers:</strong> {relatedProviders.length} providers
            </li>
            <li>
              <strong>Comparison Casinos:</strong> {comparisonCasinos.length}{" "}
              casinos
            </li>
            <li>
              <strong>Payment Channels:</strong>{" "}
              {casinoData.paymentChannels?.length || 0} channels
            </li>
            <li>
              <strong>Blocks:</strong> {casinoData.blocks?.length || 0} blocks
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">SEO & Meta</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>Meta Title:</strong>{" "}
              {casinoData.seo?.metaTitle || "Not set"}
            </li>
            <li>
              <strong>Meta Description:</strong>{" "}
              {casinoData.seo?.metaDescription
                ? "✓ " + casinoData.seo.metaDescription.substring(0, 50) + "..."
                : "Not set"}
            </li>
            <li>
              <strong>Keywords:</strong> {casinoData.seo?.keywords || "Not set"}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a dummy implementation that displays
          the casino data structure. Replace this with actual casino review
          components following the project&apos;s component patterns.
        </p>
      </div>
    </div>
  );
}
