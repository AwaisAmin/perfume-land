"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import PerfumeBottle from "@/components/ui/PerfumeBottle";
import { accentStyles } from "@/lib/accent";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const accent = accentStyles[product.accent];

  return (
    <div className="group w-[74vw] shrink-0 snap-start sm:w-[38vw] md:w-auto">
      <Link
        href={`/products/${product.handle}`}
        className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-md ${accent.bg}`}
      >
        <PerfumeBottle
          className={`h-2/3 w-auto transition-transform duration-500 ease-out group-hover:scale-105 ${accent.fg}`}
        />
        <button
          type="button"
          aria-label="Quick add"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream-50 text-forest-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <Plus size={14} />
        </button>
      </Link>

      <div className="mt-3 flex flex-col items-center gap-1 text-center">
        <Link
          href={`/products/${product.handle}`}
          className="text-sm font-semibold tracking-wide hover:text-forest-700"
        >
          {product.title}
        </Link>
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-semibold">
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
