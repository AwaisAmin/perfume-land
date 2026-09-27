export type Product = {
  id: string;
  handle: string;
  title: string;
  kicker?: string;
  price: number;
  compareAtPrice?: number;
  /** Path to real product photography (e.g. "/products/oud-maracuja.jpg").
   *  Leave unset to fall back to the illustrated placeholder bottle. */
  image?: string;
  /** Drives the collection page's gender filter. */
  gender?: "unisex" | "women" | "men";
  /** Drives the collection page's "In stock only" filter. */
  inStock?: boolean;
  /** Shown on the product detail page. */
  description?: string;
  /** The single size shown on the product detail page (e.g. "50ml"). */
  size?: string;
  /** Feeds the product detail page's stock progress bar. */
  stockCount?: number;
  /** Purchasable options (≥1, ordered). The first one is the default and
   *  mirrors price/compareAtPrice/size/inStock above. */
  variants: Variant[];
};

export const VARIANT_TYPES = ["EDT", "EDP", "Perfume"] as const;
export const VARIANT_SIZES = ["35ml", "50ml", "100ml"] as const;
export type VariantType = (typeof VARIANT_TYPES)[number];
export type VariantSize = (typeof VARIANT_SIZES)[number];

/** One purchasable option of a product. 35ml has no type (`type: null`). */
export type Variant = {
  id: string;
  type: VariantType | null;
  size: VariantSize;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
};

/** The price a listing shows: the cheapest variant (falls back to the product fields). */
export function listingPrice(product: Pick<Product, "price" | "compareAtPrice" | "variants">): {
  price: number;
  compareAtPrice: number | undefined;
  /** Variants have different prices ("From" applies). */
  varies: boolean;
} {
  const variants = product.variants ?? [];
  const cheapest = variants.reduce<Variant | undefined>((min, v) => (!min || v.price < min.price ? v : min), undefined);
  const price = cheapest?.price ?? product.price;
  const compare = cheapest ? cheapest.compareAtPrice : product.compareAtPrice;
  return {
    price,
    compareAtPrice: compare !== undefined && compare > price ? compare : undefined,
    varies: new Set(variants.map((v) => v.price)).size > 1,
  };
}

/** "Perfume · 50ml", or just "35ml" when the variant has no type. */
export function variantLabel(variant: Pick<Variant, "type" | "size">): string {
  return variant.type ? `${variant.type} · ${variant.size}` : variant.size;
}

export type ProductVariant = {
  size: string;
  price: number;
  compareAtPrice?: number;
};

export type FeaturedProductData = {
  handle: string;
  title: string;
  description: string;
  /** Leave unset to fall back to the illustrated placeholder bottle. */
  image?: string;
  variants: ProductVariant[];
};

