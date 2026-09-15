"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { shopTheLookGroups } from "@/data/products";

export default function ShopTheLook() {
  const [active, setActive] = useState(0);
  // Only one look exists today, but the data is an array so a second one
  // (e.g. your own custom photo) is just another entry — see products.ts.
  const { image: groupImage, items } = shopTheLookGroups[0];
  const item = items[active];

  return (
    <section className="text-fluid-section-gap border-y border-ink/10">
      <div className="container-app">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-normal uppercase tracking-[0.18em] text-forest-900">
            made in dubai
          </p>
          <h2 className="text-fluid-h2 font-normal text-forest-900">Signature Fragrances</h2>
        </Reveal>

        {/* The reference site caps this row to 980px and centers it — even
            though every other section on the page runs full-bleed — with a
            fixed min(550px,60%) photo column beside a narrow, fixed-width
            product card, not a proportional/fluid split. */}
        <div className="mx-auto mt-10 grid max-w-245 gap-2 md:grid-cols-[min(550px,60%)_1fr] md:items-center">
          {/* Lifestyle photo with clickable hot spots */}
          <Reveal className="relative aspect-2752/1536 overflow-hidden rounded-md bg-cream-100">
            <Image
              src={groupImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 767px) 100vw, 550px"
            />
            {items.map((hotspot, i) => (
              <button
                key={hotspot.handle}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show ${hotspot.title}`}
                aria-current={i === active}
                className="absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center"
                style={{ top: `${hotspot.top}%`, left: `${hotspot.left}%` }}
              >
                <span
                  className="absolute h-10 w-10 rounded-full animate-hot-spot-ping"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(250,248,244,0), rgba(250,248,244,0.3))",
                  }}
                />
                <span
                  className={`relative h-4 w-4 rounded-full border border-ink/15 bg-cream-50 shadow-sm transition-transform duration-200 ${
                    i === active ? "scale-[1.3]" : ""
                  }`}
                />
              </button>
            ))}
          </Reveal>

          {/* Selected product panel, capped to the reference site's fixed
              270px card width so it reads as a compact card next to the
              wide photo. The cream tile behind the image is fixed — same
              as every other product card on the site — so only the bottle
              itself changes when a hot spot is clicked, not the backdrop. */}
          <Reveal delay={0.1} className="mx-auto flex w-full max-w-67.5 flex-col items-center gap-6 text-center">
            <div className="relative aspect-1125/1398 w-full overflow-hidden rounded-md bg-cream-100">
              <Image
                key={item.handle}
                src={item.image}
                alt={item.title}
                fill
                className="object-contain p-8"
                sizes="270px"
              />
            </div>

            <p className="text-xs font-normal uppercase tracking-[0.18em] text-forest-900">{item.title}</p>
            <p className="text-sm text-gold-600">Dhs. {item.price.toFixed(2)}</p>

            <Button href={`/products/${item.handle}`}>View Product</Button>

            <div className="mt-1 flex items-center gap-2">
              {items.map((hotspot, i) => (
                <button
                  key={hotspot.handle}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Go to ${hotspot.title}`}
                  className={`h-1.5 w-1.5 cursor-pointer rounded-full transition-colors ${
                    i === active ? "bg-ink" : "bg-ink/25"
                  }`}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
