import { z } from "zod";

// Images: either an existing site-relative asset (served by Next.js from
// /public, e.g. "/products/foo.webp") or a file uploaded through this CRM
// (served by this backend from /uploads).
export const SITE_IMAGE_PATTERN = /^\/(?!\/)[A-Za-z0-9._\-/]+\.(webp|png|jpe?g|svg|avif)$/;
export const UPLOAD_IMAGE_PATTERN = /^\/uploads\/[a-f0-9]+\.(jpg|png|webp)$/;

export function isValidImagePath(value) {
  return typeof value === "string" && (SITE_IMAGE_PATTERN.test(value) || UPLOAD_IMAGE_PATTERN.test(value));
}

const IMAGE_MESSAGE = "Image must be an existing site path (e.g. /products/foo.webp) or an uploaded file (/uploads/....)";

export const imagePathSchema = z.string().trim().refine(isValidImagePath, IMAGE_MESSAGE);

// Same as imagePathSchema but "" is allowed (means "no image set").
export const optionalImagePathSchema = z
  .string()
  .trim()
  .optional()
  .refine((v) => v === undefined || v === "" || isValidImagePath(v), IMAGE_MESSAGE);

// Same, but also accepts an explicit `null` — used on update endpoints where
// the CRM needs to be able to actively clear an optional field, not just
// leave it out of the request body.
export const nullableImagePathSchema = z
  .string()
  .trim()
  .nullable()
  .optional()
  .refine((v) => v === undefined || v === null || v === "" || isValidImagePath(v), IMAGE_MESSAGE);

// Nav links must point somewhere on this site, never off-site.
export const SITE_HREF_PATTERN = /^\/(?!\/)[A-Za-z0-9\-._~/?=&#%]*$/;

export function isValidSiteHref(value) {
  return typeof value === "string" && SITE_HREF_PATTERN.test(value);
}

export const siteHrefSchema = z
  .string()
  .trim()
  .refine(isValidSiteHref, "Link must be a site-relative path starting with / (e.g. /collections/standard-collection)");

// Branch map links: only real Google Maps links over https.
const ALLOWED_MAP_HOSTS = new Set(["google.com", "www.google.com", "maps.google.com", "maps.app.goo.gl", "goo.gl"]);

export function isValidMapUrl(value) {
  if (typeof value !== "string" || !value) return false;
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (!ALLOWED_MAP_HOSTS.has(url.hostname)) return false;
  if (url.hostname === "google.com" || url.hostname === "www.google.com" || url.hostname === "maps.google.com") {
    return url.pathname.startsWith("/maps");
  }
  return true; // maps.app.goo.gl / goo.gl short links have no fixed path
}

export const mapUrlSchema = z
  .string()
  .trim()
  .refine(isValidMapUrl, "Map link must be an https Google Maps link (google.com/maps, maps.app.goo.gl or goo.gl)");

// Video: same idea as images — an existing site-relative asset, or a file
// uploaded through this CRM.
export const SITE_VIDEO_PATTERN = /^\/(?!\/)[A-Za-z0-9._\-/]+\.(mp4|webm)$/;
export const UPLOAD_VIDEO_PATTERN = /^\/uploads\/[a-f0-9]+\.(mp4|webm)$/;

export function isValidVideoPath(value) {
  return typeof value === "string" && (SITE_VIDEO_PATTERN.test(value) || UPLOAD_VIDEO_PATTERN.test(value));
}

const VIDEO_MESSAGE = "Video must be an existing site path (e.g. /videos/foo.mp4) or an uploaded file (/uploads/....)";

export const videoPathSchema = z.string().trim().refine(isValidVideoPath, VIDEO_MESSAGE);

// An https-only external link (social profiles, the footer credit link).
// `allowEmpty` lets a platform like WhatsApp — whose href is ignored by the
// site in favour of contact.whatsappNumber — be left blank.
export function externalHttpsLinkSchema({ allowEmpty = false } = {}) {
  const base = z.string().trim().url().refine((v) => v.startsWith("https://"), "Link must use https://");
  return allowEmpty ? z.union([z.literal(""), base]) : base;
}

// Phone-ish: optional leading +, then 7-15 digits, spaces/dashes allowed
// between digits (loose on purpose — this is a WhatsApp contact number, not
// a strictly validated phone number).
export const PHONE_PATTERN = /^\+?[0-9](?:[0-9\s-]{5,18})[0-9]$/;

export function isValidPhone(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!PHONE_PATTERN.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export const phoneSchema = z.string().trim().refine(isValidPhone, "Enter a valid phone number (7-15 digits, optionally starting with +).");
