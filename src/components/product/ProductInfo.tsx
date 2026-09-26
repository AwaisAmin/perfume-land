"use client";

import { Fragment, useState } from "react";
import QuantityStepper from "@/components/ui/QuantityStepper";
import VariantChips from "@/components/product/VariantChips";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice } from "@/lib/site-data-context";
import { VARIANT_SIZES, VARIANT_TYPES, type Product, type SiteContent, type Variant } from "@/lib/types";

// The live site caps the stock bar's fill at this count — a product with
// more in stock than this still shows a full (not overflowing) bar, it
// just reads "in stock" without implying real urgency.
const STOCK_BAR_MAX = 50;

type ProductInfoProps = { product: Product; texts: SiteContent["product"] };

/** The first in-stock variant of `size` (else its first variant). */
function defaultForSize(variants: Variant[], size: Variant["size"]): Variant | undefined {
  const ofSize = variants.filter((v) => v.size === size);
  return ofSize.find((v) => v.inStock) ?? ofSize[0];
}

/**
 * The product detail page's right-hand panel — stock indicator, title,
 * price, description, variant picker (size, then type — 35ml has no type),
 * quantity, and add-to-cart. Price/compare/stock follow the selection.
 */
export default function ProductInfo({ product, texts }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const formatPrice = useFormatPrice();
  const variants = product.variants;
  const [selectedId, setSelectedId] = useState(() => (variants.find((v) => v.inStock) ?? variants[0])?.id);
  const variant = variants.find((v) => v.id === selectedId) ?? variants[0];

  const sizes = VARIANT_SIZES.filter((s) => variants.some((v) => v.size === s));
  const types = variant && variant.size !== "35ml"
    ? VARIANT_TYPES.filter((t) => variants.some((v) => v.size === variant.size && v.type === t))
    : [];

  const price = variant?.price ?? product.price;
  const rawCompare = variant ? variant.compareAtPrice : product.compareAtPrice;
  const compareAtPrice = rawCompare !== undefined && rawCompare > price ? rawCompare : undefined;
  // Variants decide stock: the product is purchasable if the chosen variant is.
  const available = variant ? variant.inStock : product.inStock !== false;

  const selectSize = (size: string) => {
    const next = defaultForSize(variants, size as Variant["size"]);
    if (next) setSelectedId(next.id);
  };
  const selectType = (type: string) => {
    const next = variants.find((v) => v.size === variant?.size && v.type === type);
    if (next) setSelectedId(next.id);
  };

  return (
    <div className="flex flex-col items-start gap-5">
      {available && product.stockCount !== undefined && (
        <div className="flex w-full flex-col gap-1.5">
          <span className="text-sm italic text-[rgb(48,122,7)]">
            {texts.inStockTemplate.split("{count}").map((part, i) => (
              <Fragment key={i}>
                {i > 0 && product.stockCount}
                {part}
              </Fragment>
            ))}
          </span>
          <div className="h-0.5 w-full bg-ink/10">
            <div
              className="h-full bg-[rgb(48,122,7)]"
              style={{ width: `${Math.min(1, product.stockCount / STOCK_BAR_MAX) * 100}%` }}
            />
          </div>
        </div>
      )}

      <h1 className="text-[22px] leading-[1.5] font-normal tracking-[3.96px] text-ink uppercase">
        {product.title}
      </h1>

      <div className="flex items-baseline gap-3" aria-live="polite">
        <span className="text-lg text-gold-600">{formatPrice(price)}</span>
        {compareAtPrice !== undefined && (
          <span className="text-sm text-ink/40 line-through">{formatPrice(compareAtPrice)}</span>
        )}
      </div>

      <hr className="w-full border-ink/10" />

      {product.description && <p className="text-ink/70">{product.description}</p>}

      {variant && (
        <>
          <VariantChips
            label={texts.sizeLabel}
            value={variant.size}
            onChange={selectSize}
            options={sizes.map((size) => ({
              value: size,
              label: size,
              disabled: !variants.some((v) => v.size === size && v.inStock),
            }))}
          />
          {types.length > 0 && (
            <VariantChips
              label={texts.typeLabel}
              value={variant.type ?? ""}
              onChange={selectType}
              options={types.map((type) => ({
                value: type,
                label: type,
                disabled: !variants.some((v) => v.size === variant.size && v.type === type && v.inStock),
              }))}
            />
          )}
        </>
      )}

      <QuantityStepper value={quantity} onChange={setQuantity} />

      <button
        type="button"
        disabled={!available || !variant}
        onClick={() => variant && addItem(product, variant, quantity)}
        className="w-full cursor-pointer border border-ink/10 bg-transparent py-3.5 text-[13px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-forest-900 hover:bg-forest-900 hover:text-cream-50 disabled:cursor-not-allowed disabled:text-ink/40 disabled:hover:border-ink/10 disabled:hover:bg-transparent disabled:hover:text-ink/40"
      >
        {available ? texts.addToCart : texts.soldOut}
      </button>
    </div>
  );
}
