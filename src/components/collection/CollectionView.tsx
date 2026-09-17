"use client";

import { useMemo, useState } from "react";
import CollectionToolbar, { type SortOption } from "./CollectionToolbar";
import CollectionFilters from "./CollectionFilters";
import ProductGrid, { type GridLayout } from "./ProductGrid";
import type { Product } from "@/lib/types";

const genderLabels: Record<string, string> = {
  unisex: "Unisex",
  women: "Women",
  men: "Men",
};

/**
 * Owns all interactive collection-page state (filters, sort, layout) and
 * derives the visible product list from it. Takes a plain `products` array
 * as its only data input — a future server-backed version can pass down
 * products fetched from an API instead of the static list, and this
 * component (and everything it renders) needs no other change.
 */
export default function CollectionView({ products }: { products: Product[] }) {
  const priceBounds: [number, number] = useMemo(() => {
    const prices = products.map((p) => p.price);
    return [Math.min(...prices, 0), Math.max(...prices, 0)];
  }, [products]);

  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>(priceBounds);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [layout, setLayout] = useState<GridLayout>("medium");
  const [sort, setSort] = useState<SortOption>("featured");

  const genderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = p.gender ?? "unisex";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].map(([value, count]) => ({
      value,
      label: genderLabels[value] ?? value,
      count,
    }));
  }, [products]);

  const visibleProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (inStockOnly && p.inStock === false) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (selectedGenders.length > 0 && !selectedGenders.includes(p.gender ?? "unisex")) {
        return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return list;
  }, [products, inStockOnly, priceRange, selectedGenders, sort]);

  return (
    <div className="container-app text-fluid-section-gap-tight">
      <CollectionToolbar
        count={visibleProducts.length}
        layout={layout}
        onLayoutChange={setLayout}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Deliberately no items-start here: the sidebar wrapper needs to
          stay stretched (the default) to the row's full height so its
          sticky child has room to move within it — with items-start the
          wrapper shrinks to the sidebar's own short content height and
          position:sticky has nowhere to "stick" (confirmed by isolating
          this exact class against a live scroll test). */}
      <div className="mt-8 flex flex-col gap-10 md:flex-row">
        <div className="md:w-55 md:shrink-0 lg:w-65">
          <CollectionFilters
            inStockOnly={inStockOnly}
            onInStockChange={setInStockOnly}
            priceBounds={priceBounds}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            genders={genderCounts}
            selectedGenders={selectedGenders}
            onGenderToggle={(value) =>
              setSelectedGenders((current) =>
                current.includes(value) ? current.filter((g) => g !== value) : [...current, value],
              )
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <ProductGrid products={visibleProducts} layout={layout} />
        </div>
      </div>
    </div>
  );
}
