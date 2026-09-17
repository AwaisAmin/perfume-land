import ProductCard from "@/components/home/ProductCard";
import type { Product } from "@/lib/types";

export type GridLayout = "large" | "medium" | "compact";

// Column counts and gaps measured directly off the live site at each
// breakpoint (700px / 1000px are its own breakpoints, not Tailwind's
// defaults) — all three layouts share the same responsive gap scale, only
// the column count changes between them.
const layoutClasses: Record<GridLayout, string> = {
  large: "grid-cols-1 min-[700px]:grid-cols-2 min-[1000px]:grid-cols-3",
  medium: "grid-cols-2 min-[700px]:grid-cols-3 min-[1000px]:grid-cols-4",
  compact: "grid-cols-2 min-[700px]:grid-cols-4 min-[1000px]:grid-cols-6",
};

type ProductGridProps = {
  products: Product[];
  layout?: GridLayout;
};

/**
 * The product grid itself — a standalone, page-agnostic component that
 * just takes a product list and a layout mode. Any collection page (or a
 * future search/wishlist page) can reuse it with a different product
 * array; it has no knowledge of where its data came from, so swapping the
 * static list for a real API call later is a change to the caller only.
 */
export default function ProductGrid({ products, layout = "medium" }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-ink/60">
        No products match the selected filters.
      </p>
    );
  }

  return (
    <div
      className={`grid gap-x-2.5 gap-y-9 min-[700px]:gap-x-6 min-[700px]:gap-y-12 min-[1000px]:gap-x-15 min-[1000px]:gap-y-16 ${layoutClasses[layout]}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
