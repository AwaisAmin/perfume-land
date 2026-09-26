import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isValidImagePath, isValidSiteHref, isValidMapUrl, isValidVideoPath, isValidPhone } from "../src/utils/validators.js";

const seedData = JSON.parse(
  readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "db", "seed-data.json"), "utf8")
);

test("every image path in seed-data.json is accepted by isValidImagePath", () => {
  const paths = new Set();
  for (const collection of seedData.collections) {
    if (collection.heroImage) paths.add(collection.heroImage);
    for (const product of collection.products) {
      if (product.image) paths.add(product.image);
    }
  }
  if (seedData.featuredProduct.image) paths.add(seedData.featuredProduct.image);
  for (const group of seedData.shopTheLookGroups) {
    if (group.image) paths.add(group.image);
    for (const item of group.items) {
      if (item.image) paths.add(item.image);
    }
  }
  paths.add(seedData.bottleImage);
  paths.add(seedData.beforeAfterImages.him);
  paths.add(seedData.beforeAfterImages.her);
  paths.add(seedData.brand.journeyImage);

  assert.ok(paths.size > 0, "expected at least one image path in the seed data");
  for (const p of paths) {
    assert.equal(isValidImagePath(p), true, `expected "${p}" to be a valid image path`);
  }
});

test("isValidImagePath accepts uploaded files and rejects arbitrary URLs/paths", () => {
  assert.equal(isValidImagePath("/uploads/abcdef0123456789.png"), true);
  // Uppercase hex in /uploads/ isn't something this backend ever generates,
  // but it's still a safe same-origin path with an allowed extension, so it
  // is accepted via the general site-path pattern (not a security concern).
  assert.equal(isValidImagePath("/uploads/ABCDEF.png"), true);
  assert.equal(isValidImagePath("/uploads/abc.gif"), false); // .gif is not an allowed extension at all
  assert.equal(isValidImagePath("https://evil.example.com/x.png"), false);
  assert.equal(isValidImagePath("javascript:alert(1)"), false);
  assert.equal(isValidImagePath("//evil.example.com/x.png"), false); // protocol-relative
  assert.equal(isValidImagePath("/products/x.exe"), false); // wrong extension
  assert.equal(isValidImagePath("/products/haris-bhai-bottle-filled.webp"), true);
});

test("every nav href in seed-data.json is accepted by isValidSiteHref", () => {
  const hrefs = [
    ...seedData.nav.primaryNavStart.map((l) => l.href),
    ...seedData.nav.primaryNavEnd.map((l) => l.href),
    ...seedData.nav.brandImpressionsGroups.flatMap((g) => g.links.map((l) => l.href)),
  ];
  assert.ok(hrefs.length > 0);
  for (const href of hrefs) {
    assert.equal(isValidSiteHref(href), true, `expected "${href}" to be a valid site href`);
  }
});

test("isValidSiteHref rejects off-site links", () => {
  assert.equal(isValidSiteHref("https://example.com"), false);
  assert.equal(isValidSiteHref("//example.com"), false);
  assert.equal(isValidSiteHref("javascript:alert(1)"), false);
  assert.equal(isValidSiteHref("/collections/standard-collection"), true);
});

test("the seed branch mapUrl is accepted by isValidMapUrl", () => {
  const branchWithMap = seedData.contact.branches.find((b) => b.mapUrl);
  assert.ok(branchWithMap, "expected at least one seeded branch with a mapUrl");
  assert.equal(isValidMapUrl(branchWithMap.mapUrl), true);
});

test("isValidMapUrl rejects non-Google, non-https, or unrelated Google links", () => {
  assert.equal(isValidMapUrl("http://www.google.com/maps/place/x"), false); // not https
  assert.equal(isValidMapUrl("https://evil.example.com/maps"), false); // wrong host
  assert.equal(isValidMapUrl("https://www.google.com/search?q=x"), false); // google.com but not /maps
  assert.equal(isValidMapUrl("https://maps.app.goo.gl/abc123"), true);
  assert.equal(isValidMapUrl("https://goo.gl/maps/abc"), true);
});

test("the seed hero video and poster paths are accepted", () => {
  assert.equal(isValidVideoPath(seedData.content.home.hero.videoSrc), true);
  assert.equal(isValidImagePath(seedData.content.home.hero.posterSrc), true);
});

test("isValidVideoPath accepts mp4/webm site paths and uploads, rejects everything else", () => {
  assert.equal(isValidVideoPath("/videos/foo.mp4"), true);
  assert.equal(isValidVideoPath("/videos/foo.webm"), true);
  assert.equal(isValidVideoPath("/uploads/abcdef0123456789.mp4"), true);
  assert.equal(isValidVideoPath("/videos/foo.mov"), false);
  assert.equal(isValidVideoPath("https://evil.example.com/foo.mp4"), false);
  assert.equal(isValidVideoPath("//evil.example.com/foo.mp4"), false);
});

test("the seed WhatsApp numbers are accepted by isValidPhone", () => {
  assert.equal(isValidPhone(seedData.contact.whatsappNumber), true);
  assert.equal(isValidPhone(seedData.contact.orderWhatsappNumber), true);
});

test("isValidPhone rejects obviously-not-a-phone-number strings", () => {
  assert.equal(isValidPhone("abc"), false);
  assert.equal(isValidPhone(""), false);
  assert.equal(isValidPhone("123"), false);
});
