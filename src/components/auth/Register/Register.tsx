"use client";

import { TUser } from "@/types/user.types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
// import Link from "@/components/helpers/Link";
// import { setUser } from "@/stores/authStore";

interface RegisterProps {
  translations: Record<string, string>;
}

interface RegisterResponse {
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

export function Register({ translations }: RegisterProps) {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [newsletter, setNewsletter] = useState<boolean>(false);
  const [registerLoader, setRegisterLoader] = useState<boolean>(false);
  const [isRegistrationSuccessfull, setIsRegistrationSuccessfull] =
    useState<boolean>(false);
  const [recaptchaReady, setRecaptchaReady] = useState<boolean>(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const newsletterRef = useRef<HTMLInputElement>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  const validateRegisterForm = () => {
    if (!firstName || !lastName || !email || !username || !password) {
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
    await registerHandler(token);
  };

  const handleCaptchaError = () => {
    toast.error(translations.recaptchaError);
  };

  const registerHandler = async (recaptchaToken: string) => {
    setRegisterLoader(true);
    try {
      const payload = {
        firstName: firstNameRef.current?.value,
        lastName: lastNameRef.current?.value,
        username: usernameRef.current?.value,
        email: emailRef.current?.value,
        password: passwordRef.current?.value,
        newsletter: newsletterRef.current?.checked,
        recaptchaToken,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FULL_URL}/api/auth/register/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const res: RegisterResponse = await response.json();
      resetCaptcha();

      if (res?.error) {
        toast.error(res?.error?.message || "Registration failed");
      } else {
        setIsRegistrationSuccessfull(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setRegisterLoader(false);
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
    <>
      {isRegistrationSuccessfull ? (
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-blue-700 text-[32px] font-bold leading-[38px]">
            {translations.registrationSuccessful}
          </h2>
          <p className="text-base text-blue-500">
            {translations.confirmationEmailDesc}
            <span className="text-misc font-bold">{email}</span>.
          </p>
          <p className="text-sm text-blue-500">
            {translations.checkSpamMessage}.
          </p>
          <Link
            href={"/authentication/login/"}
            className="block text-center min-h-[44px] rounded-md btn-secondary px-3 py-2.5 text-sm font-semibold"
          >
            {translations.backToSignIn}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="text-blue-700 text-[32px] font-bold leading-[38px]">
              {translations.signUp}
            </h2>
            <p className="text-base text-blue-500">
              {translations.registrationPageSubtitle}
            </p>
          </div>
          <form className="space-y-4 mt-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-blue-500 text-sm font-medium mb-[6px]"
              >
                {translations.firstName}
              </label>
              <input
                type="text"
                id="firstName"
                ref={firstNameRef}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder={translations.enterFirstName}
                className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-[rgba(255,255,255,0.30)] focus:border-misc focus:shadow-none"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-blue-500 text-sm font-medium mb-[6px]"
              >
                {translations.lastName}
              </label>
              <input
                type="text"
                id="lastName"
                ref={lastNameRef}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder={translations.enterLastName}
                className="w-full py-2.5 px-[14px] text-base text-[#000] rounded border border-[rgba(255,255,255,0.30)] focus:border-misc focus:shadow-none"
              />
            </div>
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
                htmlFor="username"
                className="block text-blue-500 text-sm font-medium mb-[6px]"
              >
                {translations.username}
              </label>
              <input
                type="text"
                id="username"
                ref={usernameRef}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={translations.enterUsername}
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
                  id="newsletter-checkbox"
                  name="newsletterCheckbox"
                  ref={newsletterRef}
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  type="checkbox"
                  className="h-4 w-4 rounded border-grey-300 text-primary focus:ring-primary/90"
                />
                <label
                  htmlFor="newsletter-checkbox"
                  className="ml-3 block text-sm text-blue-500"
                >
                  {translations.subscribeNewsletter}
                </label>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={validateRegisterForm}
                className="flex w-full justify-center items-center rounded-md btn-secondary px-3 py-2.5 text-sm font-semibold text-white"
              >
                {registerLoader && <span className="custom-spinner mr-2" />}
                <span>
                  {registerLoader
                    ? translations.pleaseWait
                    : translations.signUp}
                </span>
              </button>
            </div>
          </form>
          <div className="text-center">
            <p className="text-sm text-blue-500 !mb-2">
              {translations.checkSpamMessage}
            </p>
            <p className="text-center text-base text-blue-500 !mb-0">
              {translations.haveAccount}{" "}
              <Link
                href={"/authentication/login/"}
                className="-m-3 font-bold rounded-md p-3 transition duration-150 ease-in-out text-misc hover:text-misc/90"
              >
                {translations.logIn}
              </Link>
            </p>
          </div>
        </>
      )}
    </>
  );
}
