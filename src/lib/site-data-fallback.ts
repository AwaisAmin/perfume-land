import "server-only";
import {
  beforeAfterImages,
  bottleImage,
  collections,
  featuredProduct,
  shopTheLookGroups,
} from "@/data/products";
import { brandCraft, brandValues, journeyImage } from "@/data/brand";
import { branches, whatsappNumber } from "@/data/branches";
import { brandImpressionsGroups, primaryNavEnd, primaryNavStart } from "@/data/nav";
import { content } from "@/data/content";
import type { SiteData } from "@/lib/types";

/**
 * The content bundled with the app (src/data/*.ts). Used whenever the CRM
 * API is not configured, unreachable or returns something unusable, so the
 * site never renders empty or crashes.
 */
export const fallbackSiteData: SiteData = {
  collections,
  featuredProduct,
  shopTheLookGroups,
  beforeAfterImages,
  bottleImage,
  brand: { journeyImage, brandValues, brandCraft },
  contact: { whatsappNumber, orderWhatsappNumber: whatsappNumber, branches },
  nav: { brandImpressionsGroups, primaryNavStart, primaryNavEnd },
  announcements: ["Free Delivery Over {amount}", "Delivery Across Pakistan"],
  freeShippingThreshold: 500,
  content,
  updatedAt: new Date(0).toISOString(),
};
