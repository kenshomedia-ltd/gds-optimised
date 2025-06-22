// src/app/slot-machines/nuove/page.tsx

import CustomPage from "@/app/[...slug]/page";
import { generateMetadata as customPageGenerateMetadata } from "@/app/[...slug]/page";
import type { Metadata } from "next";

// Generate metadata with the correct slug
export async function generateMetadata(): Promise<Metadata> {
  return customPageGenerateMetadata({
    params: Promise.resolve({ slug: ["slot-machines", "nuove"] }),
  });
}

// Default export that passes the correct params
export default async function SlotMachineNuovePage() {
  return CustomPage({
    params: Promise.resolve({ slug: ["slot-machines", "nuove"] }),
  });
}

// Use the same revalidation settings
export const dynamic = "force-static";
export const revalidate = 60;
