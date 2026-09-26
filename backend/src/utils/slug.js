// Same rule the site's seed data was generated with: lowercase, any run of
// non [a-z0-9] characters becomes a single '-', leading/trailing '-' trimmed.
export function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const HANDLE_PATTERN = /^[a-z0-9-]+$/;

export function isValidHandle(value) {
  return typeof value === "string" && value.length > 0 && HANDLE_PATTERN.test(value);
}
