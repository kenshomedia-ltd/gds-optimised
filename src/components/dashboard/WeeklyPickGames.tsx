"use client";

import { useEffect, useState } from "react";
import type { TDashboardGame, GameData } from "@/types/game.types";
import type { TranslationData } from "@/types/strapi.types";
import { GameCard, GameCardSkeleton } from "../games";

export default function WeeklyPickedGames({
  translations,
}: {
  translations: TranslationData;
}) {
  const [weeklyGames, setWeeklyGames] = useState<TDashboardGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyPickedGames = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/weekly-picked-games/`
        );
        if (res.ok) {
          const data = await res.json();
          setWeeklyGames(data);
        }
      } catch (error) {
        console.error("Failed to fetch weekly pick games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyPickedGames();
  }, []);

  return (
    <div className="px-4">
      <div className="text-xl text-white font-bold font-lato mb-[14px]">
        {translations.pickOfTheWeek}
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full">
            {[...Array(5)].map((_, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-glass-wrapper p-3">
          {weeklyGames.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {weeklyGames.map((gameObj, index) => (
                <GameCard
                  key={gameObj.id || index}
                  game={gameObj.game as GameData}
                  translations={translations}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 px-8 space-y-3 flex items-center justify-center">
              <div className="text-base text-center text-white font-bold">
                <span className="text-white">Empty</span>{" "}
                {translations.emptyMostPlayedGames}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
