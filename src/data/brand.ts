export type ColumnItem = {
  title: string;
  body: string;
};

// DEV-ONLY — hotlinked from the reference site's own CDN, same pattern used
// throughout src/data/products.ts. Swap for real photography before launch.
export const journeyImage =
  "https://amanzadaperfumes.com/cdn/shop/files/Cannabis_Instagram.jpg?width=1546";

// Shared across the homepage "About Us" section and the About page — the
// reference site repeats this exact content in both places.
export const brandValues: ColumnItem[] = [
  {
    title: "Craftsmanship",
    body: "Every fragrance is meticulously composed using traditional and modern techniques.",
  },
  {
    title: "Authenticity",
    body: "We source only the finest, ethically harvested raw materials from around the world.",
  },
  {
    title: "Timelessness",
    body: "Our creations are designed to transcend trends and become lasting companions.",
  },
];

export const brandLeaders: ColumnItem[] = [
  { title: "Haseeb Amanzada", body: "Founder & CEO" },
  { title: "Saleem Amanzada", body: "COO & Co-Founder" },
  { title: "Rashid Amanzada", body: "CMO & Brand Director" },
];
