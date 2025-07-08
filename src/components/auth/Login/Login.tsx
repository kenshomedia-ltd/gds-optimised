"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { TUser } from "@/types/user.types";
// import Link from "@/components/helpers/Link";
// import { setUser } from "@/stores/authStore";

interface LoginProps {
  translations: Record<string, string>;
}

interface LoginResponse {
  jwt?: string;
  user?: TUser;
  error?: {
    message: string;
  };
}

declare global {
  interface Window {
    grecaptcha?: ReCaptchaV2.ReCaptcha;
  }
}

export function Login({ translations }: LoginProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [logInLoader, setLogInLoader] = useState<boolean>(false);
  const [recaptchaReady, setRecaptchaReady] = useState<boolean>(false);
  const { dispatch } = useUser();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const validateLoginForm = () => {
    if (!email || !password) {
      alert(translations.emailPassReq);
      return;
    }
    if (!recaptchaReady) {
      alert(translations.recaptchaError || "reCAPTCHA not ready");
      return;
    }
    window.grecaptcha?.execute();
  };

  const resetCaptcha = () => {
    window.grecaptcha?.reset();
  };

  const handleCaptchaCallback = async (token: string) => {
    await loginHandler(token);
  };

  const handleCaptchaError = () => {
    toast.error(translations.recaptchaError);
  };

  const loginHandler = async (recaptchaToken: string) => {
    setLogInLoader(true);
    try {
      const identifier = emailRef.current?.value;
      const password = passwordRef.current?.value;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/login/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            password,
            recaptchaToken,
          }),
        }
      );

      const res: LoginResponse = await response.json();
      setLogInLoader(false);
      resetCaptcha();

      if (res.jwt && res.user) {
        const {
          id,
          firstName,
          lastName,
          username,
          email: userEmail,
          bio,
          cover_image,
          photo,
        } = res.user;

        dispatch({
          type: "SET_USER",
          payload: {
            id,
            firstName,
            lastName,
            username,
            email: userEmail,
            bio,
            cover_image,
            photo,
          },
        });

        const reviewId = searchParams.get("review");
        const reviewSourceType = localStorage.getItem("_reviewSourceType");
        const tournamentId = localStorage.getItem("_tournamentId");

        localStorage.removeItem("_reviewSourceType");
        localStorage.removeItem("_tournamentId");

        if (reviewId) {
          if (reviewSourceType === "GAME") {
            router.push(
              `${process.env.NEXT_PUBLIC_BASE_URL}/slot-machines/${reviewId}/`
            );
            return;
          }
          if (reviewSourceType === "CASINO") {
            router.push(
              `${process.env.NEXT_PUBLIC_BASE_URL}/casino/recensione/${reviewId}/`
            );
            return;
          }
          router.refresh();
        } else if (tournamentId) {
          router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/tournaments/`);
        } else {
          router.push(`/dashboard/`);
        }
      } else {
        toast.error(res?.error?.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
      setLogInLoader(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadRecaptcha = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.render(recaptchaRef.current!, {
            sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
            size: "invisible",
            callback: handleCaptchaCallback,
            "error-callback": handleCaptchaError,
            "expired-callback": resetCaptcha,
          });
          setRecaptchaReady(true);
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = loadRecaptcha;
      document.body.appendChild(script);
    };

    loadRecaptcha();
  }, []);

  return (
    <form className="space-y-4 mt-6">
      <div>
        <label
          htmlFor="email"
          className="block text-blue-500 text-sm font-medium mb-[6px]"
        >
          {translations.email}
        </label>
        <input
          type="email"
          id="email"
          ref={emailRef}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder={translations.enterEmail}
          className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-[rgba(255,255,255,0.30)] focus:border-misc focus:shadow-none"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-blue-500 text-sm font-medium mb-[6px]"
        >
          {translations.password}
        </label>
        <input
          type="password"
          id="password"
          ref={passwordRef}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-[rgba(255,255,255,0.30)] focus:border-misc focus:shadow-none"
        />
      </div>

      <div ref={recaptchaRef} id="recaptcha" className="g-recaptcha" />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-grey-300 text-primary focus:ring-primary/90"
          />
          <label
            htmlFor="remember-me"
            className="ml-3 block text-sm text-blue-500"
          >
            {translations.remember30}
          </label>
        </div>

        <Link
          href="/authentication/forgot-password/"
          className="block text-base text-misc font-bold transition duration-150 ease-in-out hover:text-misc/90"
        >
          {translations.forgotPassword}
        </Link>
      </div>

      <div>
        <button
          type="button"
          onClick={validateLoginForm}
          className="flex w-full justify-center items-center rounded-md btn-secondary px-3 py-2.5 text-sm font-semibold text-white"
        >
          {logInLoader && <span className="custom-spinner mr-2" />}
          <span>
            {logInLoader ? translations.signingIn : translations.logIn}
          </span>
        </button>
      </div>
    </form>
  );
}
