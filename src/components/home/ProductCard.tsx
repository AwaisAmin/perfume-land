import Link from "next/link";
import { Plus } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group">
      <Link
        href={`/products/${product.handle}`}
        className="relative flex aspect-3/4 items-center justify-center overflow-hidden rounded-md bg-cream-100"
      >
        <ProductImage
          product={product}
          bottleClassName="h-4/5 w-auto transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <button
          type="button"
          aria-label="Quick add"
          className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center bg-cream-50 text-ink opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100"
        >
          <Plus size={16} />
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
            {product.compareAtPrice ? "From " : ""}Dhs. {product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && (
            <span className="text-ink/40 line-through">
              Dhs. {product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
