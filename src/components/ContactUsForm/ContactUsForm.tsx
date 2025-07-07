"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { TranslationData } from "@/types/strapi.types";
import { Spinner } from "../ui/Spinner";
import { toast } from "sonner";

interface Props {
  translations: TranslationData;
}

export function ContactUsForm({ translations }: Props) {
    const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactUsFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const response = await fetch(`${process.env.NEXT_PUBLIC_FULL_URL}/api/contact-us`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    console.log("data", data);
    toast.success("Successfully submitted.");
    setIsSubmitting(false);
    if (response.ok) {
      formRef.current?.reset(); // ✅ Reset the form
    }
  };

  return (
    <div className="dashboard-bg flex justify-center -mb-5 py-10">
      <div className="lg:container px-2">
        <div className="dashboard-glass-wrapper p-3">
          <div className="rounded-xl bg-white space-y-20 px-5 md:px-10 lg:px-20 py-20 shadow-[0px_0px_12px_0px_rgba(63,230,252,0.60)] backdrop-blur-[6px] border border-[rgba(255,255,255,0.30)]">
            <div className="max-w-[480px] mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl text-blue-900 font-bold mb-4">
                  {translations.getInTouch}
                </h2>
                <p className="text-lg text-blue-700">
                  {translations.getInTouchSubtitle}
                </p>
              </div>

              <form
                ref={formRef}
                className="space-y-6"
                onSubmit={contactUsFormHandler}
              >
                <div className="space-y-6 md:space-y-0 md:flex gap-x-6">
                  <div className="md:w-1/2">
                    <label
                      className="block text-blue-500 text-sm font-medium mb-[6px]"
                      htmlFor="firstName"
                    >
                      {translations.firstName}
                    </label>
                    <input
                      className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-background-700"
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder={translations.firstName}
                      required
                    />
                  </div>
                  <div className="md:w-1/2">
                    <label
                      className="block text-blue-500 text-sm font-medium mb-[6px]"
                      htmlFor="lastName"
                    >
                      {translations.lastName}
                    </label>
                    <input
                      className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-background-700"
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder={translations.lastName}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-blue-500 text-sm font-medium mb-[6px]"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-background-700"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@mail.com"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-blue-500 text-sm font-medium mb-[6px]"
                    htmlFor="phoneNumber"
                  >
                    {translations.phoneNumber}
                  </label>
                  <input
                    className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-background-700"
                    id="phoneNumber"
                    name="phone"
                    type="tel"
                    placeholder="+39 000 000000"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-blue-500 text-sm font-medium mb-[6px]"
                    htmlFor="message"
                  >
                    {translations.message}
                  </label>
                  <textarea
                    className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-background-700"
                    id="message"
                    name="message"
                    placeholder={translations.leaveUsAMessage + "..."}
                    rows={5}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="privacyPolicy"
                    name="privacyPolicy"
                    type="checkbox"
                    className="h-4 w-4 rounded border-grey-300 text-primary focus:ring-primary/90"
                  />
                  <label
                    htmlFor="privacyPolicy"
                    className="ml-3 block text-sm text-grey-500"
                  >
                    {translations.contactUsFormPrivacy}{" "}
                    <Link href="/" className="underline">
                      {translations.privacyPolicy}.
                    </Link>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center items-center rounded-md btn-secondary px-3 py-2.5 text-sm font-semibold text-white"
                  >
                    {isSubmitting ? (
                      <Spinner />
                    ) : (
                      <span>{translations.sendMessage}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
