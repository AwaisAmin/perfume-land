import type { Collection, Product } from "@/lib/types";

let autoId = 0;

function product(
  title: string,
  price: number,
  compareAtPrice: number,
  kicker?: string,
): Product {
  autoId += 1;
  return {
    id: `product-${autoId}`,
    handle: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title,
    kicker,
    price,
    compareAtPrice,
  };
}

export const collections: Collection[] = [
  {
    id: "signature",
    handle: "signature-collection",
    kicker: "made in dubai",
    title: "Signature Fragrances",
    products: [
      product("Oud Royale", 249, 620),
      product("Amber Noir", 229, 560),
      product("Velvet Musk", 259, 640),
      product("Golden Saffron", 239, 590),
    ],
  },
  {
    id: "standard",
    handle: "standard-collection",
    kicker: "brand impressions",
    title: "Standard Collection",
    products: [
      product("Impression of Oud Maracuja", 80, 744),
      product("Impression of Vanilla Powder", 80, 754),
      product("Impression of Blonde Amber", 80, 647),
      product("Impression of Silver Mountain Water", 80, 684),
    ],
  },
  {
    id: "oil",
    handle: "standard-collection-oil",
    kicker: "concentrated oils",
    title: "Attar & Oil Collection",
    products: [
      product("Rose Attar Oil", 95, 320),
      product("Sandalwood Oil", 110, 360),
      product("Oud Mukhallat", 150, 480),
      product("Amber Musk Oil", 105, 340),
    ],
  },
  {
    id: "interior",
    handle: "standard-collection-interior-perfumes",
    kicker: "for your space",
    title: "Interior Perfumes",
    products: [
      product("Bakhoor Home Mist", 65, 180),
      product("Oud Room Spray", 70, 190),
      product("Jasmine Air Diffuser", 75, 210),
      product("Amber Linen Spray", 68, 185),
    ],
  },
];

export const featuredProduct: Product = product(
  "Amanzada Back to Black Oud",
  185,
  460,
  "Our selection",
);
