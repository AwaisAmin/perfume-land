import Button from "@/components/ui/Button";
import PerfumeBottle from "@/components/ui/PerfumeBottle";
import Reveal from "@/components/ui/Reveal";
import type { Product } from "@/lib/types";

export default function FeaturedProduct({ product }: { product: Product }) {
  return (
    <section className="text-fluid-section-gap border-y border-ink/10 bg-cream-100">
      <div className="container-app">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">
            Our Selection
          </p>
          <h2 className="text-fluid-h2 mt-2 font-extrabold">Product of the Week</h2>
        </Reveal>

        <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
          <Reveal className="flex aspect-square items-center justify-center rounded-md bg-forest-900">
            <PerfumeBottle className="h-2/3 w-auto text-gold-400" />
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col items-start gap-5">
            <h3 className="text-fluid-h2 font-bold">{product.title}</h3>
            <p className="max-w-md text-ink/70">
              A rich, smoky oud wrapped in dark berries and warm amber — bold,
              intense, and unmistakably Amanzada.
            </p>
            <div className="flex items-baseline gap-3 text-lg">
              <span className="font-bold">Dhs. {product.price.toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="text-ink/40 line-through">
                  Dhs. {product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Button href={`/products/${product.handle}`}>Add to Cart</Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
