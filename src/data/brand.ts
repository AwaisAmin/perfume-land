export type ColumnItem = {
  title: string;
  body: string;
};

export const journeyImage = "/brand/haris-about.png";

// Shared across the homepage "About Us" section and the About page — the
// same three values are repeated in both places.
export const brandValues: ColumnItem[] = [
  {
    title: "Blended to Order",
    body: "Nothing is filled from a warehouse. Every bottle is mixed in the shop, for the person who asked for it.",
  },
  {
    title: "Honest Impressions",
    body: "We never pass our work off as the original. These are impressions — built to smell like the fragrances you love.",
  },
  {
    title: "Fair Prices",
    body: "A designer scent should not cost a month's salary. You pay for the oil in the bottle, not the name on it.",
  },
];

// What the shop actually does, shown as the About page's three columns.
export const brandCraft: ColumnItem[] = [
  {
    title: "Custom Blending",
    body: "Tell us the note you want more of — sweeter, woodier, longer-lasting — and it is mixed in front of you.",
  },
  {
    title: "Refills",
    body: "Bring back a bottle you already love, in any size, and have it filled again instead of replacing it.",
  },
  {
    title: "Impressions",
    body: "Our own take on the designer fragrances people ask for most, in spray, oil and interior form.",
  },
];
