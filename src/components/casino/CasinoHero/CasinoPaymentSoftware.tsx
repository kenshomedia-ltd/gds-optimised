// src/components/casino/CasinoHero/CasinoPaymentSoftware.tsx
"use client";

import { useState, useEffect } from "react";
import { CasinoPaymentSoftwareServer } from "./CasinoPaymentSoftwareServer";
import { CasinoPaymentSoftwareClient } from "./CasinoPaymentSoftwareClient";
import type { CasinoPageData } from "@/types/casino-page.types";

interface CasinoPaymentSoftwareProps {
  casino: CasinoPageData;
  translations: Record<string, string>;
}

/**
 * Progressive enhancement wrapper for CasinoPaymentSoftware
 * Shows server version immediately, then enhances with client features on all screen sizes
 */
export function CasinoPaymentSoftware(props: CasinoPaymentSoftwareProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show server version until client is ready
  if (!isClient) {
    return <CasinoPaymentSoftwareServer {...props} />;
  }

  // Show client version with overflow handling on all screen sizes
  return <CasinoPaymentSoftwareClient {...props} />;
}
