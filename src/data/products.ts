import type { Collection, Product } from "@/lib/types";

let autoId = 0;

// DEV-ONLY placeholders — hotlinked from the reference site's own CDN so we
// have real product photos to check layout/spacing against locally. Swap
// every product's `image` for your own photography before this ever ships.
const CDN = "https://amanzadaperfumes.com/cdn/shop/files";
const DEV_IMAGE = {
  impression: `${CDN}/Impressions_Perfume_Bottle_Main.png?width=1124`,
  signature: `${CDN}/CannabisWeb.png?width=1124`,
  backToBlackOud: `${CDN}/BackToBlackOudWeb.png?width=1124`,
  oil: `${CDN}/Perfume_Oil_Main.jpg?width=1124`,
  interior: `${CDN}/Interior_Perfume_Bottle_MAIN.jpg?width=1124`,
};

type ProductInput = {
  title: string;
  price: number;
  compareAtPrice: number;
  kicker?: string;
  image?: string;
};

function product({ title, price, compareAtPrice, kicker, image }: ProductInput): Product {
  autoId += 1;
  return {
    id: `product-${autoId}`,
    handle: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title,
    kicker,
    price,
    compareAtPrice,
    image,
  };
}

export const collections: Collection[] = [
  {
    id: "signature",
    handle: "signature-collection",
    kicker: "made in dubai",
    title: "Signature Fragrances",
    products: [
      product({ title: "Oud Royale", price: 249, compareAtPrice: 620, image: DEV_IMAGE.signature }),
      product({ title: "Amber Noir", price: 229, compareAtPrice: 560, image: DEV_IMAGE.signature }),
      product({ title: "Velvet Musk", price: 259, compareAtPrice: 640, image: DEV_IMAGE.signature }),
      product({ title: "Golden Saffron", price: 239, compareAtPrice: 590, image: DEV_IMAGE.signature }),
    ],
  },
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

export const featuredProduct: Product = product({
  title: "Amanzada Back to Black Oud",
  price: 185,
  compareAtPrice: 460,
  kicker: "Our selection",
  image: DEV_IMAGE.backToBlackOud,
});
