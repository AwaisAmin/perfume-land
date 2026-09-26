import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../src/db/pool.js";
import { resetDatabase, seedDatabase, createTestAdmin, buildApp, AUTH_HEADER } from "./helpers.js";

const seedData = JSON.parse(
  readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "db", "seed-data.json"), "utf8")
);

let app;
let agent;

before(async () => {
  await resetDatabase();
  await seedDatabase();
  const admin = await createTestAdmin();
  app = buildApp();
  agent = request.agent(app);
  await agent.post("/api/admin/auth/login").set(AUTH_HEADER).send({ email: admin.email, password: admin.password });
});

after(async () => {
  await pool.end();
});

test("updating freeShippingThreshold with a valid number succeeds", async () => {
  const res = await agent.put("/api/admin/settings/freeShippingThreshold").set(AUTH_HEADER).send({ value: 1000 });
  assert.equal(res.status, 200);
  assert.equal(res.body.value, 1000);
});

test("updating freeShippingThreshold with a negative number is rejected", async () => {
  const res = await agent.put("/api/admin/settings/freeShippingThreshold").set(AUTH_HEADER).send({ value: -1 });
  assert.equal(res.status, 400);
});

test("updating contact requires the shape defined for that key", async () => {
  const res = await agent.put("/api/admin/settings/contact").set(AUTH_HEADER).send({ value: { whatsappNumber: "" } });
  assert.equal(res.status, 400);

  const ok = await agent
    .put("/api/admin/settings/contact")
    .set(AUTH_HEADER)
    .send({ value: { whatsappNumber: "+92 300 0000000", orderWhatsappNumber: "+92 300 0000000", branches: [{ name: "Test Branch", address: "Somewhere" }] } });
  assert.equal(ok.status, 200);
});

test("an unknown settings key is rejected", async () => {
  const res = await agent.put("/api/admin/settings/notARealKey").set(AUTH_HEADER).send({ value: "x" });
  assert.equal(res.status, 404);
});

test("branch mapUrl only accepts https Google Maps links", async () => {
  const badHost = await agent
    .put("/api/admin/settings/contact")
    .set(AUTH_HEADER)
    .send({
      value: {
        whatsappNumber: "+92 300 0000000",
        orderWhatsappNumber: "+92 300 0000000",
        branches: [{ name: "Test Branch", address: "Somewhere", mapUrl: "https://evil.example.com/maps" }],
      },
    });
  assert.equal(badHost.status, 400);

  const notHttps = await agent
    .put("/api/admin/settings/contact")
    .set(AUTH_HEADER)
    .send({
      value: {
        whatsappNumber: "+92 300 0000000",
        orderWhatsappNumber: "+92 300 0000000",
        branches: [{ name: "Test Branch", address: "Somewhere", mapUrl: "http://www.google.com/maps/place/x" }],
      },
    });
  assert.equal(notHttps.status, 400);

  const good = await agent
    .put("/api/admin/settings/contact")
    .set(AUTH_HEADER)
    .send({
      value: {
        whatsappNumber: "+92 300 0000000",
        orderWhatsappNumber: "+92 300 0000000",
        branches: [{ name: "Test Branch", address: "Somewhere", mapUrl: "https://maps.app.goo.gl/abc123" }],
      },
    });
  assert.equal(good.status, 200);
});

test("nav links must be site-relative, not off-site URLs", async () => {
  const offSite = await agent
    .put("/api/admin/settings/nav")
    .set(AUTH_HEADER)
    .send({
      value: {
        brandImpressionsGroups: [],
        primaryNavStart: [{ label: "Evil", href: "https://evil.example.com" }],
        primaryNavEnd: [],
      },
    });
  assert.equal(offSite.status, 400);

  const good = await agent
    .put("/api/admin/settings/nav")
    .set(AUTH_HEADER)
    .send({
      value: {
        brandImpressionsGroups: [],
        primaryNavStart: [{ label: "Home", href: "/" }],
        primaryNavEnd: [],
      },
    });
  assert.equal(good.status, 200);
});

