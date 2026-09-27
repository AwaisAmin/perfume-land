// One-off: snapshot the current static site data (src/data/*.ts) as the DB seed.
// Run from the repo root: node backend/src/db/export-seed.mjs
import { writeFileSync } from "node:fs";
const products = await import("../../../src/data/products.ts");
const brand = await import("../../../src/data/brand.ts");
const branches = await import("../../../src/data/branches.ts");
const nav = await import("../../../src/data/nav.ts");
const snapshot = {
  collections: products.collections,
  featuredProduct: products.featuredProduct,
  shopTheLookGroups: products.shopTheLookGroups,
  beforeAfterImages: products.beforeAfterImages,
  bottleImage: products.bottleImage,
  brand: { journeyImage: brand.journeyImage, brandValues: brand.brandValues, brandCraft: brand.brandCraft },
  contact: { whatsappNumber: branches.whatsappNumber, branches: branches.branches },
  nav: { brandImpressionsGroups: nav.brandImpressionsGroups, primaryNavStart: nav.primaryNavStart, primaryNavEnd: nav.primaryNavEnd },
  announcements: ["Free Delivery Over {amount}", "Delivery Across Pakistan"],
  freeShippingThreshold: 500,
};
writeFileSync(new URL("./seed-data.json", import.meta.url), JSON.stringify(snapshot, null, 2) + "\n");
console.log("collections", snapshot.collections.length, "products", snapshot.collections.reduce((n, c) => n + c.products.length, 0));
