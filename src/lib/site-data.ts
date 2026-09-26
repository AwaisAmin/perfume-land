import "server-only";
import { cache } from "react";
import { fallbackSiteData } from "@/lib/site-data-fallback";
import { sanitizeSiteData } from "@/lib/site-data-sanitize";
import type { ClientSiteData, SiteData } from "@/lib/types";

/** Cache tag shared with `app/api/revalidate/route.ts`. */
export const SITE_CACHE_TAG = "site";

const FETCH_TIMEOUT_MS = 8000;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isNonEmptyStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const optStr = (v: unknown) => v === undefined || isStr(v);
const optNum = (v: unknown) => v === undefined || isNum(v);
const arrOf = (v: unknown, check: (x: unknown) => boolean) => Array.isArray(v) && v.every(check);

const isLink = (v: unknown) => isObj(v) && isStr(v.label) && isStr(v.href);
const isColumn = (v: unknown) => isObj(v) && isStr(v.title) && isStr(v.body);

function isProduct(v: unknown): boolean {
  return (
    isObj(v) &&
    isNonEmptyStr(v.id) &&
    isNonEmptyStr(v.handle) &&
    isStr(v.title) &&
    isNum(v.price) &&
    optNum(v.compareAtPrice) &&
    optStr(v.kicker) &&
    optStr(v.image) &&
    (v.gender === undefined || v.gender === "unisex" || v.gender === "women" || v.gender === "men") &&
    (v.inStock === undefined || typeof v.inStock === "boolean") &&
    optStr(v.description) &&
    optStr(v.size) &&
    optNum(v.stockCount)
  );
}

function isCollection(v: unknown): boolean {
  return (
    isObj(v) &&
    isNonEmptyStr(v.id) &&
    isNonEmptyStr(v.handle) &&
    isStr(v.kicker) &&
    isStr(v.title) &&
    optStr(v.pageTitle) &&
    optStr(v.heroImage) &&
    arrOf(v.products, isProduct)
  );
}

/** Lightweight structural check — enough to reject garbage, not a full schema. */
export function isSiteData(v: unknown): v is SiteData {
  if (!isObj(v)) return false;
  const { featuredProduct: fp, beforeAfterImages: ba, brand, contact, nav } = v;
  return (
    arrOf(v.collections, isCollection) &&
    (v.collections as unknown[]).length > 0 &&
    isObj(fp) &&
    isNonEmptyStr(fp.handle) &&
    isStr(fp.title) &&
    isStr(fp.description) &&
    optStr(fp.image) &&
    arrOf(fp.variants, (x) => isObj(x) && isStr(x.size) && isNum(x.price) && optNum(x.compareAtPrice)) &&
    arrOf(
      v.shopTheLookGroups,
      (g) =>
        isObj(g) &&
        isStr(g.image) &&
        arrOf(g.items, (i) => isObj(i) && isStr(i.handle) && isStr(i.title) && isNum(i.price) && isStr(i.image) && isNum(i.top) && isNum(i.left)),
    ) &&
    isObj(ba) &&
    isStr(ba.him) &&
    isStr(ba.her) &&
    isNonEmptyStr(v.bottleImage) &&
    isObj(brand) &&
    isStr(brand.journeyImage) &&
    arrOf(brand.brandValues, isColumn) &&
    arrOf(brand.brandCraft, isColumn) &&
    isObj(contact) &&
    isStr(contact.whatsappNumber) &&
    arrOf(contact.branches, (b) => isObj(b) && isStr(b.name) && isStr(b.address) && optStr(b.mapUrl)) &&
    isObj(nav) &&
    arrOf(nav.brandImpressionsGroups, (g) => isObj(g) && isStr(g.title) && arrOf(g.links, isLink)) &&
    arrOf(nav.primaryNavStart, isLink) &&
    arrOf(nav.primaryNavEnd, isLink) &&
    arrOf(v.announcements, isStr) &&
    isNum(v.freeShippingThreshold) &&
    (v.updatedAt === undefined || isStr(v.updatedAt))
  );
}

/** How long a page rendered with fallback content (API down at request time) may stay cached. */
const FALLBACK_REVALIDATE_SECONDS = 60;

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

let warned = false;
function withFallback(reason: string): SiteData {
  if (!warned) {
    warned = true;
    console.warn(`[site-data] Using bundled fallback content: ${reason}`);
  }
  return normalizedFallback();
}

let normalized: SiteData | undefined;
/** The bundle, run through the same normalisation (derived featured variants etc.). */
function normalizedFallback(): SiteData {
  normalized ??= sanitize(fallbackSiteData);
  return normalized;
}

/**
 * The API failed at request time. The bundled content is still rendered (the
 * site never 500s), but it must not be cached indefinitely: a fetch with a
 * short `next.revalidate` lowers the whole route's revalidation interval
 * (see fetch docs: "the whole route revalidation interval will be
 * decreased"), so the page is re-rendered — and the API retried — within a
 * minute. The fetch is re-tried here; if it succeeds, its data is used.
 */
async function retryWithShortRevalidate(url: URL, reason: string): Promise<SiteData> {
  try {
    const res = await fetch(url, {
      next: { revalidate: FALLBACK_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (res.ok) {
      const data: unknown = await res.json();
      if (isSiteData(data)) return sanitize(data);
    }
  } catch {
    // fall through to the bundled content
  }
  return withFallback(reason);
}

function sanitize(data: SiteData): SiteData {
  return sanitizeSiteData(data, process.env.NEXT_PUBLIC_API_ORIGIN, fallbackSiteData);
}

async function loadSiteData(): Promise<SiteData> {
  const apiUrl = process.env.API_URL;
  // No API configured at all = intentionally static site: always use the bundle.
  if (!apiUrl) return withFallback("API_URL is not set");

  let url: URL;
  try {
    url = new URL("/api/public/site", apiUrl);
  } catch {
    return withFallback("API_URL is not a valid URL");
  }

  let reason: string;
  try {
    const res = await fetch(url, {
      cache: "force-cache",
      next: { tags: [SITE_CACHE_TAG] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (res.ok) {
      const data: unknown = await res.json();
      if (isSiteData(data)) return sanitize(data);
      reason = "API response has an invalid shape";
    } else {
      reason = `API responded ${res.status}`;
    }
  } catch (error) {
    reason = error instanceof Error ? error.message : String(error);
  }

  // During `next build` the fallback is baked into the static pages (they
  // are refreshed by the first /api/revalidate call from the CRM).
  if (isBuild) return withFallback(reason);
  return retryWithShortRevalidate(url, reason);
}

/**
 * All storefront content. Cached (static) under the "site" tag until the CRM
 * calls /api/revalidate; deduplicated within a single render.
 */
export const getSiteData = cache(loadSiteData);

/** The small slice client components need; passed once through SiteDataProvider. */
export function toClientSiteData(data: SiteData): ClientSiteData {
  const { collections, nav, announcements, freeShippingThreshold, bottleImage, contact, content } = data;
  const { header, cart, checkout, search, productCard, floatingChat, collectionPage } = content;
  // The browser only needs what cards, search, header and cart use: no
  // stock counts. Descriptions stay: search matches on them.
  const clientCollections = collections.map((c) => ({
    ...c,
    products: c.products.map((p) => {
      const slim = { ...p };
      delete slim.stockCount;
      return slim;
    }),
  }));
  return {
    collections: clientCollections,
    nav,
    announcements,
    freeShippingThreshold,
    bottleImage,
    orderWhatsappNumber: contact.orderWhatsappNumber,
    content: { header, cart, checkout, search, productCard, floatingChat, collectionPage },
  };
}
