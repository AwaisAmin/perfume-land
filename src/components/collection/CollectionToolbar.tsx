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
    // No items-center / no vertical padding on the row itself — matches
    // the live site exactly: each section below stretches to the row's
    // full height (via flex's default stretch) and centers its own
    // content internally, so a section's border-x spans truly edge to
    // edge (top to bottom) instead of just the height of its content.
    <div className="flex flex-wrap justify-between gap-4">
      {/* Matches the live site's icon group exactly: 30px of padding on
          both sides, with a 1px right border separating it from the
          product count and sort controls. */}
      <div className="flex items-center gap-3 border-r border-ink/10 px-7.5">
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
            className={`flex cursor-pointer items-center justify-center rounded-sm py-4.5 transition-colors ${
              layout === option.value ? "text-ink" : "text-ink/35 hover:text-ink/70"
            }`}
          >
            <option.icon size={20} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      <p className="flex items-center text-xs font-normal uppercase tracking-[2.16px] text-ink/65">
        {count} {count === 1 ? "product" : "products"}
      </p>

      {/* Matches the live site's sort control exactly: a 1px left border
          with 46px of horizontal / 18px of vertical padding, 11px text at
          normal weight (the rest of the toolbar's controls are heavier
          and slightly larger — this one is genuinely smaller). */}
      <div className="relative flex items-center border-l border-ink/10 px-11.5 py-4.5">
        <button
          type="button"
          onClick={() => setSortOpen((open) => !open)}
          aria-expanded={sortOpen}
          className="flex cursor-pointer items-center gap-2.5 text-[11px] font-normal uppercase tracking-[1.98px] text-ink"
        >
          Sort by
          <ChevronDown size={10} className={sortOpen ? "rotate-180 transition-transform" : "transition-transform"} />
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
                className="absolute top-full right-0 z-20 grid w-48 gap-3 bg-forest-900 p-6"
              >
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onSortChange(option);
                      setSortOpen(false);
                    }}
                    className={`cursor-pointer text-left text-sm transition-colors hover:text-cream-50 ${
                      sort === option ? "text-cream-50" : "text-cream-50/65"
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
