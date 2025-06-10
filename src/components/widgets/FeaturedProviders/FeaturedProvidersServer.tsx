// src/components/widgets/FeaturedProviders/FeaturedProvidersServer.tsx

import Link from "next/link";
import { Image } from "@/components/common/Image";
import type { FeaturedProvidersProps } from "@/types/featured-providers.types";
import { cn } from "@/lib/utils/cn";

export function FeaturedProvidersServer({
  data,
  translations = {},
  className,
}: FeaturedProvidersProps) {
  const providersData = data?.homeFeaturedProviders?.providers || [];
  const seen = new Set<string>();

  const providers = providersData.filter((provider) => {
    const providerId = provider.documentId || String(provider.id);
    if (!providerId || seen.has(providerId)) return false;
    seen.add(providerId);
    return true;
  });

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
      {data.title && (
        <h2 className="text-white text-2xl font-bold mt-10">{data.title}</h2>
      )}

      <div
        className={cn(
          "grid gap-3 w-full max-w-7xl",
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10"
        )}
      >
        {providers.map((provider, index) => {
          const imageData = provider.images;
          const imageUrl = imageData?.url;
          const providerSlug = provider.slug;
          const providerTitle = provider.title || "Provider";

          return (
            <Link
              key={provider.documentId || provider.id}
              href={`${providerBaseUrl}/${providerSlug}/`}
              className="group relative block"
              data-provider={providerSlug}
              aria-label={`View ${providerTitle} games`}
            >
              {/* 1. Container updated to only handle layout */}
              <div
                className={cn(
                  "relative flex items-center justify-center",
                  "shadow-[0_0_12px_0_rgba(0,0,0,0.1)]",
                  "transition-all duration-300 ease-in-out",
                  "group-hover:shadow-none group-hover:scale-105",
                  "overflow-hidden"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0",
                    "bg-gradient-to-br from-blue-50/50 to-transparent",
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-300"
                  )}
                  aria-hidden="true"
                />
                <div className="relative z-10 flex items-center justify-center">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`${providerTitle} logo`}
                      width={120} // Matched from client component
                      height={50} // Matched from client component
                      priority={index < 10}
                      loading={index < 10 ? "eager" : "lazy"}
                      // 2. Styles applied directly to Image component
                      className="bg-white rounded-lg object-contain max-h-[50px] overflow-hidden"
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
        })}
      </div>
      <Link
        href={`${providerBaseUrl}/`}
        className={cn(
          "mt-6 inline-flex items-center gap-2",
          "px-6 py-3",
          "bg-white/10 backdrop-blur-sm",
          "border border-white/20",
          "text-white rounded-full",
          "hover:bg-white/20 transition-all duration-300",
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
