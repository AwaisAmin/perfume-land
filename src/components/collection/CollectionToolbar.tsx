"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Grid2x2, LayoutGrid, List } from "lucide-react";
import type { GridLayout } from "./ProductGrid";

export type SortOption = "featured" | "title-asc" | "title-desc" | "price-asc" | "price-desc";

const sortLabels: Record<SortOption, string> = {
  featured: "Featured",
  "title-asc": "Alphabetically, A-Z",
  "title-desc": "Alphabetically, Z-A",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
};

type CollectionToolbarProps = {
  count: number;
  layout: GridLayout;
  onLayoutChange: (layout: GridLayout) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
};

export default function CollectionToolbar({
  count,
  layout,
  onLayoutChange,
  sort,
  onSortChange,
}: CollectionToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-1">
        {(
          [
            { value: "large", icon: Grid2x2, label: "Switch to larger product images" },
            { value: "medium", icon: LayoutGrid, label: "Switch to smaller product images" },
            { value: "compact", icon: List, label: "Switch to compact product images" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={layout === option.value}
            onClick={() => onLayoutChange(option.value)}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm transition-colors ${
              layout === option.value ? "text-ink" : "text-ink/35 hover:text-ink/70"
            }`}
          >
            <option.icon size={18} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
        {count} {count === 1 ? "product" : "products"}
      </p>

      <div className="relative">
        <button
          type="button"
          onClick={() => setSortOpen((open) => !open)}
          aria-expanded={sortOpen}
          className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink"
        >
          Sort by
          <ChevronDown size={12} className={sortOpen ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>

        <AnimatePresence>
          {sortOpen && (
            <>
              <button
                aria-hidden="true"
                tabIndex={-1}
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setSortOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full right-0 z-20 mt-2 w-56 rounded-md border border-ink/10 bg-cream-50 p-2 shadow-lg"
              >
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onSortChange(option);
                      setSortOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center rounded px-3 py-2 text-left text-sm transition-colors hover:bg-ink/5 ${
                      sort === option ? "text-ink font-semibold" : "text-ink/70"
                    }`}
                  >
                    {sortLabels[option]}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
