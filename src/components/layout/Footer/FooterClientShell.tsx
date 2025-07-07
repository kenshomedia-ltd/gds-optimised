// components/FooterClientShell.tsx
import dynamic from "next/dynamic";
import { LayoutDataResponse } from "@/types/strapi.types";

const FooterServer = dynamic(() => import("./FooterServer").then((mod) => mod.FooterServer), {
  ssr: true,
});

export function FooterClientShell({
  layoutData,
}: {
  layoutData: LayoutDataResponse;
}) {
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
