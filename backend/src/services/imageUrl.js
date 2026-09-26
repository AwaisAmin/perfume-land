import { config } from "../config.js";

// Existing site images stay site-relative (served by Next.js from /public).
// Images uploaded through the CRM are stored as "/uploads/<file>" and must be
// returned to the website as absolute URLs so Next can fetch them from this
// backend regardless of where the site is hosted.
export function toAbsoluteImage(value) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/uploads/")) return `${config.PUBLIC_BASE_URL}${value}`;
  return value;
}
