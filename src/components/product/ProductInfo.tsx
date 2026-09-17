"use client";

import { useState } from "react";
import QuantityStepper from "@/components/ui/QuantityStepper";
import type { Product } from "@/lib/types";

// The live site caps the stock bar's fill at this count — a product with
// more in stock than this still shows a full (not overflowing) bar, it
// just reads "in stock" without implying real urgency.
const STOCK_BAR_MAX = 50;

/**
 * The product detail page's right-hand panel — stock indicator, title,
 * price, description, size, quantity, and add-to-cart. A controlled leaf
 * component (all state is local, no cart wiring) so swapping in a real
 * cart/checkout later only touches the `onClick` on the button.
 */
export default function ProductInfo({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col items-start gap-5">
      {product.inStock !== false && product.stockCount !== undefined && (
        <div className="flex w-full flex-col gap-1.5">
          <span className="text-sm italic text-[rgb(48,122,7)]">{product.stockCount} in stock</span>
          <div className="h-0.5 w-full bg-ink/10">
            <div
              className="h-full bg-[rgb(48,122,7)]"
              style={{ width: `${Math.min(1, product.stockCount / STOCK_BAR_MAX) * 100}%` }}
            />
          </div>
        </div>
      )}

      <h1 className="text-2xl font-normal text-ink uppercase">{product.title}</h1>

      <div className="flex items-baseline gap-3">
        <span className="text-lg text-gold-600">Dhs. {product.price.toFixed(2)}</span>
        {product.compareAtPrice && (
          <span className="text-ink/40 line-through">Dhs. {product.compareAtPrice.toFixed(2)}</span>
        )}
      </div>

      <hr className="w-full border-ink/10" />

      {product.description && <p className="text-ink/70">{product.description}</p>}

      {product.size && (
        <div className="flex flex-col items-start gap-2">
          <span className="text-sm">Size:</span>
          <div className="min-w-10 border border-ink px-3.5 py-2 text-sm text-ink">{product.size}</div>
        </div>
      )}

      <QuantityStepper value={quantity} onChange={setQuantity} />

      <button
        type="button"
        className="w-full cursor-pointer border border-ink/10 bg-transparent py-3.5 text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink/5"
      >
        Add to cart
      </button>
    </div>
  );
}
