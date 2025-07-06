import { LayoutDataResponse } from "@/types/strapi.types";
import FooterSwitcher from "./FooterSwitcher";

export async function FooterWrapper({
  layoutData,
}: {
  layoutData: LayoutDataResponse;
}) {
  return <FooterSwitcher layoutData={layoutData} />;
}
