"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import type { Collection } from "@/lib/types";

export default function FeaturedCollection({ collection }: { collection: Collection }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Embla only emits "select"/"reInit" after the first interaction, so the
    // button disabled-state must be synced once immediately after init too.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="text-fluid-section-gap">
      <div className="container-app">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">
            {collection.kicker}
          </p>
          <h2 className="text-fluid-h2 font-extrabold">{collection.title}</h2>
        </Reveal>

        <div className="relative mt-10">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="-ml-5 flex">
              {collection.products.map((product) => (
                <div className="pl-5" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Previous"
            disabled={!canPrev}
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-0 top-1/3 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-cream-50 transition disabled:opacity-0 md:flex"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={!canNext}
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-0 top-1/3 hidden h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-ink/15 bg-cream-50 transition disabled:opacity-0 md:flex"
          >
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          <Button href={`/collections/${collection.handle}`} variant="outline">
            View all
          </Button>
        </div>
      </div>
    </section>
  );
}
