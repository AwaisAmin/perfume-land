import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { pool } from "../src/db/pool.js";
import { resetDatabase, seedDatabase, createTestAdmin, buildApp, AUTH_HEADER } from "./helpers.js";

let app;
let agent;
let admin;
let firstCollectionDbId;

const onePerfumeVariant = (price = 100) => [{ type: "Perfume", size: "50ml", price }];

before(async () => {
  await resetDatabase();
  await seedDatabase();
  admin = await createTestAdmin();
  app = buildApp();
  agent = request.agent(app);
  await agent.post("/api/admin/auth/login").set(AUTH_HEADER).send({ email: admin.email, password: admin.password });

  const collectionsRes = await agent.get("/api/admin/collections");
  firstCollectionDbId = collectionsRes.body.collections[0].dbId;
});

after(async () => {
  await pool.end();
});

test("list products supports search and collection filter", async () => {
  const res = await agent.get("/api/admin/products").query({ search: "Mukhalat" });
  assert.equal(res.status, 200);
  assert.ok(res.body.products.some((p) => p.title === "Mukhalat Oud"));

  const filtered = await agent.get("/api/admin/products").query({ collectionId: firstCollectionDbId });
  assert.equal(filtered.status, 200);
  assert.ok(filtered.body.products.every((p) => p.collectionId === firstCollectionDbId));
});

test("admin product list shows price range and variant count", async () => {
  const res = await agent.get("/api/admin/products").query({ search: "Musk Ul Hind" });
  assert.equal(res.status, 200);
  const musk = res.body.products.find((p) => p.title === "Musk Ul Hind");
  assert.ok(musk, "expected Musk Ul Hind in the list");
  assert.equal(musk.variantCount, 2);
  assert.equal(musk.minPrice, 140);
  assert.equal(musk.maxPrice, 180);
});

test("create product auto-generates a handle from the title", async () => {
  const res = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Brand New Scent", variants: onePerfumeVariant(100) });
  assert.equal(res.status, 201);
  assert.equal(res.body.product.handle, "brand-new-scent");
  assert.equal(res.body.product.inStock, true);
  assert.equal(res.body.product.price, 100);
  assert.equal(res.body.product.variants.length, 1);
  assert.match(res.body.product.variants[0].id, /^product-\d+-v1$/);
});

test("create product rejects a duplicate handle", async () => {
  const first = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Unique Scent One", handle: "dup-handle", variants: onePerfumeVariant(50) });
  assert.equal(first.status, 201);

  const second = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Unique Scent Two", handle: "dup-handle", variants: onePerfumeVariant(60) });
  assert.equal(second.status, 409);
});

test("create product requires at least one variant", async () => {
  const res = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "No Variants", variants: [] });
  assert.equal(res.status, 400);
});

test("create product validates negative price and bad handle characters", async () => {
  const negativePrice = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Bad Price", variants: [{ type: "Perfume", size: "50ml", price: -5 }] });
  assert.equal(negativePrice.status, 400);

  const badHandle = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Bad Handle", handle: "Not Valid!", variants: onePerfumeVariant(10) });
  assert.equal(badHandle.status, 400);
});

test("product image field only accepts a site path or an uploaded file path", async () => {
  const badExternal = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Bad Image", variants: onePerfumeVariant(10), image: "https://evil.example.com/x.png" });
  assert.equal(badExternal.status, 400);

  const badExtension = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Bad Extension", variants: onePerfumeVariant(10), image: "/products/x.exe" });
  assert.equal(badExtension.status, 400);

  const goodSitePath = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Good Image", variants: onePerfumeVariant(10), image: "/products/haris-bhai-bottle-filled.webp" });
  assert.equal(goodSitePath.status, 201);

  const goodUploadPath = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Good Upload Image", variants: onePerfumeVariant(10), image: "/uploads/abcdef0123456789.webp" });
  assert.equal(goodUploadPath.status, 201);
});

test("update and delete a product", async () => {
  const created = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Temp Product", variants: onePerfumeVariant(20) });
  const id = created.body.product.dbId;

  const updated = await agent.put(`/api/admin/products/${id}`).set(AUTH_HEADER).send({ title: "Temp Product Renamed" });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.product.title, "Temp Product Renamed");

  const deleted = await agent.delete(`/api/admin/products/${id}`).set(AUTH_HEADER);
  assert.equal(deleted.status, 200);

  const getAfterDelete = await agent.get(`/api/admin/products/${id}`);
  assert.equal(getAfterDelete.status, 404);
});

