"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { TranslationData } from "@/types/strapi.types";
import {
  ContactSvg,
  FavouriteGamesSvg,
  HomeSvg,
  MessagesSvg,
  MostPlayedGamesSvg,
  SignoutSvg,
  WeeklyPicksSvg,
} from "../icons";
import { useUser } from "@/contexts/UserContext";

export default function DashboardNav({
  translations,
  source,
}: {
  translations: TranslationData;
  source: "SIDE" | "FOOTER";
}) {
  const pathname = usePathname();
  const { state, dispatch } = useUser();

  const activeRoute = pathname?.split("/")[2] || "home";
  const unreadCount = state.messages.length - state.readMessages.length;

  const logoutHandler = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_FULL_URL}/api/auth/logout/`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    dispatch({ type: "SET_USER", payload: null });
    dispatch({ type: "SET_MESSAGES", payload: [] });
    dispatch({ type: "SET_READ_MESSAGES", payload: [] });
    window.location.reload();
  };

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: <HomeSvg />,
      route: "home",
    },
    {
      label: translations?.mostPlayed,
      href: "/dashboard/most-played-games",
      icon: <MostPlayedGamesSvg />,
      route: "most-played-games",
    },
    {
      label: translations?.favouriteGame,
      href: "/dashboard/favourite-games",
      icon: <FavouriteGamesSvg />,
      route: "favourite-games",
    },
    {
      label: translations?.pickOfTheWeek,
      href: "/dashboard/weekly-pick",
      icon: <WeeklyPicksSvg />,
      route: "weekly-pick",
    },
    {
      label: translations?.message,
      href: "/dashboard/messages",
      icon: <MessagesSvg />,
      route: "messages",
      badge: unreadCount,
    },
    {
      label: translations?.contactUs,
      href: "/contact-us",
      icon: <ContactSvg />,
      route: "contact-us",
    },
  ];

  return (
    <ul className="space-y-0.5">
      {navItems.map((item) => {
        const isActive = activeRoute === item.route;
        return (
          <li
            key={item.href}
            className={cn("group", isActive && "item-active")}
          >
            <Link
              href={item.href}
              className={cn(
                "text-blue-100 flex items-center gap-x-3 rounded-tl-md rounded-bl-md py-2.5 px-4 -mr-4 text-base font-medium",
                isActive && "text-white",
                source === "SIDE" && isActive && "bg-blue-300"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <div className="flex px-2 py-[1px] h-6 min-h-6 !rounded-full btn-secondary justify-center items-center">
                  <span>{item.badge}</span>
                </div>
              )}
            </Link>
          </li>
        );
      })}

      <li className="md:hidden">
        <button
          className="flex justify-between gap-x-3 px-4 py-2.5"
          onClick={logoutHandler}
        >
          <SignoutSvg className="shrink-0 w-6 h-6 text-blue-100" />
          <div className="text-menu-link-text text-base">Logout</div>
        </button>
      </li>
    </ul>
  );
}
