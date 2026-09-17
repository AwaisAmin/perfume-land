import type { Collection, FeaturedProductData, Product } from "@/lib/types";

export type ShopTheLookItem = {
  handle: string;
  title: string;
  price: number;
  image: string;
  /** Hot-spot position on the group photo, as a percentage. */
  top: number;
  left: number;
};

/**
 * A single "look" — one lifestyle photo plus the hot-spotted products shown
 * on it. The reference theme supports multiple looks (its markup literally
 * IDs them "look-1", "look-2", ...), so this is an array, not one hardcoded
 * image: adding a second look (e.g. your own custom photography) later is
 * just another entry here, no component changes needed.
 */
export type ShopTheLookGroup = {
  image: string;
  items: ShopTheLookItem[];
};

let autoId = 0;

// DEV-ONLY placeholders — hotlinked from the reference site's own CDN so we
// have real product photos to check layout/spacing against locally. Swap
// every product's `image` for your own photography before this ever ships.
const CDN = "https://amanzadaperfumes.com/cdn/shop/files";
const DEV_IMAGE = {
  impression: `${CDN}/Impressions_Perfume_Bottle_Main.png?width=1124`,
  backToBlackOud: `${CDN}/BackToBlackOudWeb.png?width=1124`,
  oil: `${CDN}/Perfume_Oil_Main.jpg?width=1124`,
  interior: `${CDN}/Interior_Perfume_Bottle_MAIN.jpg?width=1124`,
};

// DEV-ONLY: the before/after slider's two photos. Swap for your own shoot
// before this ships — same 5094x2842 (~16:9) crop keeps the layout intact.
export const beforeAfterImages = {
  him: `${CDN}/For_Him.jpg?width=2200`,
  her: `${CDN}/For_Her.jpg?width=2200`,
};

type ProductInput = {
  title: string;
  price: number;
  compareAtPrice?: number;
  kicker?: string;
  image?: string;
  gender?: Product["gender"];
  inStock?: boolean;
};

function product({
  title,
  price,
  compareAtPrice,
  kicker,
  image,
  gender = "unisex",
  inStock = true,
}: ProductInput): Product {
  autoId += 1;
  return {
    id: `product-${autoId}`,
    handle: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title,
    kicker,
    price,
    compareAtPrice,
    image,
    gender,
    inStock,
  };
}

// The "Signature Fragrances" section isn't a plain grid on the reference
// site — it's a shoppable lifestyle photo with hot spots. See ShopTheLook.
// DEV-ONLY: swap `image` (the group photo) and each item's `image` for your
// own photography before this ships — nothing else needs to change.
export const shopTheLookGroups: ShopTheLookGroup[] = [
  {
    image: `${CDN}/Luxury_Perfume_Collection.png?width=1400`,
    items: [
      {
        handle: "amanzada-back-to-black-oud",
        title: "Amanzada - Back To Black Oud",
        price: 280,
        image: `${CDN}/BackToBlackOudWeb.png?width=800`,
        top: 25,
        left: 40,
      },
      {
        handle: "amanzada-cannabis",
        title: "Amanzada - Cannabis",
        price: 280,
        image: `${CDN}/CannabisWeb.png?width=800`,
        top: 49,
        left: 72,
      },
      {
        handle: "amanzada-cherry-love",
        title: "Amanzada - Cherry Love",
        price: 280,
        image: `${CDN}/CherryLoveWeb.png?width=800`,
        top: 49,
        left: 29,
      },
      {
        handle: "amanzada-oud-absolute",
        title: "Amanzada - Oud Absolute",
        price: 280,
        image: `${CDN}/OudAbsoluteWeb.png?width=800`,
        top: 25,
        left: 60,
      },
      {
        handle: "amanzada-heavenly-oud",
        title: "Amanzada - Heavenly Oud",
        price: 280,
        image: `${CDN}/HeavenlyOud.png?width=800`,
        top: 49,
        left: 50,
      },
    ],
  },
];