test("variant rule: 35ml must have no type, other sizes require a type", async () => {
  const typeOn35ml = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Bad 35ml", variants: [{ type: "EDT", size: "35ml", price: 30 }] });
  assert.equal(typeOn35ml.status, 400);

  const missingTypeOn50ml = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Bad 50ml", variants: [{ size: "50ml", price: 30 }] });
  assert.equal(missingTypeOn50ml.status, 400);

  const ok = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({
      collectionId: firstCollectionDbId,
      title: "Good Multi Variant",
      variants: [
        { size: "35ml", price: 25 },
        { type: "EDT", size: "50ml", price: 40 },
      ],
    });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.product.variants[0].type, null);
  assert.equal(ok.body.product.variants[1].type, "EDT");
});

test("variant rule: duplicate type+size combinations in one product are rejected", async () => {
  const res = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({
      collectionId: firstCollectionDbId,
      title: "Duplicate Variant Product",
      variants: [
        { type: "Perfume", size: "50ml", price: 40 },
        { type: "Perfume", size: "50ml", price: 45 },
      ],
    });
  assert.equal(res.status, 400);
});

test("PUT /:id/variants replaces variants, keeps stable ids for rows sent back, and syncs the product's summary columns", async () => {
  const created = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Variant Editing Target", variants: onePerfumeVariant(50) });
  const productDbId = created.body.product.dbId;
  const originalVariantId = created.body.product.variants[0].id;

  const updated = await agent
    .put(`/api/admin/products/${productDbId}/variants`)
    .set(AUTH_HEADER)
    .send({
      variants: [
        { id: originalVariantId, type: "Perfume", size: "50ml", price: 999 }, // keep + change price
        { type: "EDT", size: "100ml", price: 200 }, // new row
      ],
    });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.product.variants.length, 2);
  assert.equal(updated.body.product.variants[0].id, originalVariantId, "existing variant id must stay stable");
  assert.equal(updated.body.product.variants[0].price, 999);
  // Product-level fields mirror the first (default) variant.
  assert.equal(updated.body.product.price, 999);

  const refetched = await agent.get(`/api/admin/products/${productDbId}`);
  assert.equal(refetched.body.product.price, 999);
  assert.equal(refetched.body.product.variants.length, 2);
});

test("PUT /:id/variants rejects a payload with zero variants", async () => {
  const created = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Cannot Empty Variants", variants: onePerfumeVariant(50) });
  const productDbId = created.body.product.dbId;

  const res = await agent.put(`/api/admin/products/${productDbId}/variants`).set(AUTH_HEADER).send({ variants: [] });
  assert.equal(res.status, 400);
});

test("product.inStock is true if ANY variant is in stock, even if the default (first) variant is out of stock", async () => {
  const created = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({
      collectionId: firstCollectionDbId,
      title: "Mixed Stock Product",
      variants: [
        { type: "Perfume", size: "50ml", price: 50, inStock: false },
        { type: "Perfume", size: "100ml", price: 90, inStock: true },
      ],
    });
  assert.equal(created.status, 201);
  assert.equal(created.body.product.inStock, true);
  // price/compareAtPrice/size still mirror the FIRST variant regardless.
  assert.equal(created.body.product.price, 50);
  assert.equal(created.body.product.size, "50ml");

  const list = await agent.get("/api/admin/products").query({ search: "Mixed Stock Product" });
  assert.equal(list.body.products[0].inStock, true);
});

test("product.inStock is false only when EVERY variant is out of stock", async () => {
  const created = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({
      collectionId: firstCollectionDbId,
      title: "All Out Of Stock Product",
      variants: [{ type: "Perfume", size: "50ml", price: 50, inStock: false }],
    });
  assert.equal(created.body.product.inStock, false);
});

test("an empty or zero price is rejected, not silently saved as 0", async () => {
  const emptyPrice = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Empty Price", variants: [{ type: "Perfume", size: "50ml", price: "" }] });
  assert.equal(emptyPrice.status, 400);

  const zeroPrice = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Zero Price", variants: [{ type: "Perfume", size: "50ml", price: 0 }] });
  assert.equal(zeroPrice.status, 400);
});

