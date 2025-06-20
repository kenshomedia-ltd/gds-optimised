// src/components/casino/CasinoHero/CasinoPaymentSoftwareServer.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faGamepadModern,
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
  // Handle both data structures for payment channels
  const paymentChannels = Array.isArray(casino.paymentChannels)
    ? casino.paymentChannels
    : casino.paymentChannels?.data || [];
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

        <div className="flex flex-wrap gap-2">
          {paymentChannels.length > 0 ? (
            paymentChannels.map((channel: any) => {
              // Handle both direct and nested data structures
              const logoUrl =
                channel.attributes?.logo?.data?.attributes?.url ||
                channel.logo?.data?.attributes?.url ||
                channel.logo?.url ||
                "";
              const name =
                channel.attributes?.name || channel.name || "Payment";

              return (
                <span
                  key={channel.id}
                  className="payment-icon block bg-white rounded p-1"
                >
                  <Image
                    src={logoUrl}
                    alt={name}
                    width={45}
                    height={28}
                    className="w-[45px] h-[28px] object-contain"
                  />
                </span>
              );
            })
          ) : (
            <span className="text-white text-sm">
              {translations.noPaymentMethods || "Payment methods not specified"}
            </span>
          )}
        </div>
      </div>

      {/* Software Providers */}
      <div className="md:ml-4">
        <div className="flex py-3 text-white items-center mb-3">
          <FontAwesomeIcon
            icon={faGamepadModern}
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
