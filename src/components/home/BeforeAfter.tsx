"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import PerfumeBottle from "@/components/ui/PerfumeBottle";
import Reveal from "@/components/ui/Reveal";

export default function BeforeAfter() {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  };

  return (
    <section className="text-fluid-section-gap bg-cream-200">
      <div className="container-app max-w-5xl">
        <Reveal
          ref={containerRef}
          className="relative aspect-video select-none overflow-hidden rounded-md"
          onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
            dragging.current = true;
            updateFromClientX(e.clientX);
          }}
          onPointerMove={(e: React.PointerEvent<HTMLDivElement>) => {
            if (dragging.current) updateFromClientX(e.clientX);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerLeave={() => {
            dragging.current = false;
          }}
        >
          {/* For Her (base layer) */}
          <div className="absolute inset-0 flex items-center justify-center bg-gold-500 text-forest-950">
            <PerfumeBottle className="h-2/3 w-auto opacity-70" />
            <div className="absolute bottom-6 left-6 flex flex-col items-start gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">For Her</p>
              <Button href="/products/for-her" variant="light">
                Buy Now
              </Button>
            </div>
          </div>

          {/* For Him (clipped overlay) */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden bg-forest-900 text-gold-400"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <PerfumeBottle className="h-2/3 w-auto opacity-70" />
            <div className="absolute bottom-6 left-6 flex flex-col items-start gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">For Him</p>
              <Button href="/products/for-him">Buy Now</Button>
            </div>
          </div>

          {/* Divider handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cream-50"
            style={{ left: `${position}%` }}
          >
            <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50 text-forest-900 shadow-md">
              <ChevronLeft size={14} />
              <ChevronRight size={14} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
