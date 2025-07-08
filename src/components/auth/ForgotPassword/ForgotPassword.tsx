"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface ForgotPasswordProps {
  translations: Record<string, string>;
}

export function ForgotPassword({ translations }: ForgotPasswordProps) {
  const [email, setEmail] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);
  const [isResetLinkSent, setIsResetLinkSent] = useState(false);

  const forgotPasswordHandler = async () => {
    if (!email) return toast.error(translations.enterEmail);

    setLoader(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/forgot-password/`,
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      );

      const res = await response.json();
      if (res.error) {
        toast.error(res?.error.message || "Something went wrong");
      } else {
        setIsResetLinkSent(true);
      }
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message || "Unable to send reset link."
      );
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-blue-700 text-[32px] font-bold leading-[38px]">
          {translations.recoverPassword}
        </h2>

        {isResetLinkSent ? (
          <p className="text-base text-blue-500">
            {translations.forgotEmailMessage}
            <span className="text-misc font-bold"> {email}</span>.
          </p>
        ) : (
          <p className="text-base text-blue-500">
            {translations.passwordRecoverySubtitle}
          </p>
        )}
      </div>

      {!isResetLinkSent && (
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label
              htmlFor="email-address"
              className="block text-blue-500 text-sm font-medium mb-[6px]"
            >
              {translations.emailAddress}
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={translations.enterEmail}
              className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-[rgba(255,255,255,0.30)] focus:border-misc focus:shadow-none"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={forgotPasswordHandler}
              className="flex w-full justify-center items-center rounded-md btn-secondary px-3 py-2.5 text-sm font-semibold leading-6 text-white"
            >
              {loader && (
                <span className="custom-spinner mr-2" aria-hidden="true" />
              )}
              <span>
                {loader
                  ? translations.pleaseWait
                  : translations.sendRecoverLink}
              </span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {isResetLinkSent && (
          <Link
            href="/authentication/login"
            className="block text-center min-h-[44px] rounded-md btn-secondary px-3 py-2.5 text-sm font-semibold"
          >
            {translations.backToSignIn}
          </Link>
        )}
        <p className="text-center text-base text-blue-500 !mb-0">
          {translations.noAccount}
          <Link
            href="/authentication/register"
            className="-m-3 font-bold rounded-md p-3 transition duration-150 ease-in-out text-misc hover:text-misc/90"
          >
            {translations.signUp}
          </Link>
        </p>
      </div>
    </>
  );
}
