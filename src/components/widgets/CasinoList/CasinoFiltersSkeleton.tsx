// src/components/widgets/CasinoList/CasinoFiltersSkeleton.tsx

import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface CasinoFiltersSkeletonProps {
  className?: string;
}

/**
 * CasinoFiltersSkeleton Component
 *
 * Loading skeleton for the CasinoFilters component
 */
export function CasinoFiltersSkeleton({
  className,
}: CasinoFiltersSkeletonProps) {
  return (
    <div className={cn("relative mx-auto", className)}>
      <section className="p-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {/* Bonus Type Skeleton */}
          <Skeleton className="w-full md:w-52 h-11" />

          {/* Condition Skeleton */}
          <Skeleton className="w-full md:w-52 h-11" />

          {/* Amount Skeleton */}
          <Skeleton className="w-full md:w-52 h-11" />

          {/* Wagering Skeleton */}
          <Skeleton className="w-full md:w-52 h-11" />

          {/* Immediate Toggle Skeleton */}
          <div className="flex items-center gap-2 ml-0 md:ml-4">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-4 h-4 rounded" />
          </div>

          {/* Sort Skeleton */}
          <Skeleton className="w-full md:w-60 h-11 ml-auto" />
        </div>
      </section>
    </div>
  );
}
