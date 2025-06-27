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
 * Shows limited providers to prevent CLS when client component loads
 * The client component will progressively enhance this
 */
export function CasinoPaymentSoftwareServer({
  casino,
  translations,
}: CasinoPaymentSoftwareServerProps) {
  // Helper to render payment icons (same logic as client version)
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

  // Server-side default visible count (matches client's mobile default)
  const providers = casino.providers || [];
  const visibleProviderCount = Math.min(3, providers.length);
  const visibleProviders = providers.slice(0, visibleProviderCount);
  const remainingProviders = providers.slice(visibleProviderCount);
  const remainingCount = remainingProviders.length;

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
      <div className="md:ml-4 relative">
        <div className="flex py-3 text-white items-center mb-3">
          <FontAwesomeIcon
            icon={faGamepad}
            className="w-6 h-6 text-primary mr-3"
          />
          <h5 className="text-xl font-bold text-white !mt-0">
            {translations.software || "Software"}
          </h5>
        </div>

        {/* Container with relative positioning for consistency with client */}
        <div className="relative z-0">
          <div className="flex items-center gap-1 max-w-full">
            {/* Visible provider icons */}
            <div className="flex gap-1 flex-shrink-0">
              {visibleProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white rounded p-1 w-[55px] h-[35px] flex items-center justify-center flex-shrink-0"
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

              {/* Static overflow indicator - will be replaced by interactive button on client */}
              {remainingCount > 0 && (
                <div
                  className="flex items-center justify-center bg-white rounded p-1 w-[55px] h-[35px] text-primary font-semibold"
                  aria-label={`${remainingCount} more providers`}
                >
                  +{remainingCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
