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
};

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
