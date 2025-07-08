import MostPlayedGames from "@/components/dashboard/MostPlayedGames";
import { getLayoutData } from "@/lib/strapi/data-loader";

export default async function MostPlayedGamesPage() {
  const { translations } = await getLayoutData({ cached: true });

  return <MostPlayedGames translations={translations} />;
}
