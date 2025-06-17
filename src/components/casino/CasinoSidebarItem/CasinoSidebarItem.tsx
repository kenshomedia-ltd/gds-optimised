// src/components/casino/CasinoSidebarItem/CasinoSidebarItem.tsx

import Link from "next/link";
import { Image } from "@/components/common/Image";
import type { CasinoSidebarItemProps } from "@/types/sidebar.types";
import { formatWelcomeBonus, formatNoDepositBonus } from "@/lib/utils/casino";

/**
 * CasinoSidebarItem Component
 * Individual casino item for sidebar display
 */
export function CasinoSidebarItem({
  casino,
  bonusType,
  translations = {},
}: CasinoSidebarItemProps) {
  // Get appropriate bonus text based on type
  const getBonusText = () => {
    switch (bonusType) {
      case "noDeposit":
        const noDepositBonus = formatNoDepositBonus(casino, translations);
        return noDepositBonus.bonus || "-";
      case "freeSpins":
        if (casino.freeSpinsSection?.bonusAmount) {
          return `${casino.freeSpinsSection.bonusAmount}`;
        }
        return "-";
      default:
        return formatWelcomeBonus(casino, translations.reloadBonus);
    }
  };

  const bonusText = getBonusText();

  return (
    <div className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
      {/* Casino Logo */}
      <Link
        href={casino.casinoBonus.bonusUrl}
        className="shrink-0"
        rel="sponsored"
        target="_blank"
      >
        <Image
          src={casino.images.url}
          alt={`${casino.title} logo`}
          width={90}
          height={60}
          className="rounded border border-border object-contain"
          loading="lazy"
        />
      </Link>

      {/* Casino Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1 truncate">{casino.title}</h4>
        <div className="text-xs text-muted-foreground">{bonusText}</div>
      </div>

      {/* CTA Button */}
      <Link
        href={casino.casinoBonus.bonusUrl}
        className="shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-semibold hover:bg-primary/90 transition-colors"
        rel="sponsored"
        target="_blank"
      >
        {translations.review || "RECENSIONE"}
      </Link>
    </div>
  );
}
