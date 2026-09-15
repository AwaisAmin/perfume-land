import Reveal from "@/components/ui/Reveal";

const values = [
  {
    title: "Craftsmanship",
    body: "Every fragrance is meticulously composed using traditional and modern techniques.",
  },
  {
    title: "Authenticity",
    body: "We source only the finest, ethically harvested raw materials from around the world.",
  },
  {
    title: "Timelessness",
    body: "Our creations are designed to transcend trends and become lasting companions.",
  },
];

export default function AboutValues() {
  return (
    <section className="text-fluid-section-gap bg-forest-900 text-cream-100">
      <div className="container-app">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-fluid-h2 font-normal">About Us</h2>
          <p className="mt-5 text-cream-100">
            Amanzada perfumes crafts timeless fragrances with finest
            ingredients, blending tradition and modern artistry into every
            scent.
          </p>
        </Reveal>

        {/* Gap matches the reference site's --multi-column-gap exactly:
            3.125rem on mobile, 4.375rem from the desktop breakpoint up. */}
        <div className="mt-16 grid gap-12.5 sm:grid-cols-3 md:gap-17.5">
          {values.map((value, i) => (
            <Reveal
              key={value.title}
              delay={i * 0.1}
              className="flex flex-col items-center gap-3 text-center"
            >
              <h3 className="text-lg font-normal uppercase tracking-[0.18em] text-cream-100">
                {value.title}
              </h3>
              <p className="text-sm text-cream-100/80">{value.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
