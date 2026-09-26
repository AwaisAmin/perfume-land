import {
  VARIANT_SIZES,
  VARIANT_TYPES,
  type Collection,
  type LinkContent,
  type NavGroup,
  type NavLink,
  type Product,
  type SiteContent,
  type SiteData,
  type Variant,
} from "@/lib/types";

/** A site-relative path ("/x"), not a protocol-relative URL ("//host/x"). */
// Strict allow-list: a single leading "/", then only URL-safe characters
// (no whitespace/control characters, no backslashes, no "//" host tricks).
const SITE_PATH = /^\/(?![/\\])[A-Za-z0-9\-._~/?=&#%]*$/;
export function isSitePath(value: string): boolean {
  return SITE_PATH.test(value);
}

/** An upload served by the CRM backend: same origin as NEXT_PUBLIC_API_ORIGIN, under /uploads/. */
function isApiUpload(value: string, apiOrigin: string | undefined): boolean {
  if (!apiOrigin) return false;
  try {
    const url = new URL(value);
    return url.origin === new URL(apiOrigin).origin && url.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}

function isHttps(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/* ---------------------------------------------------------------- content */

/** True when `value` has every key of `template` with the same primitive/array/object kind. */
function matchesTemplate(template: unknown, value: unknown): boolean {
  if (typeof template === "string") return typeof value === "string";
  if (typeof template === "number") return isNum(value);
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return false;
    const item = template[0];
    return item === undefined || value.every((v) => matchesTemplate(item, v));
  }
  if (isObj(template)) return isObj(value) && Object.keys(template).every((k) => matchesTemplate(template[k], value[k]));
  return false;
}

/** Keeps only the template's keys (drops anything extra the API sent). */
function pick(template: unknown, value: unknown): unknown {
  if (Array.isArray(template)) {
    const item = template[0];
    return (value as unknown[]).map((v) => (item === undefined ? v : pick(item, v)));
  }
  if (isObj(template)) {
    const out: Obj = {};
    for (const k of Object.keys(template)) out[k] = pick(template[k], (value as Obj)[k]);
    return out;
  }
  return value;
}

/**
 * Field-by-field merge: every leaf the API got right is used, anything
 * missing or of the wrong kind comes from the bundled default. Arrays are
 * taken whole when every element is valid, else the default array is used.
 */
function mergeWithDefaults(template: unknown, value: unknown): unknown {
  if (Array.isArray(template)) return matchesTemplate(template, value) ? pick(template, value) : template;
  if (isObj(template)) {
    const source = isObj(value) ? value : {};
    const out: Obj = {};
    for (const k of Object.keys(template)) out[k] = mergeWithDefaults(template[k], source[k]);
    return out;
  }
  return matchesTemplate(template, value) ? value : template;
}

const VIDEO_EXT = /\.(mp4|webm)$/i;
const SOCIAL_PLATFORMS = new Set(["instagram", "youtube", "tiktok", "facebook", "whatsapp"]);
const BADGE_ICONS = new Set(["truck", "headphones", "shield"]);

function sanitizeContent(raw: unknown, defaults: SiteContent, okImage: (v: string) => boolean, apiOrigin: string | undefined): SiteContent {
  const c = mergeWithDefaults(defaults, raw) as SiteContent;
  const link = (l: LinkContent, fallback: LinkContent): LinkContent => (isSitePath(l.href) ? l : fallback);
  const links = (list: LinkContent[]) => list.filter((l) => isSitePath(l.href));
  const sitePath = (v: string, fallback: string) => (isSitePath(v) ? v : fallback);
  const d = defaults;

  const video = c.home.hero.videoSrc;
  let videoOk = false;
  try {
    videoOk = (isSitePath(video) || isApiUpload(video, apiOrigin)) && VIDEO_EXT.test(new URL(video, "http://localhost").pathname);
  } catch {
    videoOk = false;
  }

  return {
    ...c,
    home: {
      ...c.home,
      hero: {
        ...c.home.hero,
        videoSrc: videoOk ? video : d.home.hero.videoSrc,
        posterSrc: okImage(c.home.hero.posterSrc) ? c.home.hero.posterSrc : d.home.hero.posterSrc,
        ctaHref: sitePath(c.home.hero.ctaHref, d.home.hero.ctaHref),
      },
      mediaGrid: { ...c.home.mediaGrid, items: links(c.home.mediaGrid.items) },
      beforeAfter: {
        him: { ...c.home.beforeAfter.him, href: sitePath(c.home.beforeAfter.him.href, d.home.beforeAfter.him.href) },
        her: { ...c.home.beforeAfter.her, href: sitePath(c.home.beforeAfter.her.href, d.home.beforeAfter.her.href) },
      },
    },
    trustBadges: c.trustBadges.filter((b) => BADGE_ICONS.has(b.icon)),
    footer: {
      ...c.footer,
      socialLinks: c.footer.socialLinks.filter(
        (s) => SOCIAL_PLATFORMS.has(s.platform) && (s.platform === "whatsapp" || isHttps(s.href)),
      ),
      exploreLinksStart: links(c.footer.exploreLinksStart),
      exploreLinksEnd: links(c.footer.exploreLinksEnd),
      shopAll: link(c.footer.shopAll, d.footer.shopAll),
      helpLinks: links(c.footer.helpLinks),
      credit: isHttps(c.footer.credit.href) ? c.footer.credit : d.footer.credit,
    },
    contactPage: { ...c.contactPage, link: link(c.contactPage.link, d.contactPage.link) },
  };
}

/* --------------------------------------------------------------- variants */

const TYPES = new Set<unknown>(VARIANT_TYPES);
const SIZES = new Set<unknown>(VARIANT_SIZES);

function toVariant(v: unknown): Variant | null {
  if (!isObj(v) || typeof v.id !== "string" || !v.id || !SIZES.has(v.size) || !isNum(v.price)) return null;
  if (v.compareAtPrice !== undefined && !isNum(v.compareAtPrice)) return null;
  if (typeof v.inStock !== "boolean") return null;
  const size = v.size as Variant["size"];
  // 35ml never has a type.
  const type = size === "35ml" ? null : TYPES.has(v.type) ? (v.type as Variant["type"]) : null;
  if (size !== "35ml" && type === null) return null;
  const out: Variant = { id: v.id, type, size, price: v.price, inStock: v.inStock };
  if (v.compareAtPrice !== undefined) out.compareAtPrice = v.compareAtPrice;
  return out;
}

/** Products whose variants came from the data itself (not the built-in default). */
type VariantSource = { variants: Variant[]; fromData: boolean };

/** The product's variants if valid, else one default "Perfume" variant built from its own fields. */
function productVariants(p: Product): VariantSource {
  const raw: unknown = (p as { variants?: unknown }).variants;
  if (Array.isArray(raw) && raw.length > 0) {
    const seen = new Set<string>();
    const out: Variant[] = [];
    for (const item of raw) {
      const v = toVariant(item);
      if (!v) return { variants: defaultVariants(p), fromData: false };
      const key = `${v.type}|${v.size}`;
      if (seen.has(key) || out.some((o) => o.id === v.id)) continue;
      seen.add(key);
      out.push(v);
    }
    return { variants: out, fromData: true };
  }
  return { variants: defaultVariants(p), fromData: false };
}

function defaultVariants(p: Product): Variant[] {
  const size = SIZES.has(p.size) ? (p.size as Variant["size"]) : "50ml";
  const v: Variant = { id: `${p.id}-v1`, type: size === "35ml" ? null : "Perfume", size, price: p.price, inStock: p.inStock !== false };
  if (p.compareAtPrice !== undefined) v.compareAtPrice = p.compareAtPrice;
  return [v];
}

/* ------------------------------------------------------------------ main */

/**
 * Makes API content complete and safe to render:
 * - fills `content`, `variants`, `contact.orderWhatsappNumber` from the
 *   bundled defaults when missing/invalid (field by field);
 * - next/image throws (500s the page) on hosts that are not configured, so
 *   any image that is neither a local path nor a CRM upload on
 *   NEXT_PUBLIC_API_ORIGIN is replaced; non-site-relative links and
 *   non-https external links are dropped;
 * - derives featuredProduct.variants from the featured product's variants.
 */
export function sanitizeSiteData(data: SiteData, apiOrigin: string | undefined, defaults: SiteData): SiteData {
  const okImage = (v: string) => isSitePath(v) || isApiUpload(v, apiOrigin);
  const img = (v: string, fallback = defaults.bottleImage) => (okImage(v) ? v : fallback);
  const optImg = (v: string | undefined) => (v === undefined ? undefined : img(v));
  const withImage = <T extends { image?: string }>(item: T): T => {
    if (item.image === undefined) return item;
    return { ...item, image: img(item.image) };
  };
  const navLinks = (list: NavLink[]) => list.filter((link) => isSitePath(link.href));

  const withVariantData = new Set<string>();
  const collections: Collection[] = data.collections.map((c) => {
    const out: Collection = {
      ...c,
      products: c.products.map((p) => {
        const { variants, fromData } = productVariants(p);
        if (fromData) withVariantData.add(p.handle);
        // Purchasable when ANY variant is in stock.
        return { ...withImage(p), variants, inStock: variants.some((v) => v.inStock) };
      }),
    };
    const heroImage = optImg(c.heroImage);
    if (heroImage !== undefined) out.heroImage = heroImage;
    return out;
  });

  const groups: NavGroup[] = data.nav.brandImpressionsGroups.map((g) => ({ ...g, links: navLinks(g.links) }));

  const featured = { ...withImage(data.featuredProduct) };
  // Only when the product really has variants in the data: an API that does
  // not send variants yet keeps its own featuredProduct.variants.
  const featuredSource = withVariantData.has(featured.handle)
    ? collections.flatMap((c) => c.products).find((p) => p.handle === featured.handle)
    : undefined;
  if (featuredSource) {
    const variants = featuredSource.variants;
    const oneType = variants.every((v) => v.type === variants[0]?.type);
    featured.variants = variants.map((v) => {
      const out: SiteData["featuredProduct"]["variants"][number] = {
        size: oneType ? v.size : v.type ? `${v.type} ${v.size}` : v.size,
        price: v.price,
      };
      if (v.compareAtPrice !== undefined) out.compareAtPrice = v.compareAtPrice;
      return out;
    });
  }

  const rawOrder: unknown = (data.contact as { orderWhatsappNumber?: unknown }).orderWhatsappNumber;
  const orderWhatsappNumber =
    typeof rawOrder === "string" && rawOrder.replace(/\D/g, "").length >= 8 ? rawOrder : data.contact.whatsappNumber;

  return {
    ...data,
    collections,
    featuredProduct: featured,
    shopTheLookGroups: data.shopTheLookGroups.map((g) => ({
      ...g,
      image: img(g.image),
      items: g.items.map((i) => ({ ...i, image: img(i.image) })),
    })),
    beforeAfterImages: { him: img(data.beforeAfterImages.him), her: img(data.beforeAfterImages.her) },
    bottleImage: img(data.bottleImage),
    brand: { ...data.brand, journeyImage: img(data.brand.journeyImage, defaults.brand.journeyImage) },
    contact: {
      whatsappNumber: data.contact.whatsappNumber,
      orderWhatsappNumber,
      branches: data.contact.branches.map(({ mapUrl, ...branch }) =>
        mapUrl !== undefined && isHttps(mapUrl) ? { ...branch, mapUrl } : branch,
      ),
    },
    nav: {
      brandImpressionsGroups: groups,
      primaryNavStart: navLinks(data.nav.primaryNavStart),
      primaryNavEnd: navLinks(data.nav.primaryNavEnd),
    },
    content: sanitizeContent((data as { content?: unknown }).content, defaults.content, okImage, apiOrigin),
  };
}
