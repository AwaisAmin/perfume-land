import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { pool } from "../src/db/pool.js";
import { resetDatabase, seedDatabase, buildApp } from "./helpers.js";

const seedData = JSON.parse(
  readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "db", "seed-data.json"), "utf8")
);

let app;

before(async () => {
  await resetDatabase();
  await seedDatabase();
  app = buildApp();
});

after(async () => {
  await pool.end();
});

test("GET /api/public/health returns ok", async () => {
  const res = await request(app).get("/api/public/health");
  assert.equal(res.status, 200);
  assert.deepStrictEqual(res.body, { ok: true });
});

test("GET /api/public/site deep-equals the seed data (ignoring updatedAt)", async () => {
  const res = await request(app).get("/api/public/site");
  assert.equal(res.status, 200);
  assert.equal(res.headers["cache-control"], "no-store");
  assert.equal(typeof res.body.updatedAt, "string");

  const { updatedAt, ...body } = res.body;
  assert.deepStrictEqual(body, seedData);
});
