export type WorldwideLocation = {
  code: string;
  label: string;
  slug: string;
  storeName: string;
  location: string;
  telephone: string;
  website: string;
  workingHours: string;
};

// DEV-ONLY placeholder contact details — only South Africa's was given as a
// real reference; the rest are plausible stand-ins so every country page
// renders correctly. Swap these for the real addresses/numbers before this
// ever ships.
export const worldwideLocations: WorldwideLocation[] = [
  {
    code: "ZA",
    label: "South Africa",
    slug: "south-africa",
    storeName: "Amanzada South Africa",
    location: "South Africa, Durban. 43 b Jan Hofmeyr Road Westville.",
    telephone: "+276 337 65 277",
    website: "https://amanzadaperfumes.co.za",
    workingHours: "By appointment only",
  },
  {
    code: "MY",
    label: "Malaysia",
    slug: "malaysia",
    storeName: "Amanzada Malaysia",
    location: "Kuala Lumpur, Malaysia.",
    telephone: "+60 3 2110 5000",
    website: "https://amanzadaperfumes.com.my",
    workingHours: "By appointment only",
  },
  {
    code: "SE",
    label: "Sweden",
    slug: "sweden",
    storeName: "Amanzada Sweden",
    location: "Stockholm, Sweden.",
    telephone: "+46 8 505 000 00",
    website: "https://amanzadaperfumes.se",
    workingHours: "By appointment only",
  },
  {
    code: "MU",
    label: "Mauritius",
    slug: "mauritius",
    storeName: "Amanzada Mauritius",
    location: "Port Louis, Mauritius.",
    telephone: "+230 208 0000",
    website: "https://amanzadaperfumes.mu",
    workingHours: "By appointment only",
  },
  {
    code: "GB",
    label: "United Kingdom",
    slug: "united-kingdom",
    storeName: "Amanzada United Kingdom",
    location: "London, United Kingdom.",
    telephone: "+44 20 7946 0000",
    website: "https://amanzadaperfumes.co.uk",
    workingHours: "By appointment only",
  },
  {
    code: "CA",
    label: "Canada",
    slug: "canada",
    storeName: "Amanzada Canada",
    location: "Toronto, Canada.",
    telephone: "+1 416 555 0100",
    website: "https://amanzadaperfumes.ca",
    workingHours: "By appointment only",
  },
  {
    code: "OM",
    label: "Oman",
    slug: "oman",
    storeName: "Amanzada Oman",
    location: "Muscat, Oman.",
    telephone: "+968 2400 0000",
    website: "https://amanzadaperfumes.om",
    workingHours: "By appointment only",
  },
  {
    code: "LK",
    label: "Sri Lanka",
    slug: "sri-lanka",
    storeName: "Amanzada Sri Lanka",
    location: "Colombo, Sri Lanka.",
    telephone: "+94 11 234 5000",
    website: "https://amanzadaperfumes.lk",
    workingHours: "By appointment only",
  },
  {
    code: "MV",
    label: "Maldives",
    slug: "maldives",
    storeName: "Amanzada Maldives",
    location: "Malé, Maldives.",
    telephone: "+960 330 0000",
    website: "https://amanzadaperfumes.mv",
    workingHours: "By appointment only",
  },
];

export function getWorldwideLocation(slug: string) {
  return worldwideLocations.find((location) => location.slug === slug);
}
