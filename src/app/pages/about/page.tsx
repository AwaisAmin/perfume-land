import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import MultiColumnSection from "@/components/shared/MultiColumnSection";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import { getSiteData } from "@/lib/site-data";

export default async function AboutPage() {
  const { brand, content } = await getSiteData();
  const { brandCraft, brandValues, journeyImage } = brand;
  const texts = content.about;
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
          <Reveal immediate className="relative aspect-4/5 overflow-hidden rounded-md">
            <Image
              src={journeyImage}
              alt={texts.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 767px) 100vw, 60vw"
              preload
            />
          </Reveal>

          <Reveal immediate className="flex flex-col items-start gap-5">
            <div>
              <p className="text-xs font-normal uppercase tracking-[0.18em] text-cream-100">
                {texts.kicker}
              </p>
              <h2 className="text-fluid-h2 mt-4 font-normal text-cream-100">
                {texts.heading}
              </h2>
            </div>

            {texts.paragraphs.map((paragraph, i) => (
              <p key={i} className="text-cream-100">
                {paragraph}
              </p>
            ))}
            <p className="font-semibold text-cream-100">
              {texts.closing}
            </p>
          </Reveal>
        </div>
      </section>

      <MultiColumnSection
        tone="white"
        kicker={texts.whatWeDoKicker}
        heading={texts.whatWeDoHeading}
        intro={texts.whatWeDoIntro}
        items={brandCraft}
      />

      <MultiColumnSection tone="gold" items={brandValues} />

      <ContactForm />
      <TrustBadges />
    </>
  );
}
