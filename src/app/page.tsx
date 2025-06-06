// src/app/page.tsx
import { getHomepageData } from "@/lib/strapi/homepage-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";

// Force dynamic rendering for ISR with on-demand revalidation
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

/**
 * Homepage component with data logging
 */
export default async function HomePage() {
  // Parallel data fetching
  const [layoutData, homepageData] = await Promise.all([
    getLayoutData({ cached: true }),
    getHomepageData({ cached: true }),
  ]);

  // Console log all the data
  console.log("=== LAYOUT DATA ===");
  console.log(JSON.stringify(layoutData, null, 2));

  console.log("\n=== HOMEPAGE DATA ===");
  console.log("Homepage Title:", homepageData.homepage.title);
  console.log("Homepage Blocks Count:", homepageData.homepage.blocks.length);
  console.log(
    "Homepage Blocks Types:",
    homepageData.homepage.blocks.map((b) => b.__component)
  );

  console.log("\n=== GAMES DATA ===");
  console.log("Total Games:", homepageData.games.length);
  console.log(
    "Game Titles:",
    homepageData.games.map((g) => g.title)
  );

  console.log("\n=== BLOGS DATA ===");
  console.log("Total Blogs:", homepageData.blogs.length);
  console.log(
    "Blog Titles:",
    homepageData.blogs.map((b) => b.title)
  );

  console.log("\n=== CASINOS DATA ===");
  console.log("Total Casinos:", homepageData.casinos?.length || 0);
  console.log(
    "Casino Titles:",
    homepageData.casinos?.map((c) => c.title) || []
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-heading-text mb-4">
        Homepage Data Loaded Successfully
      </h1>
      <p className="text-lg text-body-text">
        Check the console for all the loaded data.
      </p>
    </main>
  );
}
