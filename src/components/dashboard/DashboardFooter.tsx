"use client";

import { useUser } from "@/contexts/UserContext";
import { TranslationData } from "@/types/strapi.types";
import { useEffect, useState } from "react";
import { Image } from "../common";
import DashboardNav from "./DashboardNav";
import { ArrowDownIcon } from "../icons";

export default function DashboardFooter({
  translations,
}: {
  translations: TranslationData;
}) {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { state } = useUser();
  const user = state.user;

  const menuToggler = () => {
    setMenuVisible((prev) => !prev);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted on client
  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <footer className="fixed w-full bottom-0 z-30 md:hidden">
      <div
        className={`bg-primary overflow-hidden overflow-y-auto group ${
          isMenuVisible ? "menu-open" : ""
        }`}
      >
        <div className="px-5 py-4 flex justify-between items-center gap-x-3">
          <div className="flex items-center gap-x-3 w-[calc(100%_-_34px)]">
            <div className="shrink-0 flex justify-center items-center w-10 h-10 rounded-full bg-purple-700 border-white border-[2px]">
              {!user?.photo?.url ? (
                <Image
                  width={40}
                  height={40}
                  src="/images/dashboard/user-placeholder.svg"
                  alt="User placeholder"
                />
              ) : (
                <Image
                  className="w-full h-full object-cover rounded-full"
                  width={40}
                  height={40}
                  src={user.photo.url}
                  alt={`${user.firstName} avatar`}
                />
              )}
            </div>
            <div>
              <div className="text-sm text-white line-clamp-1 font-semibold">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-sm line-clamp-1 text-blue-100">
                {user?.email}
              </div>
            </div>
          </div>

          <button
            className="flex items-center gap-x-2 text-blue-100"
            onClick={menuToggler}
          >
            <ArrowDownIcon
              className={`h-6 transition-all ${
                isMenuVisible ? "" : "rotate-180"
              }`}
            />
            <span>Menu</span>
          </button>
        </div>

        <div className="px-4">
          <div
            className={`pb-4 pt-2 border-t border-t-white transition-all ${
              isMenuVisible ? "block" : "hidden"
            }`}
          >
            <DashboardNav translations={translations} source="FOOTER" />
          </div>
        </div>
      </div>
    </footer>
  );
}
