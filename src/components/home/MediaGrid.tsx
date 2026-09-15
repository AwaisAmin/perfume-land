import Link from "next/link";
import PerfumeBottle from "@/components/ui/PerfumeBottle";
import Reveal from "@/components/ui/Reveal";

const tiles = [
  { label: "Best Sellers", href: "/collections/best-sellers", big: true, tone: "bg-forest-900 text-gold-400" },
  { label: "New Arrivals", href: "/collections/new-arrivals", big: false, tone: "bg-gold-500 text-forest-950" },
  { label: "Premium Collection", href: "/collections/premium-collection", big: false, tone: "bg-cream-200 text-forest-900" },
  { label: "Exclusive Collection", href: "/collections/exclusive-collection", big: false, tone: "bg-forest-800 text-cream-100" },
  { label: "Standard Collection", href: "/collections/standard-collection", big: false, tone: "bg-gold-100 text-forest-900" },
];

export default function MediaGrid() {
  return (
    <section className="text-fluid-section-gap">
      <div className="container-app">
        <Reveal className="text-center">
          <h2 className="text-fluid-h2 font-extrabold">Curated For You</h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:auto-rows-37.5 lg:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              aria-label={tile.label}
              className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-md lg:aspect-auto lg:col-span-2 ${
                tile.big ? "lg:row-span-2" : ""
              } ${tile.tone}`}
            >
              <PerfumeBottle className="h-1/2 w-auto opacity-70 transition-transform duration-500 group-hover:scale-110" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
