import WeeklyPickedGames from "@/components/dashboard/WeeklyPickGames";
import { getLayoutData } from "@/lib/strapi/data-loader";

export default async function FavouriteGamesPage() {
  const { translations } = await getLayoutData({ cached: true });

  return <WeeklyPickedGames translations={translations} />;
}
