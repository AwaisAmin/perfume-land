import type { NavGroup, NavLink } from "@/lib/types";

export const brandImpressionsGroups: NavGroup[] = [
  {
    title: "Perfumes",
    links: [
      { label: "Standard Collection", href: "/collections/standard-collection" },
      { label: "Premium Collection", href: "/collections/premium-collection" },
      { label: "Exclusive Collection", href: "/collections/exclusive-collection" },
    ],
  },
  {
    title: "Perfume Oils",
    links: [
      { label: "Standard Collection Oil", href: "/collections/standard-collection-oil" },
      { label: "Premium Collection Oil", href: "/collections/premium-collection-oil" },
      { label: "Exclusive Collection Oil", href: "/collections/exclusive-collection-oil" },
    ],
  },
  {
    title: "Interior Perfumes",
    links: [
      { label: "Standard Collection Interior", href: "/collections/standard-collection-interior-perfumes" },
      { label: "Premium Collection Interior", href: "/collections/premium-collection-interior-perfumes" },
      { label: "Exclusive Collection Interior", href: "/collections/exclusive-collection-interior-perfumes" },
    ],
  },
];

export const worldwideLinks: { code: string; label: string; slug: string; href: string }[] = [
  { code: "ZA", label: "South Africa", slug: "south-africa", href: "/pages/world-wide/south-africa" },
  { code: "MY", label: "Malaysia", slug: "malaysia", href: "/pages/world-wide/malaysia" },
  { code: "SE", label: "Sweden", slug: "sweden", href: "/pages/world-wide/sweden" },
  { code: "MU", label: "Mauritius", slug: "mauritius", href: "/pages/world-wide/mauritius" },
  { code: "GB", label: "United Kingdom", slug: "united-kingdom", href: "/pages/world-wide/united-kingdom" },
  { code: "CA", label: "Canada", slug: "canada", href: "/pages/world-wide/canada" },
  { code: "OM", label: "Oman", slug: "oman", href: "/pages/world-wide/oman" },
  { code: "LK", label: "Sri Lanka", slug: "sri-lanka", href: "/pages/world-wide/sri-lanka" },
  { code: "MV", label: "Maldives", slug: "maldives", href: "/pages/world-wide/maldives" },
];

// The store only settles in PKR, so every market shows the same currency —
// this is a country/shipping-region picker, not a currency switcher.
export const countrySelector: { code: string; label: string }[] = [
  { code: "au", label: "Australia" },
  { code: "at", label: "Austria" },
  { code: "bh", label: "Bahrain" },
  { code: "be", label: "Belgium" },
  { code: "bg", label: "Bulgaria" },
  { code: "ca", label: "Canada" },
  { code: "hr", label: "Croatia" },
  { code: "cy", label: "Cyprus" },
  { code: "cz", label: "Czechia" },
  { code: "dk", label: "Denmark" },
  { code: "ee", label: "Estonia" },
  { code: "fr", label: "France" },
  { code: "de", label: "Germany" },
  { code: "ie", label: "Ireland" },
  { code: "kw", label: "Kuwait" },
  { code: "my", label: "Malaysia" },
  { code: "mu", label: "Mauritius" },
  { code: "nl", label: "Netherlands" },
  { code: "om", label: "Oman" },
  { code: "qa", label: "Qatar" },
  { code: "sa", label: "Saudi Arabia" },
  { code: "za", label: "South Africa" },
  { code: "se", label: "Sweden" },
  { code: "ae", label: "United Arab Emirates" },
  { code: "gb", label: "United Kingdom" },
  { code: "us", label: "United States" },
];

// Top-level primary navigation, left to right, matching the live site order.
export const primaryNavStart: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Signature", href: "/collections/signature-collection" },
];

export const primaryNavEnd: NavLink[] = [
  { label: "About", href: "/pages/about" },
  { label: "Contact", href: "/pages/contact" },
];
