import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import MultiColumnSection from "@/components/shared/MultiColumnSection";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import { brandLeaders, brandValues, journeyImage } from "@/data/brand";

export default function AboutPage() {
  return (
    <>
      {/* "The Goal" — the only genuinely new hero-style section; everything
          below it is reused (About Us' values pattern, Suggest a Fragrance,
          trust badges). */}
      <section className="text-fluid-section-gap border-y border-cream-50/10 bg-forest-900 text-cream-100">
        {/* Capped to the reference site's container--md (1150px content),
            same compensation pattern as BeforeAfter/ContactForm: the cap
            has to include container-app's own gutter (2×48px), otherwise
            this renders far wider (and the image far taller) than the
            original — confirmed by measuring both sites at 1440px: their
            image was 655×814, ours was 905×1131 before this fix. */}
        <div className="container-app mx-auto grid max-w-311.5 items-center gap-10 md:grid-cols-[1fr_375px] md:gap-30">
          <Reveal className="relative aspect-4/5 overflow-hidden rounded-md">
            <Image
              src={journeyImage}
              alt=""
              fill
              className="object-contain p-6 sm:p-10"
              sizes="(max-width: 767px) 100vw, 60vw"
              priority
            />
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col items-start gap-5">
            <div>
              <p className="text-xs font-normal uppercase tracking-[0.18em] text-cream-100">
                Our Journey
              </p>
              <h2 className="text-fluid-h2 mt-4 font-normal text-cream-100">The Goal</h2>
            </div>

            <p className="text-cream-100">
              Our journey began in Dubai, but our vision has always been global.
            </p>
            <p className="text-cream-100">
              Our goal is to open Haris Bhai Perfumes stores in as many cities and countries as possible,
              making our fragrances easily accessible to people around the world. We want
              customers everywhere to experience Haris Bhai Perfumes, discover our products, and enjoy
              quality fragrances at fair prices.
            </p>
            <p className="text-cream-100">
              Step by step, store by store, and country by country, we are building a global
              fragrance brand.
            </p>
            <p className="font-semibold text-cream-100">
              From Dubai to the world, our journey has just started.
            </p>
          </Reveal>
        </div>
      </section>

      <MultiColumnSection
        tone="white"
        kicker="Meet Our Leaders"
        heading="Our Leaders"
        intro={[
          "At Haris Bhai Perfumes, we believe everyone deserves to experience luxury fragrances at a fair price.",
          "Founded by Haseeb Amanzada and later joined by Saleem Amanzada and Rashid Amanzada, our family run brand continues to grow with one mission: to improve our quality and make beautiful fragrances accessible to everyone.",
        ]}
        items={brandLeaders}
      />

      <MultiColumnSection tone="gold" items={brandValues} />

      <ContactForm />
      <TrustBadges />
    </>
  );
}
