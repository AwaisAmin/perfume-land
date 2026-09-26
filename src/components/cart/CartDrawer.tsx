"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice, useSiteData } from "@/lib/site-data-context";
import { variantLabel, type Collection } from "@/lib/types";
import { buildOrderMessage, whatsappOrderUrl, type OrderCustomer } from "@/lib/whatsapp-order";
import CheckoutForm from "@/components/cart/CheckoutForm";

// Use current catalogue photography even for carts saved before an image update.
const productImageMaps = new WeakMap<Collection[], Map<string, string | undefined>>();
function productImagesFor(collections: Collection[]) {
  let map = productImageMaps.get(collections);
  if (!map) {
    map = new Map(
      collections.flatMap((collection) => collection.products.map((product) => [product.handle, product.image] as const)),
    );
    productImageMaps.set(collections, map);
  }
  return map;
}

// next/image refuses hosts it has not been configured for, so anything that
// is neither local nor from the CRM's own origin falls back to the bottle artwork.
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;
function isAllowedImage(src: string | undefined): src is string {
  if (!src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  return Boolean(API_ORIGIN) && src.startsWith(`${API_ORIGIN}/`);
}

function cartImage(item: { handle: string; image?: string }, collections: Collection[], bottleImage: string) {
  const known = productImagesFor(collections).get(item.handle);
  if (isAllowedImage(known)) return known;
  return isAllowedImage(item.image) ? item.image : bottleImage;
}

export default function CartDrawer() {
  const { items, isOpen, subtotal, closeCart: close, removeItem, updateQuantity, clearCart } = useCart();
  const { collections, bottleImage, freeShippingThreshold, orderWhatsappNumber, content } = useSiteData();
  const { cart: t, checkout } = content;
  const formatPrice = useFormatPrice();
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const [step, setStep] = useState<"cart" | "checkout" | "sent">("cart");

  const closeCart = () => {
    setStep("cart");
    close();
  };

  const sendOrder = (customer: OrderCustomer) => {
    const message = buildOrderMessage(items, customer, freeShippingThreshold, checkout, content.header.currencySymbol);
    window.open(whatsappOrderUrl(orderWhatsappNumber, message), "_blank", "noopener,noreferrer");
    setStep("sent");
  };

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
            aria-label={t.title}
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 className="text-lg font-normal uppercase tracking-[0.1em] text-ink">{t.title}</h2>
              <button type="button" aria-label="Close cart" onClick={closeCart} className="cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {items.length > 0 && step !== "sent" && (
              <p className="border-b border-ink/10 px-6 py-4 text-[13px] text-ink/60">
                {remaining > 0
                  ? t.freeShippingRemaining.replace("{amount}", formatPrice(remaining))
                  : t.freeShippingReached}
              </p>
            )}

            <div className="flex-1 overflow-y-auto px-6">
              {step === "sent" ? (
                <div role="status" className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <h3 className="text-base font-semibold text-ink">{checkout.sentHeading}</h3>
                  <p className="text-sm text-ink/60">{checkout.sentBody}</p>
                  <div className="mt-2 flex w-full flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        clearCart();
                        closeCart();
                      }}
                      className="w-full cursor-pointer bg-forest-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-cream-50 transition-colors hover:bg-forest-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900"
                    >
                      {checkout.clearCart}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("cart")}
                      className="cursor-pointer self-center py-2 text-xs text-ink/60 underline hover:text-ink"
                    >
                      {checkout.keepCart}
                    </button>
                  </div>
                </div>
              ) : step === "checkout" && items.length > 0 ? (
                <CheckoutForm texts={checkout} onBack={() => setStep("cart")} onSubmit={sendOrder} />
              ) : items.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-ink/60">{t.empty}</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.key} className="flex gap-4 border-b border-ink/10 py-5 last:border-b-0">
                    <Link
                      href={`/products/${item.handle}`}
                      onClick={closeCart}
                      className="relative h-30 w-24 shrink-0 bg-cream-100"
                    >
                      {item.image && (
                        <Image src={cartImage(item, collections, bottleImage)} alt={item.title} fill className="object-contain p-2" sizes="96px" />
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
                      <span className="text-sm text-ink/60">{formatPrice(item.price)}</span>
                      <span className="text-xs text-ink/40">{variantLabel({ type: item.variantType, size: item.variantSize })}</span>

                      <div className="mt-1 flex items-center gap-4">
                        <div className="inline-grid grid-cols-[1.75rem_auto_1.75rem] items-center border border-ink/15">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="grid h-7 cursor-pointer place-content-center"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className="grid h-7 cursor-pointer place-content-center"
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="cursor-pointer text-xs text-ink/60 underline hover:text-ink"
                        >
                          {t.remove}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && step === "cart" && (
              <div className="border-t border-ink/10 px-6 py-5">
                <p className="mb-4 text-sm text-ink/60">{t.taxesNote}</p>
                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className="flex w-full cursor-pointer items-center justify-between bg-forest-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-cream-50 transition-colors hover:bg-forest-950"
                >
                  <span>{t.checkout}</span>
                  <span>{formatPrice(subtotal)}</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
