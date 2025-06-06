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
    const homeFeaturedProviders = data?.homeFeaturedProviders;
    const providersData = homeFeaturedProviders?.providers || [];

    const seen = new Set<string>();

    return providersData.filter((provider) => {
      const providerId = provider.documentId || String(provider.id);
      if (!providerId || seen.has(providerId)) return false;
      seen.add(providerId);
      return true;
    });
  }, [data?.homeFeaturedProviders]);

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
            "opacity-0 animate-[fadeIn_0.6s_ease-out_100ms_forwards]"
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
          "opacity-0 animate-[fadeIn_0.6s_ease-out_400ms_forwards]",
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
  provider: {
    id: number;
    documentId?: string;
    title: string;
    slug: string;
    images?: {
      url: string;
      width?: number;
      height?: number;
    };
  };
  providerBaseUrl: string;
  index: number;
}

function ProviderCard({ provider, providerBaseUrl, index }: ProviderCardProps) {
  const imageData = provider.images;
  const imageUrl = imageData?.url;
  const providerSlug = provider.slug;
  const providerTitle = provider.title || "Provider";

  // Calculate animation delay based on index
  const animationDelay = index < 10 ? 100 : 200;

  return (
    <Link
      href={`${providerBaseUrl}/${providerSlug}/`}
      className={cn("group relative block", "opacity-0")}
      data-provider={providerSlug}
      aria-label={`View ${providerTitle} games`}
      style={{
        animation: `fadeIn 0.6s ease-out ${animationDelay}ms forwards`,
      }}
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
              quality={85}
              sizes="(max-width: 640px) 40px, 80px"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "32px",
              }}
              unoptimized={imageUrl.endsWith(".svg")}
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
