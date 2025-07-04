import DashboardSideNav from "@/components/dashboard/DashboardSideNav";
import { getLayoutData } from "@/lib/strapi/data-loader";

// app/dashboard/layout.tsx
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { translations } = await getLayoutData({ cached: true });
  return (
    <div className="dashboard-bg -mb-5 mx-auto flex w-full items-start py-5 h-[calc(100vh_-_135px)] md:h-[calc(100vh_-_99px)]">
      <DashboardSideNav slotMachineURL={""} translations={translations} />
      <div className="w-full px-4 h-full pb-[50px] overflow-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
