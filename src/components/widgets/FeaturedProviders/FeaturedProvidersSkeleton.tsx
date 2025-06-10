// src/components/widgets/FeaturedProviders/FeaturedProvidersSkeleton.tsx

/**
 * FeaturedProvidersSkeleton Component
 *
 * Loading skeleton for FeaturedProviders
 */
export function FeaturedProvidersSkeleton() {
  return (
    <div className="relative flex flex-col justify-center items-center gap-10 xl:container z-10 px-4 py-8">
      <div className="h-8 w-64 bg-gray-700 rounded animate-pulse mt-10" />

      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3 w-full max-w-7xl">
        {Array.from({ length: 20 }).map((_, index) => (
          // Use a container that mimics the final aspect ratio to prevent CLS
          <div key={index} className="flex items-center justify-center">
            <div
              className="bg-white/20 rounded-lg animate-pulse"
              // 1. Set explicit width and height to match the Image component
              style={{ width: "120px", height: "50px" }}
            />
          </div>
        ))}
      </div>

      <div className="h-12 w-48 bg-white/20 rounded-full animate-pulse mt-6" />
    </div>
  );
}
