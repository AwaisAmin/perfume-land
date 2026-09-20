import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import MultiColumnSection from "@/components/shared/MultiColumnSection";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import { brandCraft, brandValues, journeyImage } from "@/data/brand";

export default function AboutPage() {
  return (
    <>
      {/* "Our Story" — the only genuinely new hero-style section; everything
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
              alt="Haris Ali Rasheed behind the counter at Hariss Bhai Perfumes in Lahore"
              fill
              className="object-cover"
              sizes="(max-width: 767px) 100vw, 60vw"
              preload
            />
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col items-start gap-5">
            <div>
              <p className="text-xs font-normal uppercase tracking-[0.18em] text-cream-100">
                Our Story
              </p>
              <h2 className="text-fluid-h2 mt-4 font-normal text-cream-100">
                A Counter in Lahore
              </h2>
            </div>

            <p className="text-cream-100">
              Hariss Bhai Perfumes is a perfume counter in Bahria Town, Lahore, run by
              Haris Ali Rasheed — the Hariss Bhai people come in and ask for by name.
            </p>
            <p className="text-cream-100">
              The work is simple and it happens in front of you. You name the fragrance
              you are after, or bring in the empty bottle you have been refilling for
              years, and it is blended and filled at the counter. If you want it sweeter,
              woodier or heavier, we adjust it there and then — which is something a
              sealed box can never do.
            </p>
            <p className="text-cream-100">
              What started as a shop counter now reaches far past it. The blending gets
              filmed and posted, and the orders come back from people who have never set
              foot in Lahore — a fragrance they smelled once abroad, a bottle they cannot
              find here any more, a note they want dialled up.
            </p>
            <p className="font-semibold text-cream-100">
              Same counter, same hands, now shipping across Pakistan.
            </p>
          </Reveal>
        </div>
      </section>

      <MultiColumnSection
        tone="white"
        kicker="What We Do"
        heading="Three Ways to Leave With a Bottle"
        intro={[
          "We believe a good fragrance should not be something you save for one night a year.",
          "The shop is built around that: blend something new, refill what you already own, or pick an impression of a designer scent you like — across sprays, perfume oils and interior perfumes.",
        ]}
        items={brandCraft}
      />

      <MultiColumnSection tone="gold" items={brandValues} />

      <ContactForm />
      <TrustBadges />
    </>
  );
}
