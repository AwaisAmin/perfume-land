import Image from "next/image";

type CollectionHeroProps = {
  title: string;
  image?: string;
};

/**
 * The full-bleed banner at the top of any collection page — image with a
 * centered title overlay, header-transparent like the homepage Hero. Takes
 * plain props (no collection-object coupling) so it works for any
 * collection, current or future.
 */
export default function CollectionHero({ title, image }: CollectionHeroProps) {
  return (
    <section
      className="relative flex items-center justify-center overflow-hidden bg-forest-900"
      style={{ minHeight: "calc(var(--header-height, 84px) + 26rem)" }}
    >
      {image && (
        <Image
          src={image}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-ink/30" />
      <h1 className="text-fluid-h1 relative z-10 mt-(--header-height,84px) font-normal text-cream-50">
        {title}
      </h1>
    </section>
  );
}
