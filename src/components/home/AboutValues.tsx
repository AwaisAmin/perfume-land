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
    <section className="text-fluid-section-gap bg-forest-900 text-cream-50">
      <div className="container-app">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="text-fluid-h2 font-normal">About Us</h2>
          <p className="mt-4 text-cream-100/80">
            Amanzada crafts timeless fragrances with the finest ingredients,
            blending tradition and modern artistry into every scent.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {values.map((value, i) => (
            <Reveal
              key={value.title}
              delay={i * 0.1}
              className="flex flex-col items-center gap-3 text-center"
            >
              <h3 className="text-lg font-normal text-gold-400">{value.title}</h3>
              <p className="text-sm text-cream-100/70">{value.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
