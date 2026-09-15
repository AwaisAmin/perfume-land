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
      { label: "Standard Collection Interior", href: "/collections/standard-collection-interior" },
      { label: "Premium Collection Interior", href: "/collections/premium-collection-interior" },
      { label: "Exclusive Collection Interior", href: "/collections/exclusive-collection-interior" },
    ],
  },
];

export const worldwideLinks: NavLink[] = [
  { label: "🇦🇪 United Arab Emirates", href: "/pages/united-arab-emirates" },
  { label: "🇿🇦 South Africa", href: "/pages/south-africa" },
  { label: "🇲🇾 Malaysia", href: "/pages/malaysia" },
  { label: "🇸🇪 Sweden", href: "/pages/sweden" },
  { label: "🇲🇺 Mauritius", href: "/pages/mauritius" },
  { label: "🇬🇧 United Kingdom", href: "/pages/united-kingdom" },
  { label: "🇨🇦 Canada", href: "/pages/canada" },
  { label: "🇴🇲 Oman", href: "/pages/oman" },
];

export const countrySelector: NavLink[] = [
  { label: "🇦🇪 United Arab Emirates (AED)", href: "#" },
  { label: "🇬🇧 United Kingdom (GBP)", href: "#" },
  { label: "🇨🇦 Canada (CAD)", href: "#" },
  { label: "🇦🇺 Australia (AUD)", href: "#" },
  { label: "🇸🇪 Sweden (SEK)", href: "#" },
  { label: "🇴🇲 Oman (AED)", href: "#" },
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
