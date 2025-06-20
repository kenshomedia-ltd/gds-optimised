// src/components/casino/CasinoHero/CasinoPaymentSoftware.tsx

import { Image } from "@/components/common/Image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faGamepad,
} from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import type { CasinoPageData } from "@/types/casino-page.types";
import type { GameProvider } from "@/types/game.types";

interface CasinoPaymentSoftwareProps {
  casino: CasinoPageData;
  translations: Record<string, string>;
}

export function CasinoPaymentSoftware({
  casino,
  translations,
}: CasinoPaymentSoftwareProps) {

  console.log('casino', casino);
  // Helper to render payment icons
  const renderPaymentIcons = () => {
    const paymentIcons: React.ReactElement[] = [];

    // Use payment channels if available
    if (casino.paymentChannels && casino.paymentChannels.length > 0) {
      return casino.paymentChannels.map((channel) => (
        <span
          key={channel.id}
          className="payment-icon block bg-white rounded p-1 mr-2 mb-2"
        >
          <Image
            src={channel.logo?.url || ""}
            className="w-full rounded"
            alt={channel.name}
            width={55}
            height={28}
          />
        </span>
      ));
    }

    // Fallback to payment options flags
    if (casino.paymentOptions) {
      const { paymentOptions } = casino;

      const paymentMap = [
        {
          enabled: paymentOptions.wireTransfer,
          icon: "wire",
          name: "Wire Transfer",
        },
        { enabled: paymentOptions.skrill, icon: "skrill", name: "Skrill" },
        {
          enabled: paymentOptions.postepay,
          icon: "postepay",
          name: "Postepay",
        },
        { enabled: paymentOptions.paysafe, icon: "paysafe", name: "Paysafe" },
        { enabled: paymentOptions.paypal, icon: "paypal", name: "PayPal" },
        {
          enabled: paymentOptions.neteller,
          icon: "neteller",
          name: "Neteller",
        },
        { enabled: paymentOptions.ukash, icon: "ukash", name: "Ukash" },
        {
          enabled: paymentOptions.creditCard,
          icon: "debit",
          name: "Credit Card",
        },
      ];

      paymentMap.forEach(({ enabled, icon, name }) => {
        if (enabled) {
          paymentIcons.push(
            <span
              key={icon}
              className="payment-icon block bg-white rounded p-1 mr-2 mb-2"
            >
              <Image
                src={`/images/payments/${icon}.svg`}
                alt={name}
                width={45}
                height={28}
                className="w-[45px] h-[28px]"
                isLocal={true}
                priority
              />
            </span>
          );
        }
      });
    }

    return paymentIcons;
  };

  return (
    <div className="grid md:grid-cols-2 mt-5">
      {/* Payment Methods Section */}
      <div className="border-b md:border-r md:border-b-0 mb-5 pb-5 border-gray-500">
        <div className="flex py-3 items-center mb-3">
          <FontAwesomeIcon
            icon={faCreditCard}
            className="w-6 h-6 text-primary mr-3"
          />
          <h5 className="text-xl font-bold text-white !mt-0">
            {translations.payment || "Payment"}
          </h5>
        </div>
        <div className="flex flex-wrap">{renderPaymentIcons()}</div>
      </div>

      {/* Software Providers Section */}
      <div className="md:ml-4">
        <div className="flex py-3 text-white items-center mb-3">
          <FontAwesomeIcon
            icon={faGamepad}
            className="w-6 h-6 text-primary mr-3"
          />
          <h5 className="text-xl font-bold text-white !mt-0">
            {translations.software || "Software"}
          </h5>
        </div>
        <div className="flex">
          <div className="provider-img-container flex flex-wrap">
            {casino.providers && casino.providers.length > 0 && (
              <ProviderIcons providers={casino.providers} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Provider Icons Component
function ProviderIcons({ providers }: { providers: GameProvider[] }) {
  return (
    <>
      {providers.slice(0, 10).map((provider) => (
        <span
          key={provider.id}
          className="inline-block m-1 p-1 bg-white rounded border border-gray-200"
          title={provider.title}
        >
          <Image
            src={provider.images?.url || ""}
            alt={provider.title}
            width={45}
            height={28}
            className="w-[45px] h-[28px]"
          />
        </span>
      ))}
      {providers.length > 10 && (
        <span className="inline-flex items-center justify-center m-1 px-2 text-sm text-gray-600">
          +{providers.length - 10}
        </span>
      )}
    </>
  );
}