test("compareAtPrice must be greater than price", async () => {
  const equalPrice = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Bad Compare Equal", variants: [{ type: "Perfume", size: "50ml", price: 50, compareAtPrice: 50 }] });
  assert.equal(equalPrice.status, 400);

  const lowerPrice = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Bad Compare Lower", variants: [{ type: "Perfume", size: "50ml", price: 50, compareAtPrice: 40 }] });
  assert.equal(lowerPrice.status, 400);

  const ok = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Good Compare", variants: [{ type: "Perfume", size: "50ml", price: 50, compareAtPrice: 90 }] });
  assert.equal(ok.status, 201);
});

test("replacing variants by swapping type/size between existing rows never trips the unique constraint", async () => {
  const created = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({
      collectionId: firstCollectionDbId,
      title: "Swap Variant Product",
      variants: [
        { type: "Perfume", size: "50ml", price: 50 },
        { type: "EDT", size: "100ml", price: 90 },
      ],
    });
  const productDbId = created.body.product.dbId;
  const [idA, idB] = created.body.product.variants.map((v) => v.id);

  // Swap: row that was Perfume/50ml becomes EDT/100ml and vice versa. A
  // naive row-by-row UPDATE would collide on the unique (product, type,
  // size) constraint mid-way through; delete-all-then-reinsert must not.
  const res = await agent
    .put(`/api/admin/products/${productDbId}/variants`)
    .set(AUTH_HEADER)
    .send({
      variants: [
        { id: idA, type: "EDT", size: "100ml", price: 95 },
        { id: idB, type: "Perfume", size: "50ml", price: 55 },
      ],
    });
  assert.equal(res.status, 200);
  assert.equal(res.body.product.variants.length, 2);
});

test("one PUT /:id request updates product fields AND variants together", async () => {
  const created = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Combined Save Product", variants: onePerfumeVariant(50) });
  const productDbId = created.body.product.dbId;

  const res = await agent
    .put(`/api/admin/products/${productDbId}`)
    .set(AUTH_HEADER)
    .send({
      title: "Combined Save Product Renamed",
      variants: [{ type: "EDT", size: "50ml", price: 77 }],
    });
  assert.equal(res.status, 200);
  assert.equal(res.body.product.title, "Combined Save Product Renamed");
  assert.equal(res.body.product.variants.length, 1);
  assert.equal(res.body.product.variants[0].type, "EDT");
  assert.equal(res.body.product.price, 77);
});

test("clearing optional fields (kicker, gender, image, description) with null actually clears them", async () => {
  const created = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({
      collectionId: firstCollectionDbId,
      title: "Clearable Fields Product",
      kicker: "Some kicker",
      gender: "unisex",
      description: "Some description",
      image: "/products/haris-bhai-bottle-filled.webp",
      variants: onePerfumeVariant(50),
    });
  const productDbId = created.body.product.dbId;
  assert.equal(created.body.product.kicker, "Some kicker");

  const cleared = await agent
    .put(`/api/admin/products/${productDbId}`)
    .set(AUTH_HEADER)
    .send({ kicker: null, gender: null, description: null, image: null });
  assert.equal(cleared.status, 200);
  assert.equal(cleared.body.product.kicker, undefined);
  assert.equal(cleared.body.product.gender, undefined);
  assert.equal(cleared.body.product.description, undefined);
  assert.equal(cleared.body.product.image, undefined);

  const refetched = await agent.get(`/api/admin/products/${productDbId}`);
  assert.equal(refetched.body.product.kicker, undefined);
  assert.equal(refetched.body.product.image, undefined);
});

test("a duplicate handle race is reported as a clear 409, not a raw 500", async () => {
  // Simulates two requests racing past the pre-check by inserting directly,
  // then trying to create through the API with the same handle.
  await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Race Handle", handle: "race-handle-test", variants: onePerfumeVariant(20) });

  const res = await agent
    .post("/api/admin/products")
    .set(AUTH_HEADER)
    .send({ collectionId: firstCollectionDbId, title: "Race Handle Two", handle: "race-handle-test", variants: onePerfumeVariant(30) });
  assert.equal(res.status, 409);
  assert.match(res.body.error, /already used/i);
});
