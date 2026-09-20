import Link from "next/link";
import { Plus } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group">
      {/* No rounding/clipping here — the live site's product image box has
          sharp corners and doesn't clip its contents (confirmed via
          computed style: border-radius 0, overflow visible), which is why
          its quick-add button sits flush in the corner instead of looking
          inset. */}
      <Link
        href={`/products/${product.handle}`}
        className="relative flex aspect-3/4 items-center justify-center bg-cream-100"
      >
        <ProductImage
          product={product}
          bottleClassName="h-4/5 w-auto transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Opacity reacts to the whole card being hovered (outer `group`),
            but the rotation should only play when the button itself is
            hovered — a separate named group (`group/quickadd`) scoped to
            just this button keeps the two independent. */}
        <button
          type="button"
          aria-label="Quick add"
          className="group/quickadd absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center bg-cream-50 text-ink opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
        >
          <Plus
            size={12}
            className="transition-transform duration-200 ease-in-out group-hover/quickadd:rotate-90"
          />
        </button>
      </Link>

      <div className="mt-5 flex flex-col items-center gap-3 text-center">
        <Link
          href={`/products/${product.handle}`}
          className="font-heading text-xs uppercase tracking-[0.18em] hover:text-forest-700"
        >
          {product.title}
        </Link>
        <div className="font-heading flex items-baseline gap-2 text-xs uppercase tracking-[0.18em]">
          <span className="text-gold-600">
            {product.compareAtPrice ? "From " : ""}{formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-ink/40 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
