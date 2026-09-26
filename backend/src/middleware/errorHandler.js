import { config } from "../config.js";

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not found." });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Max 5MB for images, 30MB for videos." });
  }

  // Any unique-constraint violation that slipped past our own pre-checks
  // (e.g. a race between two requests) becomes a clear 409, everywhere,
  // instead of a raw 500.
  if (err && err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "That value is already in use. Please choose a different one and try again." });
  }

  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const payload = { error: err.expose || status < 500 ? err.message : "Something went wrong. Please try again." };
  if (err.details) payload.details = err.details;

  if (status >= 500) {
    console.error(err);
  }
  if (config.NODE_ENV === "development" && status >= 500) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
