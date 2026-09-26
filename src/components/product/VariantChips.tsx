"use client";

import { useRef, type KeyboardEvent } from "react";

export type ChipOption = { value: string; label: string; disabled: boolean };

type VariantChipsProps = {
  label: string;
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
};

/**
 * A single-choice chip row with radiogroup semantics: one tab stop, arrow
 * keys move (and select) between enabled chips, Home/End jump to the ends.
 * Styled like the size picker in "Product of the Week".
 */
export default function VariantChips({ label, options, value, onChange }: VariantChipsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
  const current = options.findIndex((o) => o.value === value);
  // The tab stop is the selected chip, or the first enabled one.
  const tabIndexOf = (i: number) => (i === (current >= 0 && !options[current]?.disabled ? current : enabled[0]) ? 0 : -1);

  const move = (e: KeyboardEvent, from: number) => {
    const pos = enabled.indexOf(from);
    let next: number | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = enabled[(pos + 1) % enabled.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    if (next === undefined) return;
    e.preventDefault();
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <span className="text-sm" aria-hidden="true">
        {label}
      </span>
      <div role="radiogroup" aria-label={label.replace(/:$/, "")} className="flex flex-wrap gap-2.5">
        {options.map((option, i) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={option.disabled}
              tabIndex={tabIndexOf(i)}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => move(e, i)}
              className={`min-w-10 rounded-sm border px-3.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 ${
                option.disabled
                  ? "cursor-not-allowed border-ink/10 text-ink/25 line-through"
                  : selected
                    ? "cursor-pointer border-ink text-ink"
                    : "cursor-pointer border-ink/15 text-ink/40 hover:border-ink/40"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
