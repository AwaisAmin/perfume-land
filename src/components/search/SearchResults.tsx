"use client";

import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/collection/ProductGrid";
import { searchProducts } from "@/lib/search";
import { useSiteData } from "@/lib/site-data-context";

function useQuery() {
  return useSearchParams().get("q")?.trim() ?? "";
}

/** The line under the page heading — a separate export (not a property on
 *  SearchResults) because a server component only ever sees a reference to a
 *  client component, never the function object something was attached to. */
export function SearchCount() {
  const query = useQuery();
  const { collections, content } = useSiteData();
  const t = content.search;
  const count = searchProducts(collections, query).length;

  return (
    <p className="mt-3 text-sm text-cream-100/70">
      {query
        ? t.countTemplate
            .replace("{count}", String(count))
            .replace("{results}", count === 1 ? t.resultSingular : t.resultPlural)
            .replace("{query}", query)
        : t.emptyPrompt}
    </p>
  );
}

export default function SearchResults() {
  const query = useQuery();
  const { collections, content } = useSiteData();
  const products = searchProducts(collections, query).map((result) => result.product);

  if (query && products.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-ink/60">
        {content.search.noResults.replace("{query}", query)}
      </p>
    );
  }

  return <ProductGrid products={products} />;
}
