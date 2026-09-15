import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const badges = [
  { label: "Best Sellers", href: "/collections/best-sellers" },
  { label: "New Arrival", href: "/collections/new-arrivals" },
  { label: "Premium Collection", href: "/collections/premium-collection" },
  { label: "Exclusive Collection", href: "/collections/exclusive-collection" },
  { label: "Standard Collection", href: "/collections/standard-collection" },
];

// A subtle triangular-grid texture behind the label, built from three
// overlapping line directions instead of an image asset.
const hexPatternStyle = {
  backgroundImage: [
    "repeating-linear-gradient(60deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 16px)",
    "repeating-linear-gradient(-60deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 16px)",
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 16px)",
  ].join(", "),
};

export default function MediaGrid() {
  return (
    <section className="text-fluid-section-gap">
      <div className="container-app">
        <Reveal className="text-center">
          <h2 className="text-fluid-h2 font-normal">Curated For You</h2>
        </Reveal>

        <div className="mt-12 flex flex-wrap items-start justify-center gap-x-6 gap-y-8 sm:gap-x-44">
          {badges.map((badge, i) => (
            <Reveal key={badge.label} delay={i * 0.05}>
              <Link
                href={badge.href}
                style={hexPatternStyle}
                className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-forest-900 text-center text-cream-50 transition-transform duration-300 hover:scale-105 sm:h-36 sm:w-36"
              >
                <span className="px-3 text-xs font-semibold uppercase leading-snug tracking-wide sm:text-sm">
                  {badge.label}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
