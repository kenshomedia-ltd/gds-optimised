// src/lib/strapi/test-redirects.ts
/**
 * CLI utility to test redirect configuration
 * Run with: npx tsx src/lib/strapi/test-redirects.ts
 */
import {
  fetchRedirects,
  transformRedirectsForNextJs,
} from "./redirects-loader";
import type { Redirect } from "next/dist/lib/load-custom-routes";

async function testRedirects() {
  console.log("🔄 Testing redirect configuration...\n");

  try {
    // Fetch redirects
    const redirects = await fetchRedirects();
    console.log(`✅ Fetched ${redirects.length} redirects from Strapi\n`);

    // Transform redirects
    const transformed = transformRedirectsForNextJs(redirects);
    console.log(`✅ Transformed ${transformed.length} redirects for Next.js\n`);

    // Show statistics
    const stats = {
      total: transformed.length,
      permanent: transformed.filter((r) => r.permanent).length,
      temporary: transformed.filter((r) => !r.permanent).length,
      external: transformed.filter((r) => r.basePath === false).length,
      internal: transformed.filter((r) => !r.basePath).length,
    };

    console.log("📊 Redirect Statistics:");
    console.log(`   Total: ${stats.total}`);
    console.log(`   Permanent (308): ${stats.permanent}`);
    console.log(`   Temporary (307): ${stats.temporary}`);
    console.log(`   External URLs: ${stats.external}`);
    console.log(`   Internal paths: ${stats.internal}\n`);

    // Show sample redirects
    console.log("📋 Sample redirects (first 10):");
    transformed.slice(0, 10).forEach((redirect, index) => {
      const type = redirect.permanent ? "permanent" : "temporary";
      const isExternal = redirect.basePath === false ? " (external)" : "";
      console.log(
        `   ${index + 1}. ${redirect.source} → ${
          redirect.destination
        } [${type}]${isExternal}`
      );
    });

    // Check for potential issues
    console.log("\n⚠️  Checking for potential issues:");
    const duplicateSources = findDuplicates(transformed.map((r) => r.source));
    if (duplicateSources.length > 0) {
      console.log(
        `   Found ${duplicateSources.length} duplicate source paths:`
      );
      duplicateSources.forEach((dup) => console.log(`     - ${dup}`));
    } else {
      console.log("   ✅ No duplicate source paths found");
    }

    // Check for redirect loops
    const loops = findRedirectLoops(transformed);
    if (loops.length > 0) {
      console.log(`   Found ${loops.length} potential redirect loops:`);
      loops.forEach((loop) => console.log(`     - ${loop}`));
    } else {
      console.log("   ✅ No redirect loops detected");
    }
  } catch (error) {
    console.error("❌ Error testing redirects:", error);
    process.exit(1);
  }
}

function findDuplicates(arr: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  arr.forEach((item) => {
    if (seen.has(item)) {
      duplicates.add(item);
    }
    seen.add(item);
  });

  return Array.from(duplicates);
}

function findRedirectLoops(redirects: Redirect[]): string[] {
  const loops: string[] = [];
  const redirectMap = new Map(redirects.map((r) => [r.source, r.destination]));

  redirects.forEach((redirect) => {
    // Check if destination redirects back to source
    const destRedirect = redirectMap.get(redirect.destination);
    if (destRedirect === redirect.source) {
      loops.push(`${redirect.source} ↔ ${redirect.destination}`);
    }
  });

  return loops;
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRedirects().then(() => {
    console.log("\n✅ Redirect test completed successfully!");
    process.exit(0);
  });
}
