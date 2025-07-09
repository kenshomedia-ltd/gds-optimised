// components/FooterSwitcher.tsx
"use client";

import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { LayoutDataResponse } from "@/types/strapi.types";
import { usePathname } from "next/navigation";
import { FooterClientShell } from "./FooterClientShell";

export default function FooterSwitcher({
  layoutData,
}: {
  layoutData: LayoutDataResponse;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return <DashboardFooter translations={layoutData.translations} />;
  }

  // You cannot render server components inside client components.
  // So instead, pass all footer props to a separate FooterClientShell
  return <FooterClientShell layoutData={layoutData} />;
}
