import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { pool } from "../src/db/pool.js";
import { resetDatabase, seedDatabase, createTestAdmin, buildApp, AUTH_HEADER } from "./helpers.js";

// Smallest possible valid 1x1 transparent PNG.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
);

// Minimal buffers with just enough real magic bytes to pass detection —
// not decodable video, but enough to exercise the "ftyp"/EBML sniffing.
const FAKE_MP4 = Buffer.concat([Buffer.from([0x00, 0x00, 0x00, 0x18]), Buffer.from("ftypisom"), Buffer.alloc(8)]);
const FAKE_WEBM = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(16)]);

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

test("uploading a real PNG succeeds and returns a site-relative path", async () => {
  const res = await agent
    .post("/api/admin/uploads")
    .set(AUTH_HEADER)
    .attach("image", TINY_PNG, "photo.png");
  assert.equal(res.status, 201);
  assert.match(res.body.path, /^\/uploads\/[a-f0-9]+\.png$/);
});

test("an uploaded file is served with hardening headers", async () => {
  const uploadRes = await agent.post("/api/admin/uploads").set(AUTH_HEADER).attach("image", TINY_PNG, "photo.png");
  assert.equal(uploadRes.status, 201);

  const fileRes = await request(app).get(uploadRes.body.path);
  assert.equal(fileRes.status, 200);
  assert.equal(fileRes.headers["x-content-type-options"], "nosniff");
  assert.equal(fileRes.headers["content-security-policy"], "default-src 'none'");
  assert.equal(fileRes.headers["content-disposition"], "inline");
});

test("a text file renamed to .png is rejected (magic bytes checked, not extension)", async () => {
  const fakePng = Buffer.from("this is definitely not a real image, just text");
  const res = await agent
    .post("/api/admin/uploads")
    .set(AUTH_HEADER)
    .attach("image", fakePng, { filename: "fake.png", contentType: "image/png" });
  assert.equal(res.status, 400);
});

test("an oversized image is rejected (5MB image limit)", async () => {
  const big = Buffer.concat([TINY_PNG, Buffer.alloc(6 * 1024 * 1024)]);
  const res = await agent
    .post("/api/admin/uploads")
    .set(AUTH_HEADER)
    .attach("image", big, { filename: "big.png", contentType: "image/png" });
  assert.equal(res.status, 413);
});

test("uploading a real mp4/webm succeeds via magic-byte detection", async () => {
  const mp4Res = await agent.post("/api/admin/uploads").set(AUTH_HEADER).attach("image", FAKE_MP4, { filename: "clip.mp4", contentType: "video/mp4" });
  assert.equal(mp4Res.status, 201);
  assert.match(mp4Res.body.path, /^\/uploads\/[a-f0-9]+\.mp4$/);
  assert.equal(mp4Res.body.kind, "video");

  const webmRes = await agent.post("/api/admin/uploads").set(AUTH_HEADER).attach("image", FAKE_WEBM, { filename: "clip.webm", contentType: "video/webm" });
  assert.equal(webmRes.status, 201);
  assert.match(webmRes.body.path, /^\/uploads\/[a-f0-9]+\.webm$/);
});

test("a text file renamed to .mp4 is rejected (magic bytes checked, not extension)", async () => {
  const fakeMp4 = Buffer.from("this is definitely not a real video, just text, but long enough");
  const res = await agent
    .post("/api/admin/uploads")
    .set(AUTH_HEADER)
    .attach("image", fakeMp4, { filename: "fake.mp4", contentType: "video/mp4" });
  assert.equal(res.status, 400);
});

test("an oversized video is rejected (30MB video limit)", async () => {
  const bigVideo = Buffer.concat([FAKE_MP4, Buffer.alloc(31 * 1024 * 1024)]);
  const res = await agent
    .post("/api/admin/uploads")
    .set(AUTH_HEADER)
    .attach("image", bigVideo, { filename: "big.mp4", contentType: "video/mp4" });
  assert.equal(res.status, 413);
});

test("the multer-level size-limit error message mentions both size limits", async () => {
  // Bigger than multer's own hard cap (30MB) — this is express-rate-limit's
  // sibling multer's LIMIT_FILE_SIZE, handled centrally in errorHandler.js.
  const tooBig = Buffer.concat([FAKE_MP4, Buffer.alloc(31 * 1024 * 1024)]);
  const res = await agent
    .post("/api/admin/uploads")
    .set(AUTH_HEADER)
    .attach("image", tooBig, { filename: "big.mp4", contentType: "video/mp4" });
  assert.equal(res.status, 413);
  assert.equal(res.body.error, "Max 5MB for images, 30MB for videos.");
});

test("more than 30 uploads in a minute are rate-limited", async () => {
  let lastStatus;
  for (let i = 0; i < 31; i += 1) {
    const res = await agent.post("/api/admin/uploads").set(AUTH_HEADER).attach("image", TINY_PNG, `photo${i}.png`);
    lastStatus = res.status;
    if (lastStatus === 429) break;
  }
  assert.equal(lastStatus, 429);
});
