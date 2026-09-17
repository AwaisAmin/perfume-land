"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CollectionToolbar, { type SortOption } from "./CollectionToolbar";
import CollectionFilters from "./CollectionFilters";
import ProductGrid, { type GridLayout } from "./ProductGrid";
import Pagination from "./Pagination";
import type { Product } from "@/lib/types";

const genderLabels: Record<string, string> = {
  unisex: "Unisex",
  women: "Women",
  men: "Men",
};

// Matches the live site's own page size (confirmed from a 388-product
// collection paginating into exactly 9 pages: ceil(388 / 48) = 9).
const PAGE_SIZE = 48;

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
  const [page, setPage] = useState(1);

  // The toolbar is pinned to the very top of the viewport while scrolling
  // (matching the live site's own sticky toolbar), and the filters sidebar
  // pins itself just below it — so its real height is published as a CSS
  // var the same way Header.tsx publishes --header-height, instead of a
  // guessed fixed offset.
  const toolbarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const publishHeight = () => {
      document.documentElement.style.setProperty("--toolbar-height", `${el.offsetHeight}px`);
    };
    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));

  // Filters/sort changing the result set can leave `page` pointing past the
  // new last page — reset it during render (React's documented pattern for
  // adjusting state when an input changes) rather than in an effect, which
  // would cause an extra visible render of the stale, out-of-range page.
  const filterSignature = JSON.stringify([inStockOnly, priceRange, selectedGenders, sort]);
  const [lastFilterSignature, setLastFilterSignature] = useState(filterSignature);
  if (filterSignature !== lastFilterSignature) {
    setLastFilterSignature(filterSignature);
    setPage(1);
  }

  const pagedProducts = useMemo(
    () => visibleProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [visibleProducts, page],
  );

  return (
    // Bottom-only spacing (before Newsletter/ContactForm/TrustBadges below)
    // — no top padding, since the live site's toolbar sits flush against
    // the hero banner with zero gap between them.
    <div className="pb-10 lg:pb-16">
      {/* The toolbar is genuinely edge-to-edge on the live site — not just
          its border, but its content too (confirmed via direct
          measurement: the icon group and sort control provide their own
          30px/46px padding instead of sitting inside the page's usual
          48px container inset) — so it's deliberately NOT wrapped in
          container-app. It's also pinned to the very top of the viewport
          while scrolling, same as the live site: this is what makes the
          whole controls+filters area read as "staying at the top" while
          only the product grid scrolls. */}
      <div ref={toolbarRef} className="sticky top-0 z-30 border-b border-ink/10 bg-cream-50">
        <CollectionToolbar
          count={visibleProducts.length}
          layout={layout}
          onLayoutChange={setLayout}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      <div className="container-app">
        {/* Matches the live site's `.collection` grid exactly: a fixed
            240px sidebar column, 50px gap, sidebar wrapper stretched
            (default align-items) so the sticky child has room to move.
            The `.collection` element itself has no top margin/padding on
            the live site — the visible gap under the toolbar actually
            comes from its parent's own gap (a "v-stack gap-6 sm:gap-12"
            wrapper, confirmed via live measurement), reproduced here as a
            top margin instead since this component has no such wrapper. */}
        <div className="mt-6 grid gap-10 sm:mt-12 md:grid-cols-[240px_1fr] md:gap-12.5">
          <div>
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

          <div className="min-w-0">
            <ProductGrid products={pagedProducts} layout={layout} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
