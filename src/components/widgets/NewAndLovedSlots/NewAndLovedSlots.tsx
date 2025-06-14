// src/components/widgets/NewAndLovedSlots/NewAndLovedSlots.tsx

import React from "react";
import { GameCard } from "@/components/games/GameCard";
import type { GameData } from "@/types/game.types";
import type { TranslationData } from "@/types/strapi.types";
import type { NewAndLovedSlotsBlock } from "@/types/custom-page.types";

interface NewAndLovedSlotsProps {
  blockData: NewAndLovedSlotsBlock;
  translations: TranslationData;
  newGames?: GameData[];
  popularGames?: GameData[];
}

/**
 * NewAndLovedSlots Component
 *
 * Displays new and popular slots in a responsive grid layout.
 * This is a pure presentation component - all data fetching happens in the page loader.
 *
 * @param blockData - The block configuration from Strapi
 * @param translations - Translation strings
 * @param newGames - Array of new games (fetched by split query)
 * @param popularGames - Array of popular games (fetched by split query)
 */
export function NewAndLovedSlots({
  blockData,
  translations,
  newGames = [],
  popularGames = [],
}: NewAndLovedSlotsProps) {
  // Early return if component is disabled
  if (!blockData.newSlots) {
    return null;
  }

  // Don't render if no games are available
  if (newGames.length === 0 && popularGames.length === 0) {
    return null;
  }

  return (
    <section className="relative z-10" aria-label="New and Popular Slots">
      <div className="relative xl:container px-2 pb-5">
        <div className="hidden pt-[23px] gap-x-5 gap-y-6 flex-col md:flex md:max-w-[60%] xl:flex-row xl:max-w-full">
          {/* New Games Section */}
          {newGames.length > 0 && (
            <div className="xl:w-1/2">
              <h2 className="text-white mb-4 font-bold text-xl leading-6 mt-0">
                {translations?.newSlots || "New Slots"}
              </h2>
              <div className="bg-white/[0.36] border border-white/30 shadow-[0px_0px_12px_rgba(63,230,252,0.6)] backdrop-blur-[6px] rounded-xl flex md:grid grid-cols-3 gap-x-2 p-2">
                {newGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    translations={translations}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Popular Games Section */}
          {popularGames.length > 0 && (
            <div className="xl:w-1/2">
              <h2 className="text-white mb-4 font-bold text-xl leading-6 mt-0">
                {translations?.mostPopularSlots || "Most Popular Slots"}
              </h2>
              <div className="bg-white/[0.36] border border-white/30 shadow-[0px_0px_12px_rgba(63,230,252,0.6)] backdrop-blur-[6px] rounded-xl flex md:grid grid-cols-3 gap-x-2 p-2">
                {popularGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    translations={translations}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
