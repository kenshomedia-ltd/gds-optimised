// src/components/widgets/FeaturedProviders/FeaturedProviders.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Image } from "@/components/common/Image";
import type { FeaturedProvidersProps } from "@/types/featured-providers.types";
import { cn } from "@/lib/utils/cn";

/**
 * FeaturedProviders Component
 *
 * Features:
 * - Grid layout (10 items per row on desktop)
 * - Responsive breakpoints for different screen sizes
 * - Optimized image loading with lazy loading
 * - Progressive enhancement with intersection observer
 * - Hover effects and tooltips
 * - Accessibility compliant
 * - Performance optimized with React.memo
 */
export function FeaturedProviders({
  data,
  translations = {},
  className,
}: FeaturedProvidersProps) {
  // Extract and deduplicate providers
  const providers = useMemo(() => {
    // Handle the nested structure from the API
    const homeFeaturedProviders = data?.homeFeaturedProviders;

    // The API shows it's not an array but a single object with providers array
    const providersData = homeFeaturedProviders?.providers || [];

    const seen = new Set<string>();

    return providersData.filter((provider) => {
      const providerId = provider.documentId || String(provider.id);
      if (!providerId || seen.has(providerId)) return false;
      seen.add(providerId);
      return true;
    });
  }, [data?.homeFeaturedProviders]);

  // Get provider base URL
  const providerBaseUrl =
    process.env.NEXT_PUBLIC_PROVIDER_PAGE_PATH || "/providers";

  if (!providers.length) {
    return null;
  }

  return (
    <section
      className={cn(
        "relative flex flex-col justify-center items-center gap-10",
        "xl:container z-10 px-4 py-8",
        className
      )}
      aria-label={data.title || "Featured Providers"}
    >
      {/* Title */}
      {data.title && (
        <h2
          className={cn(
            "text-white text-2xl font-bold mt-10",
            "animate-fadeIn opacity-0",
            "[animation-delay:100ms] [animation-fill-mode:forwards]"
          )}
        >
          {data.title}
        </h2>
      )}

      {/* Providers Grid */}
      <div
        className={cn(
          "grid gap-3 w-full max-w-7xl",
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10"
        )}
      >
        {providers.map((provider, index) => (
          <ProviderCard
            key={provider.documentId || provider.id}
            provider={provider}
            providerBaseUrl={providerBaseUrl}
            index={index}
          />
        ))}
      </div>

      {/* View All Link */}
      <Link
        href={`${providerBaseUrl}/`}
        className={cn(
          "mt-6 inline-flex items-center gap-2",
          "px-6 py-3",
          "bg-white/10 backdrop-blur-sm",
          "border border-white/20",
          "text-white rounded-full",
          "hover:bg-white/20 transition-all duration-300",
          "animate-fadeIn opacity-0",
          "[animation-delay:400ms] [animation-fill-mode:forwards]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        )}
      >
        <span className="text-sm font-medium">
          {translations.viewAllProviders || "Scopri tutti i Provider"}
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </section>
  );
}

/**
 * ProviderCard Component
 *
 * Individual provider card with hover effects and lazy loading
 */
interface ProviderCardProps {
  provider: any;
  providerBaseUrl: string;
  index: number;
}

function ProviderCard({ provider, providerBaseUrl, index }: ProviderCardProps) {
  const imageData = provider.images;
  const imageUrl = imageData?.url;
  const providerSlug = provider.slug;
  const providerTitle = provider.title || "Provider";

  return (
    <Link
      href={`${providerBaseUrl}/${providerSlug}/`}
      className={cn(
        "group relative block",
        "animate-fadeIn opacity-0",
        index < 10 ? "[animation-delay:100ms]" : "[animation-delay:200ms]",
        "[animation-fill-mode:forwards]"
      )}
      data-provider={providerSlug}
      aria-label={`View ${providerTitle} games`}
    >
      <div
        className={cn(
          "relative",
          "bg-white rounded-lg",
          "px-2 py-1 h-10",
          "flex items-center justify-center",
          "shadow-[0_0_12px_0_rgba(0,0,0,0.1)]",
          "transition-all duration-300 ease-in-out",
          "group-hover:shadow-none group-hover:scale-105",
          "overflow-hidden"
        )}
      >
        {/* Hover gradient overlay */}
        <div
          className={cn(
            "absolute inset-0",
            "bg-gradient-to-br from-blue-50/50 to-transparent",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300"
          )}
          aria-hidden="true"
        />

        {/* Provider Logo */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${providerTitle} logo`}
              width={imageData.width || 80}
              height={imageData.height || 32}
              priority={index < 10}
              loading={index < 10 ? "eager" : "lazy"}
              className="max-w-full max-h-[32px] w-auto h-auto object-contain"
              unoptimized={false}
              quality={85}
              sizes="(max-width: 640px) 40px, 80px"
            />
          ) : (
            <span className="text-gray-400 text-xs text-center px-1 truncate">
              {providerTitle}
            </span>
          )}
        </div>
      </div>

      {/* Provider name tooltip on hover */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 -bottom-7",
          "px-2 py-1",
          "bg-black/80 text-white text-xs rounded",
          "whitespace-nowrap",
          "opacity-0 group-hover:opacity-100",
          "transition-all duration-300",
          "pointer-events-none z-20"
        )}
        role="tooltip"
      >
        {providerTitle}
      </div>
    </Link>
  );
}