export const collections: Collection[] = [
  {
    id: "standard",
    handle: "standard-collection",
    kicker: "brand impressions",
    title: "Standard Collection",
    products: [
      product({
        title: "Impression of Oud Maracuja",
        price: 80,
        compareAtPrice: 744,
        image: DEV_IMAGE.impression,
      }),
      product({
        title: "Impression of Vanilla Powder",
        price: 80,
        compareAtPrice: 754,
        image: DEV_IMAGE.impression,
      }),
      product({
        title: "Impression of Blonde Amber",
        price: 80,
        compareAtPrice: 647,
        image: DEV_IMAGE.impression,
      }),
      product({
        title: "Impression of Silver Mountain Water",
        price: 80,
        compareAtPrice: 684,
        image: DEV_IMAGE.impression,
      }),
    ],
  },
  {
    // The reference site shows this same collection three times: as a
    // plain grid right after the marquees, as the interactive ShopTheLook
    // hot-spot component, and as its own full collection page — all share
    // the same 6 products and photography. `handle` matches the live
    // collection's real URL (/collections/signature-collection) so this
    // one entry drives the homepage grid, ShopTheLook, and the collection
    // page's dynamic [handle] route alike.
    id: "signature",
    handle: "signature-collection",
    kicker: "made in dubai",
    title: "Signature Fragrances",
    pageTitle: "Signature Collection",
    heroImage: `${CDN.replace("/files", "/collections")}/Signature_Home_Image.png?width=1942`,
    products: [
      product({
        title: "Amanzada - Cannabis",
        price: 280,
        image: `${CDN}/CannabisWeb.png?width=1124`,
      }),
      product({
        title: "Amanzada - Back To Black Oud",
        price: 280,
        image: `${CDN}/BackToBlackOudWeb.png?width=1124`,
      }),
      product({
        title: "Amanzada - Cherry Love",
        price: 280,
        image: `${CDN}/CherryLoveWeb.png?width=1124`,
        gender: "women",
      }),
      product({
        title: "Amanzada - Heavenly Oud",
        price: 280,
        image: `${CDN}/HeavenlyOud.png?width=1124`,
      }),
      product({
        title: "Amanzada - Oud Absolute",
        price: 280,
        image: `${CDN}/OudAbsoluteWeb.png?width=1124`,
      }),
      product({
        title: "Amanzada - Back To Black",
        price: 280,
        image: `${CDN}/BackToBlackWeb.png?width=1124`,
      }),
    ],
  },
  {
    id: "oil",
    handle: "standard-collection-oil",
    kicker: "concentrated oils",
    title: "Attar & Oil Collection",
    products: [
      product({ title: "Rose Attar Oil", price: 95, compareAtPrice: 320, image: DEV_IMAGE.oil }),
      product({ title: "Sandalwood Oil", price: 110, compareAtPrice: 360, image: DEV_IMAGE.oil }),
      product({ title: "Oud Mukhallat", price: 150, compareAtPrice: 480, image: DEV_IMAGE.oil }),
      product({ title: "Amber Musk Oil", price: 105, compareAtPrice: 340, image: DEV_IMAGE.oil }),
    ],
  },
  {
    id: "interior",
    handle: "standard-collection-interior-perfumes",
    kicker: "for your space",
    title: "Interior Perfumes",
    products: [
      product({
        title: "Bakhoor Home Mist",
        price: 65,
        compareAtPrice: 180,
        image: DEV_IMAGE.interior,
      }),
      product({
        title: "Oud Room Spray",
        price: 70,
        compareAtPrice: 190,
        image: DEV_IMAGE.interior,
      }),
      product({
        title: "Jasmine Air Diffuser",
        price: 75,
        compareAtPrice: 210,
        image: DEV_IMAGE.interior,
      }),
      product({
        title: "Amber Linen Spray",
        price: 68,
        compareAtPrice: 185,
        image: DEV_IMAGE.interior,
      }),
    ],
  },
];

export const featuredProduct: FeaturedProductData = {
  handle: "impression-of-imagination",
  title: "Impression of Imagination",
  description:
    "A dreamy, vibrant fragrance blending orange, rose, jasmine, musk, and woods, creating a playful, uplifting aroma.",
  image: DEV_IMAGE.impression,
  variants: [
    { size: "50ml", price: 140, compareAtPrice: 775 },
    { size: "100ml", price: 180, compareAtPrice: 840 },
  ],
};
