import { collections } from "@/data/products";
import type { Product } from "@/lib/types";

export type SafeCartItem = Pick<Product, "handle" | "title" | "price" | "image" | "size"> & { quantity: number };
const catalog = new Map(collections.flatMap(c => c.products.map(p => [p.handle, p] as const)));
export function safeQuantity(quantity: number) {
  return Number.isFinite(quantity) ? Math.min(99, Math.max(0, Math.floor(quantity))) : 0;
}

/** Browser storage is untrusted: restore only known products, using catalog prices. */
export function restoreCart(value: unknown): SafeCartItem[] {
  if (!Array.isArray(value)) return [];
  const items = new Map<string, SafeCartItem>();
  for (const entry of value.slice(0, 200)) {
    if (!entry || typeof entry !== "object" || typeof entry.handle !== "string" || typeof entry.quantity !== "number") continue;
    const product = catalog.get(entry.handle);
    const quantity = safeQuantity(entry.quantity);
    if (!product || product.inStock === false || !quantity) continue;
    const { handle, title, price, image, size } = product;
    items.set(handle, { handle, title, price, image, size, quantity: safeQuantity(quantity + (items.get(handle)?.quantity ?? 0)) });
  }
  return [...items.values()];
}
