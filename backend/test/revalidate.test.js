import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { pool } from "../src/db/pool.js";
import { resetDatabase, seedDatabase, createTestAdmin, buildApp, AUTH_HEADER } from "./helpers.js";
import { setRevalidateFetch } from "../src/services/revalidate.js";

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

test("a successful admin write triggers a call to the website's revalidate endpoint", async () => {
  const calls = [];
  setRevalidateFetch(async (url, opts) => {
    calls.push({ url, opts });
    return { ok: true, status: 200, statusText: "OK" };
  });

  const res = await agent.post("/api/admin/collections").set(AUTH_HEADER).send({ title: "Revalidate Check" });
  assert.equal(res.status, 201);

  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/api\/revalidate$/);
  assert.equal(calls[0].opts.headers["x-revalidate-secret"], process.env.REVALIDATE_SECRET);

  setRevalidateFetch((...args) => fetch(...args));
});

test("a failing revalidate call is logged but does not fail the write", async () => {
  setRevalidateFetch(async () => {
    throw new Error("network down");
  });

  const res = await agent.post("/api/admin/collections").set(AUTH_HEADER).send({ title: "Revalidate Failure Check" });
  assert.equal(res.status, 201);

  setRevalidateFetch((...args) => fetch(...args));
});

test("POST /api/admin/revalidate reports success when the site answers OK", async () => {
  setRevalidateFetch(async () => ({ ok: true, status: 200, statusText: "OK" }));

  const res = await agent.post("/api/admin/revalidate").set(AUTH_HEADER);
  assert.equal(res.status, 200);
  assert.equal(res.body.siteOk, true);

  setRevalidateFetch((...args) => fetch(...args));
});

test("POST /api/admin/revalidate reports failure (not a 500) when the site is unreachable", async () => {
  setRevalidateFetch(async () => {
    throw new Error("site down");
  });

  const res = await agent.post("/api/admin/revalidate").set(AUTH_HEADER);
  assert.equal(res.status, 200);
  assert.equal(res.body.siteOk, false);

  setRevalidateFetch((...args) => fetch(...args));
});
