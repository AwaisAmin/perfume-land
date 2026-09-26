import type { Collection, Product, Variant } from "@/lib/types";

/** One cart line: a specific variant of a product. */
export type SafeCartItem = {
  /** `${handle}::${variantId}` — unique per line. */
  key: string;
  handle: string;
  variantId: string;
  variantType: Variant["type"];
  variantSize: Variant["size"];
  title: string;
  price: number;
  image?: string;
  quantity: number;
};

export const cartKey = (handle: string, variantId: string) => `${handle}::${variantId}`;

const catalogs = new WeakMap<Collection[], Map<string, Product>>();
function catalogFor(collections: Collection[]) {
  let catalog = catalogs.get(collections);
  if (!catalog) {
    catalog = new Map(collections.flatMap(c => c.products.map(p => [p.handle, p] as const)));
    catalogs.set(collections, catalog);
  }
  return catalog;
}

export function safeQuantity(quantity: number) {
  return Number.isFinite(quantity) ? Math.min(99, Math.max(0, Math.floor(quantity))) : 0;
}

/** A cart line built only from catalog data (never from untrusted input). */
export function cartLine(product: Product, variant: Variant, quantity: number): SafeCartItem {
  return {
    key: cartKey(product.handle, variant.id),
    handle: product.handle,
    variantId: variant.id,
    variantType: variant.type,
    variantSize: variant.size,
    title: product.title,
    price: variant.price,
    image: product.image,
    quantity,
  };
}

/**
 * Browser storage is untrusted: restore only known products AND variants,
 * using catalog prices. Carts saved before variants existed (no variantId)
 * map to the product's first (default) variant.
 */
export function restoreCart(value: unknown, collections: Collection[]): SafeCartItem[] {
  if (!Array.isArray(value)) return [];
  const catalog = catalogFor(collections);
  const items = new Map<string, SafeCartItem>();
  for (const entry of value.slice(0, 200)) {
    if (!entry || typeof entry !== "object" || typeof entry.handle !== "string" || typeof entry.quantity !== "number") continue;
    const product = catalog.get(entry.handle);
    const quantity = safeQuantity(entry.quantity);
    if (!product || product.inStock === false || !quantity) continue;
    const variantId: unknown = entry.variantId;
    if (variantId !== undefined && typeof variantId !== "string") continue;
    const variant = variantId === undefined ? product.variants[0] : product.variants.find(v => v.id === variantId);
    if (!variant || !variant.inStock) continue;
    const line = cartLine(product, variant, quantity);
    items.set(line.key, { ...line, quantity: safeQuantity(quantity + (items.get(line.key)?.quantity ?? 0)) });
  }
  return [...items.values()];
}
