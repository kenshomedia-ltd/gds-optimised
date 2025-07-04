"use client";

import { useEffect, useState } from "react";
import Dropzone from "react-dropzone"; // Or any wrapper around it
import { toast } from "sonner";

import { useUser } from "@/contexts/UserContext";
import { TranslationData } from "@/types/strapi.types";
import { Image } from "../common";
import AvatarModal from "./AvatarModal";

interface Props {
  translations: TranslationData;
}

type UserProfilePayload = {
  firstName: string;
  lastName: string;
  bio: string;
  photo?: number; // avatar id
};

export default function UserProfileEdit({ translations }: Props) {
  const { state, getUserProfile } = useUser();
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userCoverImage, setUserCoverImage] = useState<string | null>(null);

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  async function updateUserProfile(payload: Partial<UserProfilePayload>) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/user/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update user profile");
    }

    return res.json();
  }

  const handleImageUpload = async (file: File) => {
    if (state?.user?.cover_image) {
      fetch(
        `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/delete-user-image/?` +
          new URLSearchParams(`id=${state?.user?.cover_image.id}`),
        {
          method: "DELETE",
        }
      );
    }
    const formData = new FormData();
    formData.append("files", file);
    formData.append("path", `users/cover`);
    formData.append("ref", "plugin::users-permissions.user");
    formData.append("refId", state?.user?.id.toString() ?? "");
    formData.append("field", "cover_image");

    await fetch(
      `${process.env.NEXT_PUBLIC_FULL_URL}/api/dashboard/update-user-image`,
      {
        method: "POST",
        body: formData,
      }
    );
  };

  const handleProfileUpdate = async () => {
    setIsSubmitting(true);

    try {
      // 3. Upload cover image if provided
      if (coverImageFile) {
        await handleImageUpload(coverImageFile);
      }

      // 4. Update name and bio if changed
      const payload: Partial<UserProfilePayload> = {};
      if (userFirstName !== state?.user?.firstName)
        payload.firstName = userFirstName;
      if (userLastName !== state?.user?.lastName)
        payload.lastName = userLastName;
      if (userBio !== state?.user?.bio) payload.bio = userBio;

      if (Object.keys(payload).length > 0) {
        await updateUserProfile(payload);
      }

      // 5. Refetch user profile
      await getUserProfile();

      toast.success(translations.profileUpdateSuccessToast);
    } catch (error) {
      toast.error("Something went wrong updating your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const user = state.user;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state.user) {
      setUserFirstName(state.user.firstName);
      setUserLastName(state.user.lastName);
      setUserBio(state.user.bio ?? "");
      setUserPhoto(state.user.photo?.url ?? null);
      setUserCoverImage(state.user.cover_image?.url ?? null);
    } else {
      // If not loaded yet, fetch
      const fetchUser = async () => {
        await getUserProfile();
        setIsLoading(false);
      };
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const handleAvatarDrop = (acceptedFiles: File[]) => {
  //   const file = acceptedFiles[0];
  //   setAvatarFile(file);
  //   setAvatarPreview(URL.createObjectURL(file));
  // };

  const handleCoverDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl text-white font-bold mb-4">
        {translations.editProfile}
      </h1>

      {mounted && (
        <>
          <div className="bg-[#DCE9F3] p-3 rounded-xl md:flex gap-6">
            <div className="w-[280px] shrink-0">
              <h2 className="text-xl text-blue-900 font-bold">
                {translations.personalInfo}
              </h2>
              <p className="text-sm text-blue-500">
                {translations.profileUpdatePageSubtitle}
              </p>
            </div>

            <div className="w-full p-6 space-y-6 bg-white rounded-xl border border-[#EAECF0]">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full">
                  <label className="block text-blue-500 text-sm mb-1">
                    {translations.firstName}
                  </label>
                  <input
                    type="text"
                    value={userFirstName}
                    onChange={(e) => setUserFirstName(e.target.value)}
                    className="w-full py-2 px-4 border border-gray-300 rounded"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-blue-500 text-sm mb-1">
                    {translations.lastName}
                  </label>
                  <input
                    type="text"
                    value={userLastName}
                    onChange={(e) => setUserLastName(e.target.value)}
                    className="w-full py-2 px-4 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="w-full md:w-1/2 space-y-3 text-center">
                  <div className="w-[128px] h-[128px] mx-auto bg-purple-700 rounded-full overflow-hidden">
                    {user?.photo?.url ? (
                      <Image
                        src={user?.photo?.url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        width={128}
                        height={128}
                      />
                    ) : (
                      <Image
                        width={128}
                        height={128}
                        src="/images/dashboard/user-placeholder.svg"
                        alt="User placeholder"
                      />
                    )}
                  </div>

                  <button
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="bg-gray-100 px-4 py-2 rounded text-sm"
                  >
                    {translations.editAvatar}
                  </button>
                </div>

                {/* Cover Image */}
                <div className="w-full md:w-1/2 space-y-3">
                  <div
                    className={`w-full h-[128px] max-w-[324px] mx-auto bg-gray-100 rounded-xl overflow-hidden cover-image-wrapper bg-no-repeat bg-cover`}
                  >
                    {coverImagePreview || userCoverImage ? (
                      <Image
                        src={coverImagePreview || userCoverImage || ""}
                        alt=""
                        className="w-full h-full object-cover"
                        width={324}
                        height={128}
                      />
                    ) : null}
                  </div>

                  <Dropzone
                    onDrop={handleCoverDrop}
                    accept={{ "image/*": [] }}
                    multiple={false}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <div
                        {...getRootProps()}
                        className="border border-[#EAECF0] p-4 rounded-xl cursor-pointer text-center"
                      >
                        <input {...getInputProps()} />
                        <div className="flex justify-center items-center w-10 h-10 mx-auto bg-[#F2F4F7] rounded-full border-4 border-white">
                          <Image
                            width={20}
                            height={20}
                            src="/icons/upload-cloud.svg"
                            alt=""
                          />
                        </div>
                        <p className="text-sm mt-2">
                          <span className="text-purple-500 font-bold">
                            {translations.clickToUpload}
                          </span>
                          <br />
                          {translations.dragAndDrop}
                        </p>
                      </div>
                    )}
                  </Dropzone>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-blue-500 text-sm mb-1">
                  {translations.bioDescription}
                </label>
                <textarea
                  rows={5}
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  className="w-full py-2 px-4 border border-gray-300 rounded"
                />
              </div>

              <div className="text-right">
                <button
                  onClick={handleProfileUpdate}
                  className="bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? translations.pleaseWait + "..."
                    : translations.saveChanges}
                </button>
              </div>
            </div>
          </div>

          {/* Avatar modal to be implemented next */}
          <AvatarModal
            translations={translations}
            open={isAvatarModalOpen}
            onOpenChange={setIsAvatarModalOpen}
          />
        </>
      )}
    </div>
  );
}
