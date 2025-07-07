"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import type { GameData, TDashboardGame } from "@/types/game.types";
import { TranslationData } from "@/types/strapi.types";
import { GameCard, GameCardSkeleton } from "../games";
import Link from "next/link";

export default function MostPlayedGames({
  translations,
}: {
  translations: TranslationData;
}) {
  const { state } = useUser();
  const slotMachineUrl = state.slotMachineUrl;

  const [mostPlayedGames, setMostPlayedGames] = useState<TDashboardGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostPlayedGames = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/most-played-games/`
        );
        if (res.ok) {
          const data = await res.json();
          setMostPlayedGames(data);
        }
      } catch (err) {
        console.error("Failed to fetch most played games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMostPlayedGames();
  }, []);

  return (
    <div>
      <div className="text-xl text-white font-bold font-lato mb-[14px]">
        {translations?.mostPlayed}
      </div>

      <div className="dashboard-glass-wrapper p-3">
        {loading && mostPlayedGames.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[...Array(5)].map((elem, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </div>
        )}
        {mostPlayedGames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {mostPlayedGames.map((gameObj, index) => (
              <GameCard
                key={gameObj.id || index}
                game={gameObj.game as GameData}
                translations={translations}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="py-12 px-8 space-y-3 flex flex-col items-center">
              <div className="text-base text-center text-white font-bold">
                {translations?.emptyMostPlayedGames}
              </div>
              <Link
                href={`${slotMachineUrl}/`}
                className="text-center min-h-[37px] uppercase rounded-md btn-secondary px-4 py-[6px] text-sm font-semibold"
              >
                {translations?.seeAllGames}
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