export type Collection = {
  id: string;
  handle: string;
  kicker: string;
  title: string;
  products: Product[];
  /** Banner image for the collection page hero — leave unset to fall back
   *  to a plain colored banner. */
  heroImage?: string;
  /** The reference site titles this section differently on the homepage
   *  grid ("Signature Fragrances") vs. its own collection page hero
   *  ("Signature Collection") — defaults to `title` when unset. */
  pageTitle?: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type NavGroup = {
  title: string;
  links: NavLink[];
};

export type ColumnItem = {
  title: string;
  body: string;
};

export type ShopTheLookItem = {
  handle: string;
  title: string;
  price: number;
  image: string;
  /** Hot-spot position on the group photo, as a percentage. */
  top: number;
  left: number;
};

/** One lifestyle photo plus the hot-spotted products shown on it. */
export type ShopTheLookGroup = {
  image: string;
  items: ShopTheLookItem[];
};

export type Branch = {
  name: string;
  address: string;
  mapUrl?: string;
};

/** Everything the storefront renders, as returned by `GET /api/public/site`. */
export type SiteData = {
  collections: Collection[];
  featuredProduct: FeaturedProductData;
  shopTheLookGroups: ShopTheLookGroup[];
  beforeAfterImages: { him: string; her: string };
  bottleImage: string;
  brand: { journeyImage: string; brandValues: ColumnItem[]; brandCraft: ColumnItem[] };
  contact: { whatsappNumber: string; orderWhatsappNumber: string; branches: Branch[] };
  nav: { brandImpressionsGroups: NavGroup[]; primaryNavStart: NavLink[]; primaryNavEnd: NavLink[] };
  announcements: string[];
  freeShippingThreshold: number;
  content: SiteContent;
  updatedAt: string;
};

/** The slice of SiteData that client components need (sent to the browser once, from the root layout). */
export type ClientSiteData = Pick<
  SiteData,
  "collections" | "nav" | "announcements" | "freeShippingThreshold" | "bottleImage"
> & {
  orderWhatsappNumber: string;
  content: ClientContent;
};

/** Only the content groups used by always-mounted client components (header, cart, search, cards). */
export type ClientContent = Pick<
  SiteContent,
  "header" | "cart" | "checkout" | "search" | "productCard" | "floatingChat" | "collectionPage"
>;

export type LinkContent = { label: string; href: string };

export type SocialPlatform = "instagram" | "youtube" | "tiktok" | "facebook" | "whatsapp";
export type TrustBadgeIcon = "truck" | "headphones" | "shield";

/**
 * Every storefront text / media / link that is not catalog data. Bundled
 * default: src/data/content.ts. Served by the CRM as `content`.
 * Templates use {placeholders} that the component fills in.
 */
export type SiteContent = {
  seo: { title: string; description: string };
  header: {
    currencyCode: string;
    currencySymbol: string;
    brandImpressionsLabel: string;
    searchPlaceholder: string;
    viewAllResults: string;
  };
  home: {
    hero: { videoSrc: string; posterSrc: string; ctaLabel: string; ctaHref: string };
    marqueeGold: string;
    marqueeForest: string;
    viewAllLabel: string;
    mediaGrid: { heading: string; items: LinkContent[] };
    shopTheLook: { kicker: string; heading: string; buttonLabel: string };
    beforeAfter: {
      him: { label: string; buttonLabel: string; href: string };
      her: { label: string; buttonLabel: string; href: string };
    };
    featuredProduct: { kicker: string; heading: string; sizeLabel: string; addToCart: string };
    aboutValues: { heading: string; intro: string[] };
    newsletter: {
      kicker: string;
      heading: string;
      body: string;
      emailLabel: string;
      emailPlaceholder: string;
      submit: string;
      submitted: string;
    };
  };
  contactForm: {
    kicker: string;
    title: string;
    description: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    submit: string;
    submitted: string;
  };
  trustBadges: { icon: TrustBadgeIcon; title: string; description: string; whatsappLinkLabel: string }[];
  footer: {
    kicker: string;
    heading: string;
    body: string;
    ctaLabel: string;
    brandName: string;
    about: string;
    motto: string;
    socialLinks: { platform: SocialPlatform; label: string; href: string }[];
    exploreHeading: string;
    exploreLinksStart: LinkContent[];
    exploreLinksEnd: LinkContent[];
    shopAll: LinkContent;
    helpHeading: string;
    helpLinks: LinkContent[];
    helpWhatsappLinks: string[];
    countersHeading: string;
    directionsLabel: string;
    whatsappCaption: string;
    copyright: string;
    marketLabel: string;
    creditPrefix: string;
    credit: LinkContent;
  };
  about: {
    imageAlt: string;
    kicker: string;
    heading: string;
    paragraphs: string[];
    closing: string;
    whatWeDoKicker: string;
    whatWeDoHeading: string;
    whatWeDoIntro: string[];
  };
  contactPage: {
    kicker: string;
    title: string;
    descriptionStart: string;
    link: LinkContent;
    descriptionEnd: string;
  };
  /** `indexHandles`: which collections the /collections page lists, in order. */
  collections: { productSingular: string; productPlural: string; indexHandles: string[] };
  search: {
    metaTitle: string;
    heading: string;
    resultSingular: string;
    resultPlural: string;
    /** {count} {results} {query} */
    countTemplate: string;
    emptyPrompt: string;
    /** {query} */
    noResults: string;
  };
  productCard: { fromPrefix: string; quickAdd: string };
  collectionPage: {
    availabilityHeading: string;
    inStockOnly: string;
    priceHeading: string;
    priceRangeSeparator: string;
    minPriceLabel: string;
    maxPriceLabel: string;
    fromPriceLabel: string;
    toPriceLabel: string;
    genderHeading: string;
    genders: { unisex: string; women: string; men: string };
    sortBy: string;
    sortOptions: { featured: string; titleAsc: string; titleDesc: string; priceAsc: string; priceDesc: string };
    productSingular: string;
    productPlural: string;
    layoutLarge: string;
    layoutMedium: string;
    layoutCompact: string;
    noMatches: string;
  };
  product: {
    /** {count} */
    inStockTemplate: string;
    soldOut: string;
    sizeLabel: string;
    typeLabel: string;
    addToCart: string;
    relatedHeading: string;
  };
  cart: {
    title: string;
    /** {amount} */
    freeShippingRemaining: string;
    freeShippingReached: string;
    empty: string;
    remove: string;
    taxesNote: string;
    checkout: string;
  };
  checkout: {
    heading: string;
    intro: string;
    nameLabel: string;
    phoneLabel: string;
    cityLabel: string;
    addressLabel: string;
    noteLabel: string;
    optionalHint: string;
    requiredError: string;
    phoneError: string;
    back: string;
    submit: string;
    sentHeading: string;
    sentBody: string;
    clearCart: string;
    keepCart: string;
    messageHeading: string;
    messageSubtotal: string;
    messageFreeDelivery: string;
    /** {amount} */
    messageDeliveryNote: string;
    messageCustomer: string;
  };
  floatingChat: { title: string; greeting: string };
};

/** wa.me wants the number bare — no +, spaces or dashes. */
export function whatsappUrlFor(whatsappNumber: string): string {
  return `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
}
