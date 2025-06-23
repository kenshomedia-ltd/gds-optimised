// src/components/widgets/CasinoList/CasinoList.tsx
"use client";

// import Link from "next/link";
import { CasinoTable } from "@/components/casino/CasinoTable/CasinoTable";
import type { HomeCasinoListBlock, CasinoData } from "@/types/casino.types";
import { cn } from "@/lib/utils/cn";

interface CasinoListProps {
  block: HomeCasinoListBlock;
  casinos: CasinoData[];
  translations?: Record<string, string>;
  className?: string;
}

/**
 * CasinoList Component (homepage.home-casino-list)
 *
 * Features:
 * - Displays casino comparison table
 * - Optional title
 * - View all link
 * - Responsive layout
 */
export function CasinoList({
  block,
  casinos,
  translations = {},
  className,
}: CasinoListProps) {
  // Filter out any null casinos if using custom list
  const validCasinos = casinos.filter(Boolean);

  if (!validCasinos.length) return null;

  return (
    <section className={cn("relative", className)}>
      <div className="relative xl:container px-2 z-20">
        {/* Title */}
        {block.casinoTableTitle && (
          <div className="mb-[30px]">
            <h2 className="text-2xl md:text-3xl font-bold text-heading-text text-center">
              {block.casinoTableTitle}
            </h2>
          </div>
        )}

        {/* Casino Table */}
        <div className="pt-2.5">
          <CasinoTable
            casinos={validCasinos}
            showCasinoTableHeader={block.showCasinoTableHeader !== false}
            translations={translations}
          />
        </div>

        {/* View All Link */}
        {/* {block.link && (
          <div className="flex justify-center">
            <Link
              href={block.link.url}
              className="btn self-center mt-5 btn-secondary min-w-[300px] md:min-w-[500px] inline-flex items-center justify-center"
            >
              {block.link.label}
            </Link>
          </div>
        )} */}
      </div>
    </section>
  );
}
