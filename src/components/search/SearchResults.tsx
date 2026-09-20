"use client";

import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/collection/ProductGrid";
import { searchProducts } from "@/lib/search";

function useQuery() {
  return useSearchParams().get("q")?.trim() ?? "";
}

/** The line under the page heading — a separate export (not a property on
 *  SearchResults) because a server component only ever sees a reference to a
 *  client component, never the function object something was attached to. */
export function SearchCount() {
  const query = useQuery();
  const count = searchProducts(query).length;

  return (
    <p className="mt-3 text-sm text-cream-100/70">
      {query
        ? `${count} ${count === 1 ? "result" : "results"} for \u201C${query}\u201D`
        : "Type a fragrance, collection or note in the search bar above."}
    </p>
  );
}

export default function SearchResults() {
  const query = useQuery();
  const products = searchProducts(query).map((result) => result.product);

  if (query && products.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-ink/60">
        No products match &ldquo;{query}&rdquo;. Try a different spelling, or browse the
        collections from the menu.
      </p>
    );
  }

  return <ProductGrid products={products} />;
}
