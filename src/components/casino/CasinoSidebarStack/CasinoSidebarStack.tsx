// src/components/casino/CasinoSidebarStack/CasinoSidebarStack.tsx

import { CasinoSidebarItem } from "../CasinoSidebarItem/CasinoSidebarItem";
import type { CasinoSidebarStackProps } from "@/types/sidebar.types";

/**
 * CasinoSidebarStack Component
 * A single stack/section of casinos in the sidebar
 */
export function CasinoSidebarStack({
  title,
  casinos,
  bonusType,
  translations = {},
}: CasinoSidebarStackProps) {
  if (!casinos || casinos.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
      {/* Stack Header */}
      <div className="bg-table-header-bkg text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-bold capitalize">{title}</h3>
      </div>

      {/* Casino Items */}
      <div className="p-4 space-y-4">
        {casinos.map((casino) => (
          <CasinoSidebarItem
            key={casino.id}
            casino={casino}
            bonusType={bonusType}
            translations={translations}
          />
        ))}
      </div>
    </div>
  );
}
