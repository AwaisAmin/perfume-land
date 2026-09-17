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
// The reference site itself reuses one generic bottle photo across an
// entire Brand Impressions tier (confirmed by inspecting its live pages) —
// these aren't a shortcut, they're the same placeholder-per-tier pattern
// the source site uses.
const CDN = "https://amanzadaperfumes.com/cdn/shop/files";
const CDN_COLLECTIONS = "https://amanzadaperfumes.com/cdn/shop/collections";
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
  description?: string;
  size?: string;
  stockCount?: number;
};

function product({
  title,
  price,
  compareAtPrice,
  kicker,
  image,
  gender = "unisex",
  inStock = true,
  description,
  size = "50ml",
  stockCount = 85,
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
    description,
    size,
    stockCount,
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

// Brand Impressions is one mega-menu with three groups (Perfumes / Perfume
// Oils / Interior Perfumes), each with three tiers (Standard / Premium /
// Exclusive) — nine collection pages total, all built from the exact same
// CollectionHero/CollectionView/ProductGrid architecture as Signature, just
// with a different banner, title, and product list per entry (matching the
// live site's own real handles, banners, and product names/prices,
// gathered directly from each live collection page).
export const collections: Collection[] = [
  {
    id: "standard",
    handle: "standard-collection",
    kicker: "brand impressions",
    title: "Standard Collection",
    pageTitle: "Standard Collection",
    heroImage: `${CDN_COLLECTIONS}/Home_Page_Impression_Perfume.jpg?width=3000`,
    products: [
      product({ title: "Impression of Oud Maracuja", price: 80, compareAtPrice: 744, image: DEV_IMAGE.impression }),
      product({
        title: "Impression of Vanilla Powder",
        price: 80,
        compareAtPrice: 754,
        image: DEV_IMAGE.impression,
        description:
          "Vanilla Powder is a soft, comforting fragrance featuring creamy vanilla, tonka bean, heliotrope, and subtle musks, creating a warm, powdery, and elegantly sweet aroma.",
      }),
      product({ title: "Impression of Blonde Amber", price: 80, compareAtPrice: 647, image: DEV_IMAGE.impression }),
      product({ title: "Impression of Silver Mountain Water", price: 80, compareAtPrice: 684, image: DEV_IMAGE.impression }),
      product({ title: "Impression of Aventus", price: 80, compareAtPrice: 622, image: DEV_IMAGE.impression }),
      product({ title: "Impression of Baccarat Rouge 540", price: 80, compareAtPrice: 609, image: DEV_IMAGE.impression }),
    ],
  },
  {
    id: "premium",
    handle: "premium-collection",
    kicker: "brand impressions",
    title: "Premium Collection",
    pageTitle: "Premium Collection",
    heroImage: `${CDN_COLLECTIONS}/Home_Page_Impression_Perfume_8bf7321b-382a-4155-a426-d53baa01cd56.jpg?width=3000`,
    products: [
      product({ title: "Impression of Haute Luxe", price: 180, compareAtPrice: 674, image: DEV_IMAGE.impression }),
      product({ title: "Impression of Elysium", price: 180, compareAtPrice: 633, image: DEV_IMAGE.impression }),
      product({ title: "Impression of The Night Layl", price: 180, compareAtPrice: 718, image: DEV_IMAGE.impression }),
      product({ title: "Impression of Amber Aoud", price: 180, compareAtPrice: 694, image: DEV_IMAGE.impression }),
      product({ title: "Impression of United Arab Emirates", price: 180, compareAtPrice: 651, image: DEV_IMAGE.impression }),
      product({ title: "Impression of Sultanate of Oman", price: 180, compareAtPrice: 673, image: DEV_IMAGE.impression }),
    ],
  },
  {
    id: "exclusive",
    handle: "exclusive-collection",
    kicker: "brand impressions",
    title: "Exclusive Collection",
    pageTitle: "Exclusive Collection",
    heroImage: `${CDN_COLLECTIONS}/Home_Page_Impression_Perfume_24d8f0fc-67f1-43d6-a58a-3622d39cf1fb.jpg?width=3000`,
    products: [
      product({ title: "Impression of Imagination", price: 140, compareAtPrice: 775, image: DEV_IMAGE.impression }),
      product({ title: "Impression of Purpose 50", price: 140, compareAtPrice: 724, image: DEV_IMAGE.impression }),
      product({ title: "Impression of Decision", price: 140, compareAtPrice: 635, image: DEV_IMAGE.impression }),
      product({ title: "Impression of Guidance 46", price: 140, compareAtPrice: 674, image: DEV_IMAGE.impression }),
      product({ title: "Impression of California Dream", price: 140, compareAtPrice: 764, image: DEV_IMAGE.impression }),
      product({ title: "Impression of Pacific Chill", price: 140, compareAtPrice: 607, image: DEV_IMAGE.impression }),
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
    title: "Standard Collection Oil",
    pageTitle: "Standard Collection Oil",
    heroImage: `${CDN_COLLECTIONS}/Perfume_Oil_Banner_f114e607-e385-4d65-89ac-71557c3dc49e.png?width=3008`,
    products: [
      product({ title: "Aventus - Perfume Oil", price: 45, image: DEV_IMAGE.oil }),
      product({ title: "Aventus Absolute - Perfume Oil", price: 45, image: DEV_IMAGE.oil }),
      product({ title: "Baccarat Rouge 540 - Perfume Oil", price: 45, image: DEV_IMAGE.oil }),
      product({ title: "Interlude - Perfume Oil", price: 45, image: DEV_IMAGE.oil }),
      product({ title: "Outlands - Perfume Oil", price: 45, image: DEV_IMAGE.oil }),
      product({ title: "Coco Channel - Perfume Oil", price: 45, image: DEV_IMAGE.oil }),
    ],
  },
  {
    id: "premium-oil",
    handle: "premium-collection-oil",
    kicker: "concentrated oils",
    title: "Premium Collection Oil",
    pageTitle: "Premium Collection Oil",
    heroImage: `${CDN_COLLECTIONS}/Perfume_Oil_Banner_2def5b7d-bd88-424f-ae58-f3a5efc41432.png?width=3008`,
    products: [
      product({ title: "The Night Layl - Perfume Oil", price: 85, image: DEV_IMAGE.oil }),
      product({ title: "Elysium - Perfume Oil", price: 85, image: DEV_IMAGE.oil }),
      product({ title: "Haute Luxe - Perfume Oil", price: 85, image: DEV_IMAGE.oil }),
      product({ title: "Sweetie Aoud - Perfume Oil", price: 85, image: DEV_IMAGE.oil }),
      product({ title: "Amber Aoud - Perfume Oil", price: 85, image: DEV_IMAGE.oil }),
      product({ title: "Pur Oud - Perfume Oil", price: 85, image: DEV_IMAGE.oil }),
    ],
  },
  {
    id: "exclusive-oil",
    handle: "exclusive-collection-oil",
    kicker: "concentrated oils",
    title: "Exclusive Collection Oil",
    pageTitle: "Exclusive Collection Oil",
    heroImage: `${CDN_COLLECTIONS}/Perfume_Oil_Banner.png?width=3008`,
    products: [
      product({ title: "Imagination - Perfume Oil", price: 65, image: DEV_IMAGE.oil }),
      product({ title: "Oud Royal - Perfume Oil", price: 65, image: DEV_IMAGE.oil }),
      product({ title: "California Dream - Perfume Oil", price: 65, image: DEV_IMAGE.oil }),
      product({ title: "Megamare - Perfume Oil", price: 65, image: DEV_IMAGE.oil }),
      product({ title: "Purpose 50 - Perfume Oil", price: 65, image: DEV_IMAGE.oil }),
      product({ title: "Gris Charnel - Perfume Oil", price: 65, image: DEV_IMAGE.oil }),
    ],
  },
  {
    id: "interior",
    handle: "standard-collection-interior-perfumes",
    kicker: "for your space",
    title: "Standard Collection Interior Perfumes",
    pageTitle: "Standard Collection Interior Perfumes",
    heroImage: `${CDN_COLLECTIONS}/Interior_Perfume_banner.png?width=3008`,
    products: [
      product({ title: "Interlude - Interior Perfumes", price: 150, image: DEV_IMAGE.interior }),
      product({ title: "Outlands - Interior Perfumes", price: 150, image: DEV_IMAGE.interior }),
      product({ title: "Amber Nuit - Interior Perfumes", price: 150, image: DEV_IMAGE.interior }),
      product({ title: "Spice Blend - Interior Perfumes", price: 150, image: DEV_IMAGE.interior }),
      product({ title: "Le Sables Rose - Interior Perfumes", price: 150, image: DEV_IMAGE.interior }),
      product({ title: "Oud Wood - Interior Perfumes", price: 150, image: DEV_IMAGE.interior }),
    ],
  },
  {
    id: "premium-interior",
    handle: "premium-collection-interior-perfumes",
    kicker: "for your space",
    title: "Premium Collection Interior Perfumes",
    pageTitle: "Premium Collection Interior Perfumes",
    heroImage: `${CDN_COLLECTIONS}/Interior_Perfume_banner_3f590435-b94f-42f4-9b6d-d8db156de4a6.png?width=3008`,
    products: [
      product({ title: "The Night Layl - Interior Perfumes", price: 200, image: DEV_IMAGE.interior }),
      product({ title: "Pur Oud - Interior Perfumes", price: 200, image: DEV_IMAGE.interior }),
      product({ title: "Amber Extrait - Interior Perfumes", price: 200, image: DEV_IMAGE.interior }),
      product({ title: "Elysium - Interior Perfumes", price: 200, image: DEV_IMAGE.interior }),
      product({ title: "H Aoud - Interior Perfumes", price: 200, image: DEV_IMAGE.interior }),
      product({ title: "Haute Luxe - Interior Perfumes", price: 200, image: DEV_IMAGE.interior }),
    ],
  },
  {
    id: "exclusive-interior",
    handle: "exclusive-collection-interior-perfumes",
    kicker: "for your space",
    title: "Exclusive Collection Interior Perfumes",
    pageTitle: "Exclusive Collection Interior Perfumes",
    heroImage: `${CDN_COLLECTIONS}/Interior_Perfume_banner_6c1c103d-a99b-48e0-937a-50a939c39fa0.png?width=3008`,
    products: [
      product({ title: "Falkar - Interior Perfumes", price: 175, image: DEV_IMAGE.interior }),
      product({ title: "California Dream - Interior Perfumes", price: 175, image: DEV_IMAGE.interior }),
      product({ title: "Promise - Interior Perfumes", price: 175, image: DEV_IMAGE.interior }),
      product({ title: "Amber Aoud - Interior Perfumes", price: 200, image: DEV_IMAGE.interior }),
      product({ title: "Guidance 46 - Interior Perfumes", price: 175, image: DEV_IMAGE.interior }),
      product({ title: "Purpose 50 - Interior Perfumes", price: 175, image: DEV_IMAGE.interior }),
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
