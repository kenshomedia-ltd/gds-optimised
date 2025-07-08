"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner"; // or use your toast lib

interface ResetPasswordProps {
  translations: Record<string, string>;
}

export const ResetPassword = ({ translations }: ResetPasswordProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);

  useEffect(() => {
    const resetCode = searchParams.get("code");
    if (!resetCode) {
      toast.error("Invalid or missing reset code.");
      router.push("/authentication/login");
    } else {
      setCode(resetCode);
    }
  }, [searchParams, router]);

  const resetPasswordHandler = async () => {
    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoader(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/reset-password/`,
        {
          method: "POST",
          body: JSON.stringify({ code, password, passwordConfirmation }),
        }
      );

      const res = await response.json();
      if (res?.error) {
        toast.error(res.error.message || "Something went wrong.");
      } else {
        toast.success("Password reset successfully.");
        router.push("/authentication/login");
      }
    } catch (err: unknown) {
      // Failed to reset password
      toast.error(
        (err as { message?: string })?.message || "Failed to reset password"
      );
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-blue-700 text-[32px] font-bold leading-[38px]">
          Reset Password
        </h2>
        <p className="text-base text-blue-500">
          {translations.resetPasswordSubtitle}
        </p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label
            htmlFor="password"
            className="block text-blue-500 text-sm font-medium mb-[6px]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-[rgba(255,255,255,0.30)] focus:border-misc focus:shadow-none"
          />
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-blue-500 text-sm font-medium mb-[6px]"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-[rgba(255,255,255,0.30)] focus:border-misc focus:shadow-none"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={resetPasswordHandler}
            className="flex w-full justify-center items-center rounded-md btn-secondary px-3 py-2.5 text-sm font-semibold leading-6 text-white hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            {loader && (
              <span className="custom-spinner mr-2" aria-hidden="true" />
            )}
            <span>{loader ? "Please wait..." : "Reset Password"}</span>
          </button>
        </div>
      </form>

      <p className="text-center text-base text-blue-500 !mb-0">
        Go back to?
        <Link
          href="/authentication/login"
          className="-m-3 font-bold rounded-md p-3 transition duration-150 ease-in-out text-misc hover:text-misc/90"
        >
          Login
        </Link>
      </p>
    </>
  );
};
