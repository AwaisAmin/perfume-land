import { config, isProduction } from "../config.js";
import { findSessionByToken } from "../repositories/sessionsRepo.js";
import { findAdminById } from "../repositories/adminsRepo.js";

export const SESSION_COOKIE = "phb_session";

export function sessionCookieOptions(maxAgeMs) {
  const parts = [`Path=/`, `HttpOnly`, `SameSite=Strict`];
  if (isProduction) parts.push("Secure");
  if (maxAgeMs != null) parts.push(`Max-Age=${Math.floor(maxAgeMs / 1000)}`);
  return parts.join("; ");
}

export function setSessionCookie(res, token, maxAgeMs) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${sessionCookieOptions(maxAgeMs)}`);
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; ${sessionCookieOptions(0)}`);
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return res.status(401).json({ error: "Not signed in." } );

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ error: "Session expired. Please sign in again." });

  const admin = await findAdminById(session.admin_id);
  if (!admin) return res.status(401).json({ error: "Not signed in." });

  req.admin = { id: admin.id, email: admin.email };
  req.sessionToken = token;
  next();
}

// CSRF: the session cookie is SameSite=Strict, which already blocks
// cross-site requests from being sent with credentials. As defence in depth
// we also require a custom header that only same-origin JS can set (simple
// cross-site form posts / <img>/<script> cannot add custom headers).
export function requireCsrfHeader(req, res, next) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();
  if (req.headers["x-requested-with"] !== "perfume-land-admin") {
    return res.status(403).json({ error: "Request rejected (missing CSRF header)." });
  }
  next();
}
