"use client";

import { usePathname } from "next/navigation";
import { FooterServer } from "./FooterServer";
import { LayoutDataResponse } from "@/types/strapi.types";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

export function FooterWrapper({
  layoutData,
}: {
  layoutData: LayoutDataResponse;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard)
    return <DashboardFooter translations={layoutData.translations} />;

  return (
    <FooterServer
      footerContent={layoutData.layout.footerContent}
      footerImages={layoutData.layout.footerImages}
      footerNavigation={layoutData.navigation.footerNavigation}
      footerNavigations={layoutData.navigation.footerNavigations}
      translations={layoutData.translations}
    />
  );
}
