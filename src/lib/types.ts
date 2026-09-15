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
