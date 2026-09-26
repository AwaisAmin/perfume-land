"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import type { SiteContent } from "@/lib/types";

type BeforeAfterProps = { images: { him: string; her: string }; texts: SiteContent["home"]["beforeAfter"] };

export default function BeforeAfter({ images: beforeAfterImages, texts }: BeforeAfterProps) {
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
    <section className="text-fluid-section-gap bg-forest-900">
      <div className="container-app mx-auto max-w-315">
        <Reveal
          ref={containerRef}
          className="relative aspect-5094/2842 select-none"
          onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            updateFromClientX(e.clientX);
          }}
          onPointerMove={(e: React.PointerEvent<HTMLDivElement>) => {
            if (dragging.current) updateFromClientX(e.clientX);
          }}
          onPointerUp={(e: React.PointerEvent<HTMLDivElement>) => {
            dragging.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
          {/* For Him (base layer, full width) */}
          <div className="absolute inset-0 overflow-hidden rounded-md bg-[#77544f]">
            <Image
              src={beforeAfterImages.him}
              alt=""
              fill
              className="object-contain p-3 sm:p-8"
              sizes="(max-width: 1259px) 100vw, 1260px"
            />
            <div className="absolute bottom-5 left-5 flex flex-col items-start gap-3 sm:bottom-10 sm:left-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cream-50">{texts.him.label}</p>
              <Button href={texts.him.href}>{texts.him.buttonLabel}</Button>
            </div>
          </div>

          {/* For Her (clipped overlay, revealed from the right) */}
          <div
            className="absolute inset-0 overflow-hidden rounded-md bg-cream-200"
            style={{ clipPath: `inset(0 0 0 ${position}%)` }}
          >
            <Image
              src={beforeAfterImages.her}
              alt=""
              fill
              className="object-contain p-3 sm:p-8"
              sizes="(max-width: 1259px) 100vw, 1260px"
            />
            <div className="absolute right-5 bottom-5 flex flex-col items-end gap-3 text-right sm:right-10 sm:bottom-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cream-50">{texts.her.label}</p>
              <Button href={texts.her.href}>{texts.her.buttonLabel}</Button>
            </div>
          </div>

          {/* Divider handle. Deliberately outside the rounded/clipped image
              layers above (not overflow-hidden itself) so at 0%/100% it
              sits half off the edge, same as the reference site, instead
              of being cropped flush with the border. */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cream-50"
            style={{ left: `${position}%` }}
          >
            <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50 text-forest-900 shadow-md sm:h-12.5 sm:w-12.5">
              <ChevronLeft size={14} />
              <ChevronRight size={14} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
