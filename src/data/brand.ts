export type ColumnItem = {
  title: string;
  body: string;
};

import { bottleImage } from "@/data/products";

export const journeyImage = bottleImage;

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
