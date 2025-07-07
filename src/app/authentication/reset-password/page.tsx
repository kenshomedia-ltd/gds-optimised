import { ResetPassword } from "@/components/auth/ResetPassowrd";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { Suspense } from "react";

export default async function ResetPasswordPage() {
  const { translations } = await getLayoutData({ cached: true });

  return (
    <div className="flex min-h-full items-center justify-center auth-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="auth-form-container p-10 rounded-xl w-full max-w-[440px] space-y-6">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPassword translations={translations ?? {}} />
        </Suspense>
      </div>
    </div>
  );
}
