// src/components/casino/CasinoHero/CasinoPaymentSoftwareClient.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faGamepad,
} from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import { Image } from "@/components/common/Image";
import type { CasinoPageData } from "@/types/casino-page.types";
import { cn } from "@/lib/utils/cn";

interface CasinoPaymentSoftwareClientProps {
  casino: CasinoPageData;
  translations: Record<string, string>;
}

export function CasinoPaymentSoftwareClient({
  casino,
  translations,
}: CasinoPaymentSoftwareClientProps) {
  const [showAllProviders, setShowAllProviders] = useState(false);
  const [visibleProviderCount, setVisibleProviderCount] = useState(7);
  const containerRef = useRef<HTMLDivElement>(null);
  const providersRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const isOverflowButton = target.closest(".provider-overflow-btn");
      const isPopup = target.closest(".provider-popup");

      if (!isOverflowButton && !isPopup && showAllProviders) {
        setShowAllProviders(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showAllProviders]);

  // Calculate how many providers can fit
  useEffect(() => {
    const calculateVisibleProviders = () => {
      if (!containerRef.current || !casino.providers) return;

      const containerWidth = containerRef.current.offsetWidth;
      const isMobile = window.innerWidth < 640; // sm breakpoint

      if (isMobile) {
        // On mobile, show max 4 icons + overflow button
        setVisibleProviderCount(Math.min(4, casino.providers.length));
      } else {
        // On desktop, calculate based on available space
        const iconWidth = 56; // Width of each icon including gap (55px + 1px gap)
        const moreBoxWidth = 56; // Width of the "+X" box
        const availableWidth = containerWidth - moreBoxWidth;

        // Calculate max visible - minimum 2 to make room for the +X box
        const maxVisible = Math.max(2, Math.floor(availableWidth / iconWidth));

        setVisibleProviderCount(Math.min(maxVisible, casino.providers.length));
      }
    };

    calculateVisibleProviders();
    window.addEventListener("resize", calculateVisibleProviders);

    return () =>
      window.removeEventListener("resize", calculateVisibleProviders);
  }, [casino.providers]);

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

        <div ref={containerRef} className="relative overflow-hidden">
          <div className="flex items-center gap-1 max-w-full">
            {/* Visible provider icons */}
            <div ref={providersRef} className="flex gap-1 flex-shrink-0">
              {visibleProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="provider-icon bg-white rounded p-1 w-[55px] h-[35px] flex items-center justify-center flex-shrink-0"
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

            {/* Overflow button */}
            {remainingCount > 0 && (
              <button
                onClick={() => setShowAllProviders(!showAllProviders)}
                className={cn(
                  "provider-overflow-btn",
                  "flex items-center justify-center",
                  "bg-white rounded p-1 w-[55px] h-[35px]",
                  "text-primary font-semibold",
                  "hover:bg-gray-100 transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
                aria-label={`Show ${remainingCount} more providers`}
                type="button"
              >
                +{remainingCount}
              </button>
            )}
          </div>

          {/* Provider popup */}
          {showAllProviders && remainingCount > 0 && (
            <div className="provider-popup absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-xl p-4 z-50 max-h-60 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {remainingProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="provider-icon bg-gray-100 rounded p-2 w-[60px] h-[40px] flex items-center justify-center"
                    title={provider.title}
                  >
                    {provider.images?.url ? (
                      <Image
                        src={provider.images.url}
                        alt={provider.title || "Provider"}
                        width={50}
                        height={30}
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
          )}
        </div>
      </div>
    </div>
  );
}
