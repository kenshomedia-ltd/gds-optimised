// src/components/casino/CasinoSidebar/CasinoSidebarServer.tsx

import { CasinoSidebarStack } from "../CasinoSidebarStack/CasinoSidebarStack";
import type { CasinoSidebarProps } from "@/types/sidebar.types";
import { cn } from "@/lib/utils/cn";

/**
 * CasinoSidebarServer Component
 *
 * Server-side rendered version for initial page load
 * Client component handles sticky behavior
 */
export function CasinoSidebarServer({
  casinos,
  translations = {},
  className,
}: CasinoSidebarProps) {
  const hasCasinos =
    (casinos.most_loved_casinos && casinos.most_loved_casinos.length > 0) ||
    (casinos.no_deposit_casinos && casinos.no_deposit_casinos.length > 0) ||
    (casinos.free_spin_casinos && casinos.free_spin_casinos.length > 0);

  if (!hasCasinos) {
    return null;
  }

  return (
    <aside className={cn("w-full space-y-6", className)}>
      {/* Most Loved Casinos */}
      {casinos.most_loved_casinos && casinos.most_loved_casinos.length > 0 && (
        <CasinoSidebarStack
          title={translations.mostLovedCasinos || "Casino Più Amati"}
          casinos={casinos.most_loved_casinos}
          bonusType="regular"
          translations={translations}
        />
      )}

      {/* No Deposit Casinos */}
      {casinos.no_deposit_casinos && casinos.no_deposit_casinos.length > 0 && (
        <CasinoSidebarStack
          title={translations.noDepositCasinos || "Casino Senza Deposito"}
          casinos={casinos.no_deposit_casinos}
          bonusType="noDeposit"
          translations={translations}
        />
      )}

      {/* Free Spin Casinos */}
      {casinos.free_spin_casinos && casinos.free_spin_casinos.length > 0 && (
        <CasinoSidebarStack
          title={translations.freeSpinCasinos || "Casino Con Bonus Free Spin"}
          casinos={casinos.free_spin_casinos}
          bonusType="freeSpins"
          translations={translations}
        />
      )}
    </aside>
  );
}
