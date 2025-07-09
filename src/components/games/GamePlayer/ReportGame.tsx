// components/ReportIssueModal.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { faXmark } from "@awesome.me/kit-0e07a43543/icons/duotone/light";
import { TranslationData } from "@/types/strapi.types";
import * as Dialog from "@radix-ui/react-dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gamePageURL: string;
  translations: TranslationData;
}

export function ReportGameModal({
  open,
  onOpenChange,
  gamePageURL,
  translations,
}: Props) {
  const [message, setMessage] = useState("");
  const [submissionLoader, setSubmissionLoader] = useState(false);
  const fullGameURL = `${process.env.NEXT_PUBLIC_SITE_URL}${gamePageURL}`;

  const deviceID =
    typeof window !== "undefined" ? window.navigator.userAgent : "unknown";

  const validateForm = () => {
    if (!message) {
      alert("Please, choose an issue from the list!");
    } else {
      reportAnIssue();
    }
  };

  const reportAnIssue = async () => {
    setSubmissionLoader(true);
    const issuePayload = {
      formName: "Report Game Form",
      formData: {
        gamePageURL,
        message,
        deviceID,
      },
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/report-an-issue`,
        {
          method: "POST",
          body: JSON.stringify(issuePayload),
        }
      );

      const res = await response.json();
      setSubmissionLoader(false);
      if (res?.error) {
        toast.error(res?.error.message);
      } else {
        toast.success(
          translations?.gameReportedSuccessfully ||
            "Game reported successfully."
        );
        onOpenChange(false);
      }
    } catch (error) {
      console.log(error);
      setSubmissionLoader(false);
      toast.error("Failed to report game issue.");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-4 z-[100] space-y-5">
          <div className="bg-white">
            <div className="border-b border-black p-5 flex justify-between items-center">
              <Dialog.Title className="text-lg font-bold text-blue-700">
                {translations?.reportAProblem}
              </Dialog.Title>
              <button
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-black h-6 w-6"
                />
              </button>
            </div>
            <div className="p-5">
              <form>
                <div className="form-heading">
                  <p>{translations?.reportAProblemContent}</p>
                </div>
                <div className="form-url">
                  <label
                    htmlFor="gameURL"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    {translations?.reportAProblemURL}
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="gameURL"
                      name="gameURL"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset
                  ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600
                  sm:text-sm sm:leading-6"
                      value={fullGameURL}
                      readOnly
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[1, 2, 3, 4].map((num) => {
                    const id = `message${num}`;
                    const value =
                      translations[
                        `reportAProblemMsg${num}` as keyof typeof translations
                      ];
                    return (
                      <div key={id} className="mb-3">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="message"
                          id={id}
                          value={value}
                          checked={message === value}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <label className="form-check-label ml-2" htmlFor={id}>
                          {value}
                        </label>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="rounded-md bg-primary py-1.5 px-2.5 text-sm font-semibold text-white shadow-sm mt-5"
                  onClick={validateForm}
                >
                  {translations?.sendMessage}
                  {submissionLoader && (
                    <span className="custom-spinner ml-2" aria-hidden="true" />
                  )}
                </button>
              </form>
            </div>
            <div className="border-t border-black px-5 py-2 flex justify-end">
              <button
                type="button"
                className="rounded-md bg-secondary py-2.5 px-10 text-sm font-semibold text-white shadow-sm mt-5"
                onClick={() => onOpenChange(false)}
              >
                {translations?.close}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
