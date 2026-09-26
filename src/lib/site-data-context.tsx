"use client";

import { createContext, useContext, type ReactNode } from "react";
import { formatPrice } from "@/lib/currency";
import type { ClientSiteData } from "@/lib/types";

const SiteDataContext = createContext<ClientSiteData | null>(null);

export function SiteDataProvider({ value, children }: { value: ClientSiteData; children: ReactNode }) {
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): ClientSiteData {
  const value = useContext(SiteDataContext);
  if (!value) throw new Error("useSiteData must be used inside <SiteDataProvider>");
  return value;
}

/** formatPrice using the CRM's currency symbol (content.header.currencySymbol). */
export function useFormatPrice(): (amount: number) => string {
  const symbol = useSiteData().content.header.currencySymbol;
  return (amount: number) => formatPrice(amount, symbol);
}
