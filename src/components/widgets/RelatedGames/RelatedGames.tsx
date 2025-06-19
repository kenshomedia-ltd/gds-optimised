// src/components/games/RelatedGames/RelatedGames.tsx

import React from "react";
import { GameCard } from "@/components/games/GameCard";
import type { GameData } from "@/types/game.types";
import type { TranslationData } from "@/types/strapi.types";

interface RelatedGamesProps {
  games: GameData[];
  translations: TranslationData;
  providerName?: string;
}

/**
 * RelatedGames Component
 *
 * Displays related games from the same provider in a responsive grid layout.
 * Uses the same container styling as NewAndLovedSlots for consistency.
 *
 * @param games - Array of related games from the same provider
 * @param translations - Translation strings
 * @param providerName - Optional provider name for the heading
 */
export function RelatedGames({
  games,
  translations,
  providerName,
}: RelatedGamesProps) {
  // Don't render if no games are available
  if (games.length === 0) {
    return null;
  }

  return (
    <section className="relative z-10" aria-label="Related Games">
      <div className="relative xl:container px-2 pb-5">
        <div className="pt-[23px] gap-x-5 gap-y-6 flex-col md:flex">
          <div className="w-full">
            <h2 className="text-white mb-4 font-bold text-xl leading-6 mt-0">
              {providerName
                ? `${
                    translations?.moreGamesFrom || "More games from"
                  } ${providerName}`
                : translations?.relatedGames || "Related Games"}
            </h2>
            <div className="bg-white/[0.36] border border-white/30 shadow-[0px_0px_12px_rgba(63,230,252,0.6)] backdrop-blur-[6px] rounded-xl flex md:grid grid-cols-3 lg:grid-cols-6 gap-x-2 p-2">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  translations={translations}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
