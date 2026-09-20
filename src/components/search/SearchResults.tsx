"use client";

import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import ProductGrid from "@/components/collection/ProductGrid";
import { searchProducts } from "@/lib/search";

export default function SearchResults() {
  const query = useSearchParams().get("q")?.trim() ?? "";
  const results = searchProducts(query);
  const products = results.map((result) => result.product);

  return (
    <>
      <PageHeader>
        <h1 className="text-fluid-h2 font-light uppercase tracking-widest text-cream-50">Search</h1>
        {query ? (
          <p className="mt-3 text-sm text-cream-100/70">
            {products.length} {products.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <p className="mt-3 text-sm text-cream-100/70">
            Type a fragrance, collection or note in the search bar above.
          </p>
        )}
      </PageHeader>

      <section className="container-app py-16">
        {query && products.length === 0 ? (
          <p className="py-20 text-center text-sm text-ink/60">
            No products match &ldquo;{query}&rdquo;. Try a different spelling, or browse the
            collections from the menu.
          </p>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </>
  );
}
