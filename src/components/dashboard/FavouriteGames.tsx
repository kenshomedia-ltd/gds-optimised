"use client";

import { useEffect, useState } from "react";
import type { TDashboardGame, GameData } from "@/types/game.types";
import type { TranslationData } from "@/types/strapi.types";
import { useUser, useUserActions } from "@/contexts/UserContext";
import { GameCard, GameCardSkeleton } from "../games";
import Link from "next/link";

export default function FavouriteGames({
  translations,
}: {
  translations: TranslationData;
}) {
  const { state } = useUser();
  const { setFavouriteGames } = useUserActions();
  const slotMachineUrl = state.slotMachineUrl;
  const favouriteGames = state.favouriteGames;

  const [gamesNotOnUserAccount, setGamesNotOnUserAccount] = useState<
    GameData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync local favourites to backend
  const syncGames = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/user-games/`,
        {
          method: "POST",
          body: JSON.stringify({
            games: gamesNotOnUserAccount.map((game) => game.id),
          }),
        }
      );

      if (res.ok) {
        // Refresh user favourites
        const updated = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/user-games/`
        );
        const updatedGames = await updated.json();
        setFavouriteGames(updatedGames);
        setGamesNotOnUserAccount([]);
      }
    } catch (error) {
      console.error("Failed to sync games:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const fetchFavourites = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/user-games/`
        );
        const data: TDashboardGame[] = await res.json();
        setFavouriteGames(data);

        const local = localStorage.getItem("_favourites");
        const localFavourites: GameData[] = local ? JSON.parse(local) : [];

        const missingGames = localFavourites.filter(
          (localGame) =>
            !data.some((userGame) => userGame.game.id === localGame.id)
        );

        setGamesNotOnUserAccount(missingGames);
      } catch (err) {
        console.error("Error loading favourites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setGamesNotOnUserAccount]);

  return (
    <div>
      <div className="text-xl text-white font-bold font-lato mb-[14px]">
        {translations.favouriteGame}
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          {[...Array(5)].map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {gamesNotOnUserAccount.length > 0 && (
            <div className="mb-6">
              <p className="text-base text-white/80">
                {translations.youHave}{" "}
                <span className="text-white font-semibold">
                  {gamesNotOnUserAccount.length}
                </span>{" "}
                {translations.favouriteGamesSync}
              </p>
              <button
                onClick={syncGames}
                disabled={isSyncing}
                className="flex justify-center items-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/80 focus:outline-none"
              >
                {isSyncing && (
                  <span className="custom-spinner mr-2" aria-hidden="true" />
                )}
                {isSyncing
                  ? "Syncing games..."
                  : translations.syncGames || "Sync Games"}
              </button>
            </div>
          )}

          <div className="dashboard-glass-wrapper p-3">
            {favouriteGames.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {favouriteGames.map((fav, i) => (
                  <GameCard
                    key={fav.id || i}
                    game={fav.game as GameData}
                    translations={translations}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 px-8 space-y-3 flex flex-col items-center">
                <div className="text-base text-center text-white font-bold">
                  {translations.emptyFavoriteGames}
                </div>
                <Link
                  href={`${slotMachineUrl}/`}
                  className="text-center min-h-[37px] uppercase rounded-md btn-secondary px-4 py-[6px] text-sm font-semibold"
                >
                  {translations.seeAllGames}
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
