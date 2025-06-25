// src/components/widgets/RelatedCasinos/RelatedCasinosServer.tsx

import { CasinoTable } from "@/components/casino";
import { getRelatedCasinos } from "@/lib/strapi/related-casinos-loader";
import type { RelatedCasinosProps } from "@/types/related-casinos.types";

/**
 * Server component for Related Casinos widget
 * Fetches casinos related to a game provider
 *
 * This is a server component that runs on the server only
 */
export async function RelatedCasinosServer({
  provider,
  translations = {},
  className,
  maxCasinos = 5,
  showTitle = true,
}: RelatedCasinosProps) {
  // If no provider, return null
  if (!provider?.slug) {
    return null;
  }

  // Fetch related casinos
  const casinos = await getRelatedCasinos(provider.slug, maxCasinos);

  // If no casinos found, return null
  if (!casinos || casinos.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      {showTitle && (
        <h2 className="text-2xl md:text-3xl font-bold text-heading-text text-left mb-6">
          {translations.relatedCasinosTitle ||
            `Best Casinos with ${provider.title} Games`}
        </h2>
      )}

      <CasinoTable
        casinos={casinos}
        showCasinoTableHeader={true}
        translations={translations}
      />
    </section>
  );
}

// Default export for easier dynamic imports if needed
export default RelatedCasinosServer;
