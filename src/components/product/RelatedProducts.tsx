import ProductCard from "@/components/home/ProductCard";
import type { Product } from "@/lib/types";

/**
 * The "Related products" strip at the bottom of a product detail page —
 * takes a plain product list so the caller decides what counts as
 * "related" (here: other products from the same collection); swapping in
 * a real recommendation API later only changes how the parent computes
 * that list, not this component.
 */
export default function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="text-fluid-section-gap border-t border-ink/10">
      <div className="container-app">
        <h2 className="text-fluid-h2 text-center font-normal text-forest-900">Related Products</h2>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
