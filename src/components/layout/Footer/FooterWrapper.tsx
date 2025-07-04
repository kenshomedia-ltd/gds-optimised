import { FooterServer } from "./FooterServer";
import { LayoutDataResponse } from "@/types/strapi.types";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { headers } from "next/headers";

export async function FooterWrapper({
  layoutData,
}: {
  layoutData: LayoutDataResponse;
}) {
  const headersList = await headers();
  const pathname = (await headersList.get("x-pathname")) || "";
  const isDashboard = pathname.startsWith("/dashboard");
  // const pathname = usePathname();
  // const isDashboard = pathname.startsWith("/dashboard");

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
