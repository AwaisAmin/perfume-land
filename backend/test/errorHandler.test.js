import { test } from "node:test";
import assert from "node:assert/strict";
import { errorHandler } from "../src/middleware/errorHandler.js";

function fakeRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

test("errorHandler does not include a stack trace outside development (NODE_ENV=test here)", () => {
  const res = fakeRes();
  const err = new Error("boom");
  err.status = 500;
  errorHandler(err, {}, res, () => {});

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error, "Something went wrong. Please try again.");
  assert.equal("stack" in res.body, false);
});

test("errorHandler exposes 4xx messages directly (they're meant for the admin UI)", () => {
  const res = fakeRes();
  const err = new Error("Handle is already used.");
  err.status = 409;
  errorHandler(err, {}, res, () => {});

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.error, "Handle is already used.");
});
