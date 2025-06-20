// src/components/casino/CasinoHero/CasinoPaymentSoftwareServer.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faGamepad,
} from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import { Image } from "@/components/common/Image";
import type { CasinoPageData } from "@/types/casino-page.types";

interface CasinoPaymentSoftwareServerProps {
  casino: CasinoPageData;
  translations: Record<string, string>;
}

/**
 * Server-side version of CasinoPaymentSoftware
 * Shows all providers without interactive features
 * The client component will progressively enhance this
 */
export function CasinoPaymentSoftwareServer({
  casino,
  translations,
}: CasinoPaymentSoftwareServerProps) {
  // Helper to render payment icons (same logic as original working version)
  const renderPaymentIcons = () => {
    const paymentIcons: React.ReactElement[] = [];

    // Use payment channels if available
    if (casino.paymentChannels && casino.paymentChannels.length > 0) {
      return casino.paymentChannels.map((channel) => (
        <span
          key={channel.id}
          className="payment-icon block bg-white rounded p-1"
        >
          <Image
            src={channel.logo?.url || ""}
            alt={channel.name}
            width={45}
            height={28}
            className="w-[45px] h-[28px] object-contain"
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
              className="payment-icon block bg-white rounded p-1"
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

    return paymentIcons.length > 0 ? (
      paymentIcons
    ) : (
      <span className="text-white text-sm">
        {translations.noPaymentMethods || "Payment methods not specified"}
      </span>
    );
  };

  const providers = casino.providers || [];

  return (
    <div className="grid md:grid-cols-2 mt-5">
      {/* Payment Methods */}
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

        <div className="flex flex-wrap gap-2">{renderPaymentIcons()}</div>
      </div>

      {/* Software Providers */}
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

        {/* Show all providers in a wrapping layout for server-side */}
        <div className="flex flex-wrap gap-1">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="provider-icon bg-white rounded p-1 w-[55px] h-[35px] flex items-center justify-center"
              title={provider.title}
            >
              {provider.images?.url ? (
                <Image
                  src={provider.images.url}
                  alt={provider.title || "Provider"}
                  width={45}
                  height={28}
                  className="object-contain"
                />
              ) : (
                <span className="text-xs text-gray-500 text-center">
                  {provider.title || "Provider"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
