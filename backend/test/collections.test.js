import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { pool } from "../src/db/pool.js";
import { resetDatabase, seedDatabase, createTestAdmin, buildApp, AUTH_HEADER } from "./helpers.js";

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

test("deleting a collection that still has products is refused with a clear message", async () => {
  const list = await agent.get("/api/admin/collections");
  const withProducts = list.body.collections.find((c) => c.productCount > 0);
  assert.ok(withProducts, "expected at least one seeded collection with products");

  const res = await agent.delete(`/api/admin/collections/${withProducts.dbId}`).set(AUTH_HEADER);
  assert.equal(res.status, 409);
  assert.match(res.body.error, /product/i);
});

test("an empty collection can be created and then deleted", async () => {
  const created = await agent.post("/api/admin/collections").set(AUTH_HEADER).send({ title: "Temporary Collection" });
  assert.equal(created.status, 201);
  assert.equal(created.body.collection.handle, "temporary-collection");

  const deleted = await agent.delete(`/api/admin/collections/${created.body.collection.dbId}`).set(AUTH_HEADER);
  assert.equal(deleted.status, 200);
});

test("collection reorder persists the new order", async () => {
  const list = await agent.get("/api/admin/collections");
  const ids = list.body.collections.map((c) => c.dbId);
  const reversed = [...ids].reverse();

  const res = await agent.post("/api/admin/collections/reorder").set(AUTH_HEADER).send({ orderedIds: reversed });
  assert.equal(res.status, 200);

  const after = await agent.get("/api/admin/collections");
  assert.deepStrictEqual(after.body.collections.map((c) => c.dbId), reversed);
});

test("heroImage only accepts a site path or an uploaded file path", async () => {
  const badExternal = await agent
    .post("/api/admin/collections")
    .set(AUTH_HEADER)
    .send({ title: "Bad Hero Image", heroImage: "https://evil.example.com/x.png" });
  assert.equal(badExternal.status, 400);

  const good = await agent
    .post("/api/admin/collections")
    .set(AUTH_HEADER)
    .send({ title: "Good Hero Image", heroImage: "/products/haris-bhai-bottle-filled.webp" });
  assert.equal(good.status, 201);
});

test("a collection's public id is immutable: it is never accepted or changed by the admin API", async () => {
  const list = await agent.get("/api/admin/collections");
  const target = list.body.collections[0];
  const originalId = target.id;

  const res = await agent
    .put(`/api/admin/collections/${target.dbId}`)
    .set(AUTH_HEADER)
    .send({ id: "hacked-id", title: target.title });
  assert.equal(res.status, 200);
  assert.equal(res.body.collection.id, originalId, "id must not change even if the client sends a different one");

  const site = await agent.get("/api/public/site");
  const publicCollection = site.body.collections.find((c) => c.handle === target.handle);
  assert.equal(publicCollection.id, originalId);
});
