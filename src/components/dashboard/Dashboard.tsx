"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Image } from "@/components/common/Image";
import { useUser, useUserActions } from "@/contexts/UserContext";
import { GameSection } from "@/components/dashboard/GameSeciton";
import { TranslationData } from "@/types/strapi.types";

interface DashboardProps {
  translations: TranslationData;
}

const Dashboard = ({ translations }: DashboardProps) => {
  const { state } = useUser();
  const { setUser, setFavouriteGames, setMostPlayed, setWeeklyPicks } =
    useUserActions();

  const fetchData = async (endpoint: string) => {
    const res = await fetch(endpoint);
    if (!res.ok) return [];
    return await res.json();
  };

  useEffect(() => {
    const fetchAll = async () => {
      const [favourites, mostPlayed, weeklyPicks] = await Promise.all([
        fetchData(
          `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/user-games/`
        ),
        fetchData(
          `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/most-played-games/`
        ),
        fetchData(
          `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/weekly-picked-games/`
        ),
      ]);

      setFavouriteGames(favourites.slice(0, 3));
      setMostPlayed(mostPlayed.slice(0, 3));
      setWeeklyPicks(weeklyPicks.slice(0, 3));
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/user/`)
      .then((res) => res.json())
      .then(setUser)
      .catch(() => setUser(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user = state.user;
  const favouriteGames = state.favouriteGames;
  const mostPlayedGames = state.mostPlayed;
  const weeklyPickGames = state.weeklyPicks;
  //   const slotMachineUrl = state.slotMachineUrl;

  const coverImage = user?.cover_image?.url;
  const avatarImage = user?.photo?.url;
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;

  return (
    <div className="">
      <div className="dashboard-glass-wrapper">
        <div
          className={`h-[200px] rounded-t-xl z-20 ${
            !coverImage ? "cover-image-wrapper" : ""
          }`}
        >
          {coverImage && (
            <Image
              src={coverImage}
              alt={`${user?.firstName} cover image`}
              className="w-full h-full object-cover rounded-t-xl"
              width={1200}
              height={200}
            />
          )}
        </div>

        <div>
          <div className="flex items-center pt-2 pb-5 px-3 z-30 -translate-y-[72px]">
            <div className="items-end gap-x-6 w-full md:flex">
              <div className="shrink-0 mx-auto w-[144px] h-[144px] flex justify-center items-center z-30 bg-purple-700 rounded-full border-[2px] border-[#E9F2F8]">
                {avatarImage ? (
                  <Image
                    src={avatarImage}
                    alt="user avatar"
                    className="w-full h-full object-cover rounded-full"
                    width={144}
                    height={144}
                  />
                ) : (
                  <Image
                    src="/images/dashboard/user-placeholder.svg"
                    alt="user placeholder"
                    width={100}
                    height={100}
                    className="w-[100px] h-[100px] object-cover"
                  />
                )}
              </div>

              <div className="justify-between w-full md:flex">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                  <div className="text-2xl tracking-[0.96px] text-white font-lato">
                    {fullName}
                  </div>
                  <div className="min-h-[40px] max-w-[320px] text-sm text-white">
                    {user?.bio ?? ""}
                  </div>
                </div>

                <div className="shrink-0 justify-center flex items-center gap-x-2 h-fit">
                  <Link
                    href="/dashboard/profile/"
                    className="text-[#7C838D] flex items-center bg-white rounded-[6px] gap-x-[6px] py-[6px] px-4 text-sm font-bold"
                  >
                    <Image
                      src="/images/dashboard/user.svg"
                      alt="user placeholder"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                    <span>{translations?.editProfile}</span>
                  </Link>
                  <Link
                    href="/dashboard/messages/"
                    className="text-[#7C838D] flex items-center bg-white rounded-[6px] gap-x-[6px] py-[6px] px-4 text-sm font-bold"
                  >
                    <Image
                      src="/images/dashboard/chats.svg"
                      alt="user placeholder"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                    <span>{translations?.message}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 pt-5 pb-3 -mt-[72px]">
            <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
              <GameSection
                title={translations.mostPlayed}
                games={mostPlayedGames}
                emptyText={translations.emptyMostPlayedGames}
                viewAllHref="/dashboard/most-played-games/"
              >
                <Image
                  src="/images/dashboard/hour-glass.svg"
                  alt=""
                  width={14}
                  height={20}
                  className="w-[14px] h-5"
                />
              </GameSection>
              <GameSection
                title={translations.favouriteGame}
                games={favouriteGames}
                emptyText={translations.emptyFavoriteGames}
                viewAllHref="/dashboard/favourite-games/"
              >
                <Image
                  src="/images/dashboard/heart.svg"
                  alt=""
                  width={22}
                  height={22}
                  className="w-[22px] h-5"
                />
              </GameSection>
              <GameSection
                title={translations.pickOfTheWeek}
                games={weeklyPickGames}
                emptyText={translations.emptyWeeklyPick}
                viewAllHref="/dashboard/weekly-pick/"
              >
                <Image
                  src="/images/dashboard/star.svg"
                  alt=""
                  width={22}
                  height={20}
                  className="w-[22px] h-5"
                />
              </GameSection>
              {/* <GameSection
                title={"Leaderboard"}
                games={[]}
                emptyText={translations.comingSoon}
                viewAllHref="/dashboard/weekly-pick/"
              >
                <Image
                  src="/images/dashboard/trophy.svg"
                  alt=""
                  width={22}
                  height={20}
                  className="w-[22px] h-5"
                />
              </GameSection> */}

              <div className="bg-white p-3 rounded-[6px] border-blue-100">
                <div className="flex items-center gap-x-2">
                  <Image
                    src="/images/dashboard/trophy.svg"
                    alt=""
                    width={26}
                    height={20}
                    className="w-[22px] h-5"
                  />
                  <span className="text-blue-700 text-xl font-bold font-lato">
                    Leaderboard
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-center py-3 h-[calc(100%_-_30px)]">
                  <div className="text-sm text-center text-blue-700 font-medium">
                    {translations.comingSoon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
