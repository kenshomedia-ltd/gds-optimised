"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { SignoutSvg } from "../icons";
import { TranslationData } from "@/types/strapi.types";
import { useUser, useUserActions } from "@/contexts/UserContext";
import DashboardNav from "./DashboardNav";
import AvatarModal from "./AvatarModal";
import { getLayoutData } from "@/lib/strapi/data-loader";
// import AvatarModal from "./AvatarModal";

interface Props {
  translations: TranslationData;
  slotMachineURL: string;
}

export default function DashboardSidebar({
  translations,
  slotMachineURL,
}: Props) {
  const { state } = useUser();
  const { setUser, setMessages, setReadMessages, setSlotUrl } =
    useUserActions();

  const [requestLoader, setRequestLoader] = useState(true);
  const [dashboardUser, setDashboardUser] = useState(state.user || null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async (endpoint: string) => {
      const res = await fetch(endpoint);
      if (!res.ok) return null;
      return await res.json();
    };

    const fetchAuthData = async () => {
      setRequestLoader(true);
      setSlotUrl(slotMachineURL);

      const [userProfile, userMessages, userMessageActions] = await Promise.all(
        [
          fetchData(`${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/user/`),
          fetchData(
            `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/messages/`
          ),
          fetchData(
            `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/message-action/`
          ),
        ]
      );

      if (userProfile?.error) {
        handleLogout();
        return;
      }

      const readMessageList = userMessageActions?.read_messages
        ? JSON.parse(userMessageActions.read_messages)
        : [];

      setDashboardUser(userProfile);
      setUser(userProfile);
      setMessages(userMessages || []);
      setReadMessages(readMessageList || []);
      setRequestLoader(false);
    };

    fetchAuthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_FULL_URL}/api/auth/logout/`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    setUser(null);
    setMessages([]);
    setReadMessages([]);
    window.location.reload();
  };

  const user = state.user || dashboardUser;

  return (
    <>
      <aside className="sticky top-[99px] z-30 hidden w-[320px] h-[calc(100vh_-_99px)] shrink-0 py-8 bg-primary px-4 -my-10 lg:block">
        {mounted && (
          <nav className="flex flex-1 flex-col h-full justify-between">
            <DashboardNav translations={translations} source="SIDE" />

            <div className="sticky bottom-0 py-8 -mb-8 bg-primary border-t border-t-white -mx-4 px-8">
              <div className="flex gap-x-4 justify-between items-center cursor-pointer">
                <div className="flex items-center gap-x-3 w-[calc(100%_-_34px)]">
                  <div className="shrink-0 flex justify-center items-center w-10 h-10 rounded-full bg-purple-700 border-white border-[2px]">
                    {user?.photo?.url ? (
                      <Image
                        src={user.photo.url}
                        alt={`${user.firstName} avatar`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Image
                        src="/images/dashboard/user-placeholder.svg"
                        alt="user placeholder"
                        width={40}
                        height={40}
                        className="w-[80%] h-[80%] object-cover"
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
                <button title="logout" onClick={handleLogout}>
                  <SignoutSvg className="shrink-0 w-[18px] text-blue-100" />
                </button>
              </div>
            </div>
          </nav>
        )}
      </aside>

      {!requestLoader && !user?.photo?.url && (
        <AvatarModal
          translations={translations}
          open={true}
          onOpenChange={() => {}}
        />
      )}
    </>
  );
}
