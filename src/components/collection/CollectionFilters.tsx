"use client";

import { ChevronDown } from "lucide-react";

export type GenderCount = { value: string; label: string; count: number };

type CollectionFiltersProps = {
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
  priceBounds: [number, number];
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  genders: GenderCount[];
  selectedGenders: string[];
  onGenderToggle: (value: string) => void;
};

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group border-b border-ink/10 py-5 first:pt-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {title}
        <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

/**
 * The collection page's filter sidebar — a controlled component (all state
 * lives in the parent), so it stays purely presentational: swapping the
 * static product list for a real backend later only changes how the
 * parent computes these props, not this component.
 */
export default function CollectionFilters({
  inStockOnly,
  onInStockChange,
  priceBounds,
  priceRange,
  onPriceChange,
  genders,
  selectedGenders,
  onGenderToggle,
}: CollectionFiltersProps) {
  const [min, max] = priceBounds;

  return (
    <div
      className="md:sticky"
      style={{ top: "calc(var(--toolbar-height, 65px) + 1rem)" }}
    >
      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink/70">
          <span
            role="switch"
            aria-checked={inStockOnly}
            onClick={() => onInStockChange(!inStockOnly)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              inStockOnly ? "bg-forest-900" : "bg-ink/15"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-cream-50 transition-transform ${
                inStockOnly ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </span>
          In stock only
        </label>
      </FilterSection>

      <FilterSection title="Price">
        <div className="flex flex-col gap-4">
          <div className="relative h-1 rounded-full bg-ink/10">
            <div
              className="absolute h-1 rounded-full bg-forest-900"
              style={{
                left: `${((priceRange[0] - min) / (max - min)) * 100}%`,
                right: `${100 - ((priceRange[1] - min) / (max - min)) * 100}%`,
              }}
            />
            <input
              type="range"
              aria-label="Minimum price"
              min={min}
              max={max}
              value={priceRange[0]}
              onChange={(e) => {
                const value = Math.min(Number(e.target.value), priceRange[1]);
                onPriceChange([value, priceRange[1]]);
              }}
              className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
            />
            <input
              type="range"
              aria-label="Maximum price"
              min={min}
              max={max}
              value={priceRange[1]}
              onChange={(e) => {
                const value = Math.max(Number(e.target.value), priceRange[0]);
                onPriceChange([priceRange[0], value]);
              }}
              className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
            />
          </div>

          <div className="flex items-center gap-3 text-sm text-ink/70">
            <label className="flex items-center gap-1 rounded-sm border border-ink/15 px-3 py-2">
              <span className="text-ink/40">Dhs.</span>
              <input
                type="number"
                aria-label="From price"
                min={min}
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => onPriceChange([Number(e.target.value) || min, priceRange[1]])}
                className="w-12 bg-transparent outline-none"
              />
            </label>
            <span className="text-ink/40">to</span>
            <label className="flex items-center gap-1 rounded-sm border border-ink/15 px-3 py-2">
              <span className="text-ink/40">Dhs.</span>
              <input
                type="number"
                aria-label="To price"
                min={priceRange[0]}
                max={max}
                value={priceRange[1]}
                onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value) || max])}
                className="w-12 bg-transparent outline-none"
              />
            </label>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Gender">
        <div className="flex flex-col gap-2.5">
          {genders.map((g) => (
            <label
              key={g.value}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/70"
            >
              <input
                type="checkbox"
                checked={selectedGenders.includes(g.value)}
                onChange={() => onGenderToggle(g.value)}
                className="h-4 w-4 cursor-pointer accent-forest-900"
              />
              {g.label} ({g.count})
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
