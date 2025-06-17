// src/components/widgets/HowTo/HowToSkeleton.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export function HowToSkeleton() {
  return (
    <section className="py-6 md:py-8 lg:py-12">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="text-center mb-6 md:mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-3" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Mobile Skeleton */}
        <div className="md:hidden">
          <div className="bg-gray-50 rounded-2xl p-2">
            <Skeleton className="w-[235px] h-[235px] rounded-2xl mx-auto mb-4" />
            <div className="flex items-start gap-3 mb-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-6 flex-1 mt-2" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden md:flex md:flex-col gap-6 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl p-2 flex gap-5 lg:gap-6"
            >
              <Skeleton className="w-[235px] h-[235px] rounded-2xl flex-shrink-0" />
              <div className="flex-1 pt-0">
                <div className="flex items-start gap-3 mb-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-6 flex-1 mt-2" />
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
