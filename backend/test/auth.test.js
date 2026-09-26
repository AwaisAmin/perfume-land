import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { pool } from "../src/db/pool.js";
import { resetDatabase, seedDatabase, createTestAdmin, buildApp, AUTH_HEADER, TEST_CREDENTIALS } from "./helpers.js";

let app;
let admin;

before(async () => {
  await resetDatabase();
  await seedDatabase();
  admin = await createTestAdmin();
  app = buildApp();
});

after(async () => {
  await pool.end();
});

test("protected admin routes reject unauthenticated requests with 401", async () => {
  const res = await request(app).get("/api/admin/products");
  assert.equal(res.status, 401);
});

test("login with wrong password returns a generic invalid-credentials error", async () => {
  const res = await request(app)
    .post("/api/admin/auth/login")
    .set(AUTH_HEADER)
    .send({ email: admin.email, password: TEST_CREDENTIALS.wrong });
  assert.equal(res.status, 401);
  assert.equal(res.body.error, "Invalid email or password.");
});

test("login with an unknown email returns the same generic error", async () => {
  const res = await request(app)
    .post("/api/admin/auth/login")
    .set(AUTH_HEADER)
    .send({ email: "nobody@example.com", password: TEST_CREDENTIALS.unknownUser });
  assert.equal(res.status, 401);
  assert.equal(res.body.error, "Invalid email or password.");
});

test("login with correct credentials sets a session cookie and /me works", async () => {
  const agent = request.agent(app);
  const loginRes = await agent.post("/api/admin/auth/login").set(AUTH_HEADER).send({ email: admin.email, password: admin.password });
  assert.equal(loginRes.status, 200);
  assert.ok(loginRes.headers["set-cookie"]?.some((c) => c.startsWith("phb_session=")));

  const meRes = await agent.get("/api/admin/auth/me");
  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.admin.email, admin.email);
});

test("logout clears the session so subsequent requests are unauthenticated", async () => {
  const agent = request.agent(app);
  await agent.post("/api/admin/auth/login").set(AUTH_HEADER).send({ email: admin.email, password: admin.password });
  const logoutRes = await agent.post("/api/admin/auth/logout").set(AUTH_HEADER);
  assert.equal(logoutRes.status, 200);

  const meRes = await agent.get("/api/admin/auth/me");
  assert.equal(meRes.status, 401);
});

test("state-changing admin requests without the CSRF header are rejected", async () => {
  const agent = request.agent(app);
  await agent.post("/api/admin/auth/login").set(AUTH_HEADER).send({ email: admin.email, password: admin.password });
  const res = await agent.post("/api/admin/collections").send({ title: "No CSRF header" });
  assert.equal(res.status, 403);
});

test("login without the CSRF header is rejected", async () => {
  const res = await request(app).post("/api/admin/auth/login").send({ email: admin.email, password: admin.password });
  assert.equal(res.status, 403);
});

test("logout without the CSRF header is rejected", async () => {
  const agent = request.agent(app);
  await agent.post("/api/admin/auth/login").set(AUTH_HEADER).send({ email: admin.email, password: admin.password });
  const res = await agent.post("/api/admin/auth/logout");
  assert.equal(res.status, 403);
});

test("a successful login clears out that admin's own expired sessions", async () => {
  const [[row]] = await pool.query("SELECT id FROM admins WHERE email = ?", [admin.email]);
  const staleId = "0".repeat(64);
  await pool.query("INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, DATE_SUB(NOW(), INTERVAL 1 DAY))", [staleId, row.id]);

  const [[beforeCount]] = await pool.query("SELECT COUNT(*) AS n FROM sessions WHERE id = ?", [staleId]);
  assert.equal(beforeCount.n, 1);

  const agent = request.agent(app);
  await agent.post("/api/admin/auth/login").set(AUTH_HEADER).send({ email: admin.email, password: admin.password });

  const [[afterCount]] = await pool.query("SELECT COUNT(*) AS n FROM sessions WHERE id = ?", [staleId]);
  assert.equal(afterCount.n, 0);
});

test("repeated failed logins for the same email are rate-limited (429) after 10 attempts", async () => {
  const email = "rate-limit-probe@example.com";
  let lastStatus;
  for (let i = 0; i < 11; i += 1) {
    const res = await request(app).post("/api/admin/auth/login").set(AUTH_HEADER).send({ email, password: TEST_CREDENTIALS.unknownUser });
    lastStatus = res.status;
    if (i < 10) assert.equal(res.status, 401);
  }
  assert.equal(lastStatus, 429);
});
