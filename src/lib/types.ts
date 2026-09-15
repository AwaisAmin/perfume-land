export type Product = {
  id: string;
  handle: string;
  title: string;
  kicker?: string;
  price: number;
  compareAtPrice?: number;
  accent: "forest" | "gold" | "cream";
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
