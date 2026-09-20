"use client";

import Image from "next/image";
import { bottleImage, collections } from "@/data/products";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";

// Matches the announcement bar's own "Free Delivery Over AED 500" — the
// live cart drawer's free-shipping message uses the same real threshold.
const FREE_SHIPPING_THRESHOLD = 500;

// Use current catalogue photography even for carts saved before an image update.
const productImages = new Map(
  collections.flatMap((collection) => collection.products.map((product) => [product.handle, product.image] as const)),
);

export default function CartDrawer() {
  const { items, isOpen, subtotal, closeCart, removeItem, updateQuantity } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/60"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream-50"
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 className="text-lg font-normal uppercase tracking-[0.1em] text-ink">Cart</h2>
              <button type="button" aria-label="Close cart" onClick={closeCart} className="cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {items.length > 0 && (
              <p className="border-b border-ink/10 px-6 py-4 text-[13px] text-ink/60">
                {remaining > 0
                  ? `Spend AED ${remaining.toFixed(2)} more and get free shipping!`
                  : "You are eligible for free shipping."}
              </p>
            )}

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-ink/60">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.handle} className="flex gap-4 border-b border-ink/10 py-5 last:border-b-0">
                    <Link
                      href={`/products/${item.handle}`}
                      onClick={closeCart}
                      className="relative h-30 w-24 shrink-0 bg-cream-100"
                    >
                      {item.image && (
                        <Image src={productImages.get(item.handle) ?? (item.image?.startsWith("https://amanzadaperfumes.com/") ? bottleImage : item.image)} alt={item.title} fill className="object-contain p-2" sizes="96px" />
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col items-start gap-2">
                      <Link
                        href={`/products/${item.handle}`}
                        onClick={closeCart}
                        className="text-sm text-ink hover:text-forest-700"
                      >
                        {item.title}
                      </Link>
                      <span className="text-sm text-ink/60">Dhs. {item.price.toFixed(2)}</span>
                      {item.size && <span className="text-xs uppercase text-ink/40">{item.size}</span>}

                      <div className="mt-1 flex items-center gap-4">
                        <div className="inline-grid grid-cols-[1.75rem_auto_1.75rem] items-center border border-ink/15">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.handle, item.quantity - 1)}
                            className="grid h-7 cursor-pointer place-content-center"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.handle, item.quantity + 1)}
                            className="grid h-7 cursor-pointer place-content-center"
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.handle)}
                          className="cursor-pointer text-xs text-ink/60 underline hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-ink/10 px-6 py-5">
                <p className="mb-4 text-sm text-ink/60">Taxes and shipping calculated at checkout</p>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between bg-forest-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-cream-50 transition-colors hover:bg-forest-950"
                >
                  <span>Checkout</span>
                  <span>Dhs. {subtotal.toFixed(2)}</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
