import ProductCard from "@/components/home/ProductCard";
import type { Product } from "@/lib/types";

export type GridLayout = "large" | "medium" | "compact";

const layoutClasses: Record<GridLayout, string> = {
  large: "grid-cols-1 sm:grid-cols-2",
  medium: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
  compact: "grid-cols-1",
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

  if (layout === "compact") {
    return (
      <div className="flex flex-col divide-y divide-ink/10">
        {products.map((product) => (
          <div key={product.id} className="py-4 first:pt-0 last:pb-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8 ${layoutClasses[layout]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
