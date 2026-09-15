import ProductCard from "./ProductCard";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import type { Collection } from "@/lib/types";

export default function FeaturedCollection({ collection }: { collection: Collection }) {
  return (
    <section className="text-fluid-section-gap">
      <div className="container-app">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-normal uppercase tracking-[0.18em] text-forest-900">
            {collection.kicker}
          </p>
          <h2 className="text-fluid-h2 font-normal text-forest-900">{collection.title}</h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 lg:gap-8">
          {collection.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Button href={`/collections/${collection.handle}`} variant="outline">
            View all
          </Button>
        </div>
      </div>
    </section>
  );
}
