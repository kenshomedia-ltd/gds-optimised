"use client";

import Link from "next/link";
import { Image } from "../common";

interface GameCardProps {
  imageUrl: string;
  title: string;
  link: string;
  translations?: {
    play?: string;
  };
}

export default function GameCard({
  imageUrl,
  title,
  link,
  translations = {},
}: GameCardProps) {
  const gamePagePath =
    process.env.NEXT_PUBLIC_GAME_PAGE_PATH || "/slot-machines";
  const gameUrl = `${gamePagePath}/${link}`;

  return (
    <div className="flex gap-x-2.5 items-center justify-between">
      <div className="flex items-center gap-x-2.5">
        <div className="w-12 h-12 relative">
          <Image
            src={imageUrl}
            alt=""
            width={48}
            height={48}
            className="rounded-lg w-full h-full object-cover"
          />
        </div>
        <div className="line-clamp-2 text-black">{title}</div>
      </div>
      <Link
        href={`${gameUrl}/`}
        className="flex w-fit h-[37px] justify-center items-center uppercase rounded-md btn-secondary px-4 py-[6px] text-sm font-semibold text-white"
      >
        {translations.play ?? "Play"}
      </Link>
    </div>
  );
}
