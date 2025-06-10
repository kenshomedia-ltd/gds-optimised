// src/components/casino/CasinoTable/CasinoTable.tsx
"use client";

import { CasinoRow } from "../CasinoRow/CasinoRow";
import type { CasinoData } from "@/types/casino.types";
import { cn } from "@/lib/utils/cn";

interface CasinoTableProps {
  casinos: CasinoData[];
  showCasinoTableHeader?: boolean;
  translations?: Record<string, string>;
  className?: string;
}

/**
 * CasinoTable Component
 *
 * Features:
 * - Responsive table layout
 * - Optional header
 * - Progressive enhancement
 */
export function CasinoTable({
  casinos,
  showCasinoTableHeader = true,
  translations = {},
  className,
}: CasinoTableProps) {
  return (
    <div
      className={cn(
        "table-wrapper bg-casino-table-bkg rounded-[6px] overflow-hidden relative z-[8] mb-5",
        className
      )}
    >
      <table className="w-full mb-2.5 overflow-hidden rounded-[6px] border-spacing-0 border-collapse">
        {showCasinoTableHeader && (
          <thead className="hidden border-x-[12px] border-x-casino-table-header-bkg md:table-row-group">
            <tr className="border-b-[12px] border-casino-table-tr-border">
              <th
                scope="col"
                className="px-3 text-white text-base text-center bg-casino-table-header-bkg font-bold capitalize py-[11px]"
              >
                {translations.casinoTableHeadingCasinos}
              </th>
              <th
                scope="col"
                className="px-3 text-white text-base text-center bg-casino-table-header-bkg font-bold capitalize py-[11px]"
              >
                {translations.casinoTableHeadingRating}
              </th>
              <th
                scope="col"
                className="px-3 text-white text-base text-center bg-casino-table-header-bkg font-bold capitalize py-[11px]"
              >
                {translations.casinoTableHeadingBonus}
              </th>
              <th
                scope="col"
                className="px-3 text-white text-base text-center bg-casino-table-header-bkg font-bold capitalize py-[11px]"
              >
                {translations.withoutDeposit}
              </th>
              <th
                scope="col"
                className="px-3 text-white text-base text-center bg-casino-table-header-bkg font-bold capitalize py-[11px]"
              >
                {translations.casinoTableHeadinRegister}
              </th>
            </tr>
          </thead>
        )}

        <tbody className="text-casino-table-text">
          {casinos.map((casino, index) => (
            <CasinoRow
              key={casino.id}
              casino={casino}
              index={index}
              translations={translations}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
