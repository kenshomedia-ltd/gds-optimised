import { TDashboardGame } from "@/types/game.types";
import Link from "next/link";
import GameListItem from "./GameListItem";

export const GameSection = ({
  title,
  games,
  emptyText,
  viewAllHref,
  children,
}: {
  title: string;
  games: TDashboardGame[];
  emptyText: string;
  viewAllHref: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-3 rounded-[6px] border-blue-100">
    <div className="flex items-center gap-x-2">
      {children}
      <span className="text-blue-700 text-xl font-bold font-lato">{title}</span>
    </div>

    {games.length ? (
      <div className="mt-2">
        {games.map((game, i) => (
          <div
            key={game.game.id}
            className={`py-2 ${
              i < games.length - 1 ? "border-b border-[#CED4DA]" : ""
            }`}
          >
            <GameListItem
              title={game.game.title}
              imageUrl={game.game.images?.url}
              link={game.game.slug}
            />
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center gap-y-3 py-3 h-[calc(100%_-_30px)]">
        <div className="text-sm text-center text-blue-700 font-medium">
          {emptyText}
        </div>
        <Link
          href="/slot-machine"
          className="text-center w-fit min-h-[37px] uppercase rounded-md btn-secondary px-4 py-[6px] text-sm font-semibold"
        >
          See All Games
        </Link>
      </div>
    )}

    {games.length > 3 && (
      <div className="mt-5">
        <Link
          href={viewAllHref}
          className="register-btn flex w-full justify-center items-center px-3 py-[7px]"
        >
          View All
        </Link>
      </div>
    )}
  </div>
);
