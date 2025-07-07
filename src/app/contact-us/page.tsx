import ContactUsForm from "@/components/ContactUsForm/ContactUsForm";
import { getLayoutData } from "@/lib/strapi/data-loader";

export default async function FavouriteGamesPage() {
  const { translations } = await getLayoutData({ cached: true });

  return <ContactUsForm translations={translations} />;
}
