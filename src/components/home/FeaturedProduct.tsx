"use client";

import { useState } from "react";
import ProductImage from "@/components/ui/ProductImage";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Reveal from "@/components/ui/Reveal";
import type { FeaturedProductData, Product, SiteContent } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice } from "@/lib/site-data-context";

type FeaturedProductProps = {
  product: FeaturedProductData;
  texts: SiteContent["home"]["featuredProduct"];
  /** The catalog product this section shows (for adding to the cart). */
  source: Product | undefined;
  /** Catalog variant id for each entry of product.variants (null = not purchasable). */
  variantIds: (string | null)[];
};

export default function FeaturedProduct({ product, texts, source, variantIds }: FeaturedProductProps) {
  const { addItem } = useCart();
  const formatPrice = useFormatPrice();
  const catalogVariantAt = (i: number) => source?.variants.find((v) => v.id === variantIds[i]);
  // Only a catalog variant that exists and is out of stock is disabled; an
  // option the catalog does not have (yet) stays selectable, Add to Cart is off.
  const isSoldOut = (i: number) => catalogVariantAt(i)?.inStock === false;
  const [variantIndex, setVariantIndex] = useState(() => {
    const first = product.variants.findIndex((_, i) => source?.variants.find((v) => v.id === variantIds[i])?.inStock !== false);
    return first >= 0 ? first : 0;
  });
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants[variantIndex];
  const catalogVariant = catalogVariantAt(variantIndex);
  const compareAtPrice =
    variant?.compareAtPrice !== undefined && variant.compareAtPrice > variant.price ? variant.compareAtPrice : undefined;
  const canAdd = Boolean(source && catalogVariant?.inStock && source.inStock !== false);

  return (
    <section className="text-fluid-section-gap border-y border-ink/10 bg-cream-50">
      {/* This section is centered and capped to the reference site's
          container--lg (1260px content + the container's own 48px gutter
          on each side, so 1356px border-box) — unlike the full-bleed
          sections elsewhere on the page — so it reads narrower with more
          side breathing room. Verified against the live site's computed
          margins at several viewport widths (90px @1440, 330px @1920). */}
      <div className="container-app mx-auto max-w-339">
        <Reveal className="text-center">
          <p className="text-xs font-normal uppercase tracking-[0.18em] text-forest-900">
            {texts.kicker}
          </p>
          <h2 className="text-fluid-h2 mt-2 font-normal text-forest-900">{texts.heading}</h2>
        </Reveal>

        {/* image:content is a 0.55/0.45 split with the content column
            sticking under the top of the viewport while the (taller)
            image scrolls past it — matches the reference site's
            `safe-sticky` product-info panel exactly. */}
        <div className="mt-18 grid items-start gap-10 md:grid-cols-[0.55fr_0.45fr] md:gap-16">
          {/* No matting/padding around the photo here — unlike the grid
              cards, the reference site's product-of-the-week shot fills
              its frame edge to edge. */}
          <Reveal className="relative aspect-4/5 overflow-hidden rounded-md">
            <ProductImage
              product={product}
              bottleClassName="h-2/3 w-auto"
              imageClassName="object-contain p-6 sm:p-10"
              priority
            />
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col items-start gap-5 md:sticky md:top-5">
            <h3 className="text-fluid-h2 font-normal text-forest-900">{product.title}</h3>

            <div className="flex items-baseline gap-3 text-lg">
              <span className="font-bold text-gold-600">{formatPrice(variant.price)}</span>
              {compareAtPrice !== undefined && (
                <span className="text-ink/40 line-through">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>

            <hr className="w-full border-ink/10" />

            <p className="max-w-md text-ink/70">{product.description}</p>

            <div className="flex flex-col items-start gap-2">
              <span className="text-sm">{texts.sizeLabel}</span>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v, i) => (
                  <button
                    key={v.size}
                    type="button"
                    onClick={() => setVariantIndex(i)}
                    aria-pressed={i === variantIndex}
                    disabled={isSoldOut(i)}
                    className={`min-w-10 rounded-sm border px-3.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 ${
                      isSoldOut(i)
                        ? "cursor-not-allowed border-ink/10 text-ink/25 line-through"
                        : i === variantIndex
                          ? "cursor-pointer border-ink text-ink"
                          : "cursor-pointer border-ink/15 text-ink/40 hover:border-ink/40"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>

            <QuantityStepper value={quantity} onChange={setQuantity} />

            <button
              type="button"
              disabled={!canAdd}
              onClick={() => {
                if (source && catalogVariant) addItem(source, catalogVariant, quantity);
              }}
              className="w-full cursor-pointer rounded-sm bg-forest-900 disabled:cursor-not-allowed disabled:opacity-50 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-cream-50 transition-colors hover:bg-forest-950"
            >
              {texts.addToCart}
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
