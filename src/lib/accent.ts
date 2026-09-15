import type { Product } from "./types";

export const accentStyles: Record<
  Product["accent"],
  { bg: string; fg: string }
> = {
  forest: { bg: "bg-forest-900", fg: "text-gold-400" },
  gold: { bg: "bg-gold-500", fg: "text-forest-950" },
  cream: { bg: "bg-cream-200", fg: "text-forest-900" },
};
