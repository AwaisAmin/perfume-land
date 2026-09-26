import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { SITE_CACHE_TAG } from "@/lib/site-data";

/** Constant-time string comparison (length mismatch is rejected without leaking where). */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

/**
 * Called by the CRM backend after every content change. Marks the "site"
 * data stale so the next visit renders fresh content.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret");
  if (!secret || !provided || !safeEqual(provided, secret)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  // expire: 0 → the next request re-fetches instead of serving stale content.
  revalidateTag(SITE_CACHE_TAG, { expire: 0 });
  // Pages rendered while the API was down used the bundled fallback and never
  // fetched the tagged data, so refresh every path as well.
  revalidatePath("/", "layout");

  return Response.json({ revalidated: true });
}
