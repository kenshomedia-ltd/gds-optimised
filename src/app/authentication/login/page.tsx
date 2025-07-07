import { Login } from "@/components/auth/Login";
import { getLayoutData } from "@/lib/strapi/data-loader";
import Link from "next/link";

export default async function LoginPage() {
  const { translations } = await getLayoutData({ cached: true });

  return (
    <div className="flex min-h-full items-center justify-center auth-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="auth-form-container p-10 rounded-xl w-full max-w-[440px] space-y-6">
        <div className="space-y-3">
          <h2 className="text-blue-700 text-[32px] font-bold leading-[38px]">
            {translations?.logIn}
          </h2>
          <p className="text-base text-blue-500">
            {translations?.loginPageSubtitle}
          </p>
        </div>

        <Login translations={translations ?? {}} />
        <p className="text-center text-base text-blue-500 !mb-0">
          {translations?.noAccount}{" "}
          <Link
            href={"/authentication/register/"}
            className="-m-3 font-bold rounded-md p-3 transition duration-150 ease-in-out text-misc hover:text-misc/90"
          >
            {translations?.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
