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
};

export type NavLink = {
  label: string;
  href: string;
};

export type NavGroup = {
  title: string;
  links: NavLink[];
};
