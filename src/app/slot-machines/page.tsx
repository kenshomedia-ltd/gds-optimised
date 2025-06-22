// src/app/slot-machine/page.tsx

import CustomPage from "@/app/[...slug]/page";
import { generateMetadata as customPageGenerateMetadata } from "@/app/[...slug]/page";

// Re-export the catch-all page component for the root slot-machine page
export default function SlotMachinePage() {
  // Pass the correct params structure that the catch-all page expects
  return CustomPage({
    params: Promise.resolve({ slug: ["slot-machine"] }),
  });
}

// Re-export metadata generation
export async function generateMetadata() {
  return customPageGenerateMetadata({
    params: Promise.resolve({ slug: ["slot-machine"] }),
  });
}

// Use the same revalidation settings
export const dynamic = "force-static";
export const revalidate = 60;