test("image settings only accept a site path or an uploaded file path", async () => {
  const badBottle = await agent
    .put("/api/admin/settings/bottleImage")
    .set(AUTH_HEADER)
    .send({ value: "https://evil.example.com/x.png" });
  assert.equal(badBottle.status, 400);

  const goodBottle = await agent
    .put("/api/admin/settings/bottleImage")
    .set(AUTH_HEADER)
    .send({ value: "/products/haris-bhai-bottle-filled.webp" });
  assert.equal(goodBottle.status, 200);

  const badBrand = await agent
    .put("/api/admin/settings/brand")
    .set(AUTH_HEADER)
    .send({ value: { journeyImage: "not-a-path", brandValues: [], brandCraft: [] } });
  assert.equal(badBrand.status, 400);
});

test("the content settings key accepts the seed content as-is", async () => {
  const res = await agent.put("/api/admin/settings/content").set(AUTH_HEADER).send({ value: seedData.content });
  assert.equal(res.status, 200);
});

test("content settings rejects an off-site nav link inside content", async () => {
  const bad = structuredClone(seedData.content);
  bad.home.mediaGrid.items[0].href = "https://evil.example.com";
  const res = await agent.put("/api/admin/settings/content").set(AUTH_HEADER).send({ value: bad });
  assert.equal(res.status, 400);
});

test("content settings rejects a non-https social link", async () => {
  const bad = structuredClone(seedData.content);
  bad.footer.socialLinks[0].href = "http://insecure.example.com";
  const res = await agent.put("/api/admin/settings/content").set(AUTH_HEADER).send({ value: bad });
  assert.equal(res.status, 400);
});

test("content settings rejects a bad hero video path", async () => {
  const bad = structuredClone(seedData.content);
  bad.home.hero.videoSrc = "https://evil.example.com/video.mp4";
  const res = await agent.put("/api/admin/settings/content").set(AUTH_HEADER).send({ value: bad });
  assert.equal(res.status, 400);

  const badExt = structuredClone(seedData.content);
  badExt.home.hero.videoSrc = "/videos/x.mov";
  const res2 = await agent.put("/api/admin/settings/content").set(AUTH_HEADER).send({ value: badExt });
  assert.equal(res2.status, 400);
});

test("content settings rejects an unknown trust badge icon", async () => {
  const bad = structuredClone(seedData.content);
  bad.trustBadges[0].icon = "sparkles";
  const res = await agent.put("/api/admin/settings/content").set(AUTH_HEADER).send({ value: bad });
  assert.equal(res.status, 400);
});

test("social links are restricted to each platform's real domain (including www/m subdomains)", async () => {
  const wrongHost = structuredClone(seedData.content);
  wrongHost.footer.socialLinks[0].platform = "instagram";
  wrongHost.footer.socialLinks[0].href = "https://evil.example.com/harissbhaiperfumer";
  const res = await agent.put("/api/admin/settings/content").set(AUTH_HEADER).send({ value: wrongHost });
  assert.equal(res.status, 400);

  const wrongPlatformHost = structuredClone(seedData.content);
  wrongPlatformHost.footer.socialLinks[0].platform = "instagram";
  wrongPlatformHost.footer.socialLinks[0].href = "https://www.tiktok.com/@harissbhaiperfumer";
  const res2 = await agent.put("/api/admin/settings/content").set(AUTH_HEADER).send({ value: wrongPlatformHost });
  assert.equal(res2.status, 400);

  const goodWithSubdomain = structuredClone(seedData.content);
  goodWithSubdomain.footer.socialLinks[0].platform = "facebook";
  goodWithSubdomain.footer.socialLinks[0].href = "https://m.facebook.com/harissbhaiperfumer";
  const res3 = await agent.put("/api/admin/settings/content").set(AUTH_HEADER).send({ value: goodWithSubdomain });
  assert.equal(res3.status, 200);

  const goodWhatsapp = structuredClone(seedData.content);
  goodWhatsapp.footer.socialLinks = goodWhatsapp.footer.socialLinks.filter((l) => l.platform !== "whatsapp");
  goodWhatsapp.footer.socialLinks.push({ platform: "whatsapp", label: "WhatsApp", href: "https://wa.me/923211128481" });
  const res4 = await agent.put("/api/admin/settings/content").set(AUTH_HEADER).send({ value: goodWhatsapp });
  assert.equal(res4.status, 200);
});
