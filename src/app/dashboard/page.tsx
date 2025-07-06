import Dashboard from "@/components/dashboard/Dashboard";
import { getLayoutData } from "@/lib/strapi/data-loader";

export default async function DashboardPage() {
  const { translations } = await getLayoutData({ cached: true });
  console.log("DashboardPage");
  return <Dashboard translations={translations} />;
}
