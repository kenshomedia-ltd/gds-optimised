import Messages from "@/components/dashboard/Messages";
import { getLayoutData } from "@/lib/strapi/data-loader";

export default async function MostPlayedGamesPage() {
  const { translations } = await getLayoutData({ cached: true });

  return <Messages translations={translations} />;
}
