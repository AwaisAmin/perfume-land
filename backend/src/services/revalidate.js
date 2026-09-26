import { config } from "../config.js";

// Swappable so tests can spy on/replace the network call without a real
// website running at SITE_URL.
let fetchImpl = (...args) => fetch(...args);

export function setRevalidateFetch(fn) {
  fetchImpl = fn;
}

// Calls the website's revalidate endpoint and reports whether it answered
// OK. Never throws — a failure here must not fail the admin write (or
// seed/migrate run) that triggered it; callers that don't care about the
// result can just ignore the returned promise's resolved value.
export async function revalidateAndReport() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetchImpl(`${config.SITE_URL}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": config.REVALIDATE_SECRET },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`Revalidate call failed: ${res.status} ${res.statusText}`);
      return { ok: false, status: res.status };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    console.error("Revalidate call failed:", err.message);
    return { ok: false, error: err.message };
  }
}

// Fire-and-forget convenience wrapper for callers that don't need the result
// (e.g. after every admin write).
export async function triggerRevalidate() {
  await revalidateAndReport();
}
