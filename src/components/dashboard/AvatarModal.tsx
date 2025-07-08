// AvatarModal.tsx (Radix Dialog + Tailwind CSS + React)
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser, useUserActions } from "@/contexts/UserContext";
import { TranslationData } from "@/types/strapi.types";
import { Image as CommonImage } from "../common";
import Image from "next/image";
import { TUser } from "@/types/user.types";
import Dropzone from "react-dropzone";

export interface AvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: TranslationData;
}

type Avatar = {
  avatar: {
    id: number;
    url: string;
  };
};

export default function AvatarModal({
  translations,
  open,
  onOpenChange,
}: AvatarModalProps) {
  const { state, getUserProfile } = useUser();
  const { setUser } = useUserActions();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatar, setAvatar] = useState("");
  const [preloadedAvatars, setPreloadedAvatars] = useState<Avatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState(0);
  const [mode, setMode] = useState("AVATAR");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvatars = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/user-avatars/`
      );
      const data = await res.json();
      const filteredAvatars = [...data.data].filter(
        (avatar: Avatar) => avatar.avatar
      );
      setPreloadedAvatars(filteredAvatars);
    };

    if (open) {
      fetchAvatars();
    }
  }, [open]);

  const handleAvatarFileSelect = (files: File[]) => {
    const file = files[0];
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const updateAvatar = async () => {
    setLoading(true);

    if (mode === "AVATAR" && selectedAvatarId) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/user/`, {
        method: "PATCH",
        body: JSON.stringify({ photo: selectedAvatarId }),
      });
      toast.success(translations.profileUpdateSuccessToast);
      await getUserProfile();
    }

    if (mode === "NEW_IMAGE" && avatarFile) {
      if (state?.user?.photo) {
        fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/delete-user-image/?` +
            new URLSearchParams(`id=${state?.user?.photo.id}`),
          {
            method: "DELETE",
          }
        );
      }
      const formData = new FormData();
      formData.append("files", avatarFile, `avatar-${state?.user?.id}`);
      formData.append("path", "users/avatar");
      formData.append("ref", "plugin::users-permissions.user");
      formData.append("refId", `${state?.user?.id}`);
      formData.append("field", "photo");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/update-user-image/`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      setUser({
        ...(state.user as TUser),
        photo: {
          ...state.user?.photo,
          id: data[0].id,
          url: data[0].url,
        },
      });
      toast.success(translations.profileUpdateSuccessToast);
    }

    setSelectedAvatarId(0);
    setAvatarFile(null);
    setAvatar("");
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-4 z-50 space-y-5">
          <Dialog.Title className="text-lg font-bold text-blue-700">
            {translations.avatarImage}
          </Dialog.Title>

          <div className="flex gap-2">
            {["AVATAR", "NEW_IMAGE"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`tab p-2.5 rounded bg-[#f0f0f0] text-sm font-medium ${
                  mode === m ? "!bg-[#007bff] text-white" : ""
                }`}
              >
                {m === "AVATAR"
                  ? translations.preloadedAvatars
                  : translations.uploadYourOwn}
              </button>
            ))}
          </div>

          {mode === "AVATAR" && (
            <div className="flex flex-wrap gap-2.5 min-h-[120px]">
              {preloadedAvatars.map(({ avatar }) => (
                <div
                  key={avatar.id}
                  onClick={() => {
                    setAvatar(avatar.url);
                    setSelectedAvatarId(avatar.id);
                  }}
                >
                  <CommonImage
                    src={avatar.url}
                    width={60}
                    height={60}
                    alt=""
                    className={`w-[60px] h-[60px] rounded-full cursor-pointer border-2 transition-all duration-200 ${
                      avatar.id === selectedAvatarId
                        ? "border-[#007bff]"
                        : "border-transparent"
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {mode === "NEW_IMAGE" && (
            <label className="relative block px-6 py-4 rounded-xl border border-[#EAECF0] cursor-pointer text-center">
              <Dropzone
                onDrop={handleAvatarFileSelect}
                accept={{ "image/*": [] }}
                multiple={false}
              >
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="border border-[#EAECF0] p-4 rounded-xl cursor-pointer text-center"
                  >
                    <input {...getInputProps()} />
                    <div className="flex justify-center">
                      <CommonImage
                        width={20}
                        height={20}
                        src="/icons/upload-cloud.svg"
                        alt=""
                      />
                    </div>
                    <div className="text-sm mt-2">
                      <span className="text-purple-500 font-bold">
                        {translations.clickToUpload}
                      </span>{" "}
                      {translations.dragAndDrop}
                    </div>
                  </div>
                )}
              </Dropzone>
            </label>
          )}

          <div className="text-center mt-5">
            <p>{translations.avatarPreview}</p>
            {avatar ? (
              <Image
                src={avatar}
                alt="Preview"
                className="w-20 h-20 mx-auto rounded-full object-cover"
                width={80}
                height={80}
              />
            ) : (
              <div className="w-20 h-20 mx-auto bg-purple-700 rounded-full flex justify-center items-center">
                <CommonImage
                  width={32}
                  height={32}
                  src="/images/dashboard/user-placeholder.svg"
                  alt="User placeholder"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={updateAvatar}
              disabled={
                (mode === "AVATAR" && !selectedAvatarId) ||
                (mode === "NEW_IMAGE" && !avatar)
              }
            >
              {loading
                ? translations.pleaseWait + "..."
                : translations.submitForm}
            </button>
            <Dialog.Close asChild>
              <button className="bg-white border border-gray-300 text-sm font-semibold text-gray-900 px-4 py-2 rounded hover:bg-gray-50">
                {translations.cancel}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
