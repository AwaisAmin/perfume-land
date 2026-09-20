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

// Shared local photography keeps the original Haris Bhai label consistent site-wide.
export const bottleImage = "/products/haris-bhai-bottle-filled.webp";
const PRODUCT_IMAGE = { impression: bottleImage, backToBlackOud: bottleImage, oil: bottleImage, interior: bottleImage };
export const beforeAfterImages = { him: bottleImage, her: bottleImage };

type ProductInput = {
  handle?: string;
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
  handle,
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
    handle: handle ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
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
    heroImage: bottleImage,
    products: [
      product({ description: "A rich oriental blend with a deep oud character, warm amber and soft musky sweetness. A welcoming scent for evenings and special occasions.", title: "Mukhalat Oud", price: 80, compareAtPrice: 744, image: PRODUCT_IMAGE.impression }),
      product({ description: "An expressive spicy scent with peppery warmth, a tobacco-like richness and a smooth woody finish. Bold and cosy for cooler evenings.",
        title: "Spice Bomb",
        price: 80,
        compareAtPrice: 754,
        image: PRODUCT_IMAGE.impression,
      }),
      product({ description: "A radiant oud-style fragrance pairing resinous woods with golden amber warmth and a gentle touch of spice. Rich, rounded and inviting.", title: "Oud Ul Shams", price: 80, compareAtPrice: 647, image: PRODUCT_IMAGE.impression }),
      product({ description: "A lively citrus and fresh-air character softened by clean musk and creamy woods. An easygoing choice for active days.", title: "Allure Sports", price: 80, compareAtPrice: 684, image: PRODUCT_IMAGE.impression }),
      product({ description: "A warm tobacco-style fragrance with aromatic spice, dry woods and a mellow amber finish. Classic, distinctive and suited to evening wear.", title: "Cigar", price: 80, compareAtPrice: 622, image: PRODUCT_IMAGE.impression }),
      product({ description: "A lush rose-and-oud character with earthy depth and a warm resinous finish. A rich floral woody scent for special occasions.", title: "Oud Isphan", price: 80, compareAtPrice: 609, image: PRODUCT_IMAGE.impression }),
    ],
  },
  {
    id: "premium",
    handle: "premium-collection",
    kicker: "brand impressions",
    title: "Premium Collection",
    pageTitle: "Premium Collection",
    heroImage: "/products/premium/gold-transparent.webp",
    products: [
      product({ description: "An airy fresh fragrance with a bright citrus feel, cool aquatic touches and a soft musky base. Light and uplifting for everyday wear.", title: "Sky Blue", price: 180, compareAtPrice: 674, image: "/products/premium/gold-transparent.webp" }),
      product({ description: "A crisp sporty scent blending a citrus-like freshness with green aromatic touches and clean woods. Refreshing for casual daytime wear.", title: "polo Sports", price: 180, compareAtPrice: 633, image: "/products/premium/sapphire-transparent.webp" }),
      product({ description: "An elegant woody aromatic character with bright citrus, peppery spice and a smooth earthy finish. Polished enough for both work and evenings.", title: "Icon", price: 180, compareAtPrice: 718, image: "/products/premium/onyx-transparent.webp" }),
      product({ description: "A vibrant fresh spicy scent with a bergamot-like brightness, peppery energy and an ambery woody base. Confident and versatile.", title: "Sauvage", price: 180, compareAtPrice: 694, image: "/products/premium/ruby-transparent.webp" }),
      product({ description: "A gentle clean musk fragrance with a powdery softness and subtle creamy warmth. Smooth and understated for everyday comfort.", title: "Silk Musk", price: 180, compareAtPrice: 651, image: "/products/premium/emerald-transparent.webp" }),
      product({ description: "A breezy aromatic scent with sparkling citrus, cool green freshness and a softly sweet musky finish. Relaxed and playful.", title: "Joop Jump", price: 180, compareAtPrice: 673, image: "/products/premium/crystal-transparent.webp" }),
    ],
  },
  {
    id: "exclusive",
    handle: "exclusive-collection",
    kicker: "brand impressions",
    title: "Exclusive Collection",
    pageTitle: "Exclusive Collection",
    heroImage: bottleImage,
    products: [
      product({ description: "A warm musk-style fragrance with earthy nuances, soft woods and a powdery finish. Rounded and comforting with a traditional attar character.", title: "Musk Ul Hind", price: 140, compareAtPrice: 775, image: PRODUCT_IMAGE.impression }),
      product({ description: "A romantic floral character with rose-like softness, fresh petals and a gently sweet musky finish. Graceful for daytime and special moments.", title: "Miss Dior", price: 140, compareAtPrice: 724, image: PRODUCT_IMAGE.impression }),
      product({ description: "A sophisticated fruity floral character with dark berry sweetness, delicate rose-like touches and a warm vanilla woody finish. Elegant for day or evening.", title: "Si Armani", price: 140, compareAtPrice: 635, image: PRODUCT_IMAGE.impression }),
      product({ description: "A soft floral musk fragrance with delicate petal-like sweetness and a warm powdery finish. A gentle, graceful scent with a traditional attar feel.", handle: "husn-e-yusuf", title: "حسن یوسف", price: 140, compareAtPrice: 674, image: PRODUCT_IMAGE.impression }),
      product({ description: "A fresh fruity aromatic character with cool green touches and a soft woody musky finish. Bright and relaxed for daily wear.", title: "Shalis Blue", price: 140, compareAtPrice: 764, image: PRODUCT_IMAGE.impression }),
      product({ description: "A plush oud-style scent with smooth smoky woods, warm amber and a softly spicy edge. Rich and enveloping for evening wear.", title: "Fabulous Oud", price: 140, compareAtPrice: 607, image: PRODUCT_IMAGE.impression }),
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
    heroImage: bottleImage,
    products: [
      product({ description: "A bold aromatic fragrance with a bright fruity opening, lively spice and a warm woody finish. Distinctive and expressive.",
        title: "Silver Scent",
        price: 280,
        image: bottleImage,
      }),
      product({ description: "A warm woody fragrance with an amber-like glow, gentle spice and a soft musky finish. An inviting character for relaxed evenings.",
        title: "Harare",
        price: 280,
        image: bottleImage,
      }),
      product({ description: "A light aquatic floral character with fresh watery touches, delicate petals and clean musk. Breezy and refreshing for warm days.",
        title: "Cool Women",
        gender: "women",
        price: 280,
        image: bottleImage,
      }),
      product({ description: "A deep oud-style fragrance with smoky wood, resinous warmth and an earthy finish. A traditional woody character for those who enjoy rich scents.", handle: "oud", title: "عود",
        price: 280,
        image: bottleImage,
      }),
      product({ description: "A jasmine-style floral fragrance with lush white petals, gentle green freshness and a soft sweet finish. Familiar, graceful and beautifully floral.", handle: "motia", title: "موتیا",
        price: 280,
        image: bottleImage,
      }),
      product({ description: "A bright fruity floral character with honey-like sweetness, white flowers and warm woods. Glamorous and playful for evening occasions.",
        title: "1Million Lady",
        price: 280,
        image: bottleImage,
      }),
    ],
  },
  {
    id: "oil",
    handle: "standard-collection-oil",
    kicker: "concentrated oils",
    title: "Standard Collection Oil",
    pageTitle: "Standard Collection Oil",
    heroImage: bottleImage,
    products: [
      product({ description: "A delicate fresh musk fragrance with soft floral touches and a light powdery finish. Clean and understated for everyday wear.", handle: "zam-zam", title: "زم زم", price: 45, image: PRODUCT_IMAGE.oil }),
      product({ description: "A petal-rich rose character balancing dewy freshness with gentle floral sweetness. Soft musk rounds out this timeless floral scent.", title: "Rose", price: 45, image: PRODUCT_IMAGE.oil }),
      product({ description: "A warm oriental character with gentle spice, soft florals and a smooth woody musk base. Rounded and welcoming with a traditional feel.", title: "Aseel", price: 45, image: PRODUCT_IMAGE.oil }),
      product({ description: "An airy blend of clean musk, delicate floral touches and gentle powdery warmth. A soft scent for relaxed everyday moments.", title: "Soft Mist", price: 45, image: PRODUCT_IMAGE.oil }),
      product({ description: "A rich oriental woody character with an oud-like depth, rose-like softness and a warm musky finish. Evocative and enveloping.", title: "Gilaf E Kaaba", price: 45, image: PRODUCT_IMAGE.oil }),
      product({ description: "A quiet floral character with a fresh tea-like opening, delicate white flowers and soft musk. Light and elegant for daytime wear.", title: "Still", price: 45, image: PRODUCT_IMAGE.oil }),
    ],
  },
  {
    id: "premium-oil",
    handle: "premium-collection-oil",
    kicker: "concentrated oils",
    title: "Premium Collection Oil",
    pageTitle: "Premium Collection Oil",
    heroImage: bottleImage,
    products: [
      product({ description: "A smooth woody scent with an oud-like character, dry spice and creamy sandalwood warmth. Refined and understated with a softly sweet finish.", title: "Oud Wood", price: 85, image: PRODUCT_IMAGE.oil }),
      product({ description: "A warm spicy character with a bright opening, tobacco-like richness and a smooth amber woody finish. Inviting for evenings and special occasions.", title: "The One", price: 85, image: PRODUCT_IMAGE.oil }),
      product({ description: "A relaxed fresh scent with citrus-like brightness, soft green touches and gentle woods. Easy to wear on casual days.", title: "Weekend BB", price: 85, image: PRODUCT_IMAGE.oil }),
      product({ description: "A traditional green floral character with soft herbal freshness, sweet petals and a warm musky base. Rich yet comforting.", title: "Janat Firdos", price: 85, image: PRODUCT_IMAGE.oil }),
      product({ description: "A clean aromatic woody character with fresh fruity touches, gentle spice and a smooth warm base. Versatile for work and everyday wear.", title: "Hugo Boss", price: 85, image: PRODUCT_IMAGE.oil }),
      product({ description: "A rich fruity woody character with a bright citrus edge, dark fruit-like depth and dry spicy woods. A confident scent for evening wear.", title: "Aventus Absolu", price: 85, image: PRODUCT_IMAGE.oil }),
    ],
  },
  {
    id: "exclusive-oil",
    handle: "exclusive-collection-oil",
    kicker: "concentrated oils",
    title: "Exclusive Collection Oil",
    pageTitle: "Exclusive Collection Oil",
    heroImage: bottleImage,
    products: [
      product({ description: "An elegant floral-style scent with a full bouquet character, gentle sweetness and a warm woody finish. Classic and graceful.", title: "Estee Lauder", price: 65, image: PRODUCT_IMAGE.oil }),
      product({ description: "A bold sweet oriental character with soft florals, warm spice and a vanilla-like finish. Rich and expressive for cooler evenings.", title: "Joop", price: 65, image: PRODUCT_IMAGE.oil }),
      product({ description: "A refined citrus aromatic character with green freshness, gentle spice and polished woods. Crisp and elegant for daytime wear.", title: "CC-1872", price: 65, image: PRODUCT_IMAGE.oil }),
      product({ description: "A lively citrus aromatic scent with soft lavender-like touches, dry woods and a gently sweet finish. Casual and easygoing.", title: "Blue Jeans", price: 65, image: PRODUCT_IMAGE.oil }),
      product({ description: "A smooth evening scent with bright citrus touches, warm spice and a softly sweet tonka-like base. Elegant and inviting.", title: "Armani code", price: 65, image: PRODUCT_IMAGE.oil }),
      product({ description: "A cosy sweet spicy character with aromatic freshness, toasted warmth and a vanilla-like finish. Rounded and comforting for cooler days.", title: "Strong you", price: 65, image: PRODUCT_IMAGE.oil }),
    ],
  },
  {
    id: "interior",
    handle: "standard-collection-interior-perfumes",
    kicker: "for your space",
    title: "Standard Collection Interior Perfumes",
    pageTitle: "Standard Collection Interior Perfumes",
    heroImage: bottleImage,
    products: [
      product({ description: "A gentle fruity floral character with bright freshness, soft petals and a clean musky finish. Cheerful and easy to wear.", title: "Alika", price: 150, image: PRODUCT_IMAGE.interior }),
      product({ description: "A warm relaxed scent with juicy fruit-like touches, mellow spice and soft creamy woods. An inviting choice for casual wear.", title: "Boss Orange", price: 150, image: PRODUCT_IMAGE.interior }),
      product({ description: "A distinctive woody leather character with a green violet-like freshness and warm spicy depth. Bold and memorable.", title: "Fahrenheit", price: 150, image: PRODUCT_IMAGE.interior }),
      product({ description: "A powerful aromatic character with herbal freshness, warm spice and a deep musky woody finish. A classic style with a bold presence.", title: "Kouos", price: 150, image: PRODUCT_IMAGE.interior }),
      product({ description: "A green aromatic scent with bright citrus touches, dry woods and a warm earthy finish. Classic and adventurous in character.", title: "Safari", price: 150, image: PRODUCT_IMAGE.interior }),
      product({ description: "A light fresh fragrance with citrus-like sparkle, soft green touches and clean musk. Balanced and easygoing for everyday wear.", title: "One", price: 150, image: PRODUCT_IMAGE.interior }),
    ],
  },
  {
    id: "premium-interior",
    handle: "premium-collection-interior-perfumes",
    kicker: "for your space",
    title: "Premium Collection Interior Perfumes",
    pageTitle: "Premium Collection Interior Perfumes",
    heroImage: bottleImage,
    products: [
      product({ description: "A crisp woody aromatic character with green freshness, gentle spice and a smooth musky base. Understated and versatile.", title: "Dunhil Black", price: 200, image: PRODUCT_IMAGE.interior }),
      product({ description: "An earthy woody character with a bitter citrus freshness, peppery warmth and a dry mineral-like finish. Refined and grounded.", title: "Terre D", price: 200, image: PRODUCT_IMAGE.interior }),
      product({ description: "A rich cherry-style fragrance with almond-like sweetness, soft florals and warm woods. Playful and indulgent for evenings.", title: "Lost Cherry", price: 200, image: PRODUCT_IMAGE.interior }),
      product({ description: "A vibrant fruity floral character with creamy sweetness, warm spice and a soft earthy finish. Bold and expressive.", title: "Gucci Rush", price: 200, image: PRODUCT_IMAGE.interior }),
      product({ description: "A warm floral musk character with rose-like softness, gentle spice and smooth woods. Elegant and welcoming with an oriental feel.", title: "Wisal", price: 200, image: PRODUCT_IMAGE.interior }),
      product({ description: "A lively fresh spicy scent with a bright citrus feel, aromatic warmth and a sweet woody finish. Confident and energetic.", title: "Wanted", price: 200, image: PRODUCT_IMAGE.interior }),
    ],
  },
  {
    id: "exclusive-interior",
    handle: "exclusive-collection-interior-perfumes",
    kicker: "for your space",
    title: "Exclusive Collection Interior Perfumes",
    pageTitle: "Exclusive Collection Interior Perfumes",
    heroImage: bottleImage,
    products: [
      product({ description: "A deep marine character with salty freshness, sea-breeze touches and an ambery musky finish. Atmospheric and distinctive.", title: "Megamare", price: 175, image: PRODUCT_IMAGE.interior }),
      product({ description: "A rich leather-style fragrance with a fruity sweetness, smoky warmth and dry woods. Bold and refined for evening wear.", title: "Tuscan Leather", price: 175, image: PRODUCT_IMAGE.interior }),
      product({ description: "A cosy spicy woody character with tobacco-like warmth, soft sweetness and a resinous finish. Inviting for cooler weather.", title: "BB London", price: 175, image: PRODUCT_IMAGE.interior }),
      product({ description: "A sweet fruity aromatic character with pear-like brightness, lavender-like freshness and warm vanilla depth. Playful and bold for evenings.", title: "Ultra Male", price: 200, image: PRODUCT_IMAGE.interior }),
      product({ description: "A fresh woody spicy character with citrus-like brightness, aromatic touches and an earthy finish. Lively and easygoing.", title: "Adventure", price: 175, image: PRODUCT_IMAGE.interior }),
      product({ description: "A classic fresh woody character with green aromatic touches, gentle spice and a soft earthy finish. Balanced and comfortable for daily wear.", title: "1881", price: 175, image: PRODUCT_IMAGE.interior }),
    ],
  },
];

// Use catalog records so homepage names, prices and links stay in sync.
const signatureProducts = collections.find((collection) => collection.id === "signature")!.products;

export const shopTheLookGroups: ShopTheLookGroup[] = [{
  image: bottleImage,
  items: signatureProducts.slice(0, 5).map((product, index) => ({
    handle: product.handle,
    title: product.title,
    price: product.price,
    image: product.image ?? bottleImage,
    top: 52,
    left: 12 + index * 19,
  })),
}];

const featured = collections.find((collection) => collection.id === "exclusive")!.products[0];

export const featuredProduct: FeaturedProductData = {
  handle: featured.handle,
  title: featured.title,
  description: featured.description!,
  image: featured.image,
  variants: [
    { size: "50ml", price: featured.price, compareAtPrice: featured.compareAtPrice },
    { size: "100ml", price: 180, compareAtPrice: 840 },
  ],
};
