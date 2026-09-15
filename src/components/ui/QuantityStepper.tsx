"use client";

import { Minus, Plus } from "lucide-react";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

export default function QuantityStepper({ value, onChange, min = 1 }: QuantityStepperProps) {
  return (
    <div className="inline-grid grid-cols-[2.7rem_auto_2.7rem] items-center border border-ink/15">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid h-11 cursor-pointer place-content-center disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus size={12} />
      </button>
      <span className="min-w-10 text-center text-sm">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="grid h-11 cursor-pointer place-content-center"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
