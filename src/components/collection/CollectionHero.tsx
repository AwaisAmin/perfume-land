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
    // Pulled up by the header's own height (same technique as the homepage
    // Hero) so the banner starts at the very top of the page and the
    // transparent header overlays it, instead of sitting below the header.
    // Height isn't fixed — it scales with the banner photo's own aspect
    // ratio (1942x809 on the live site), confirmed by measuring the real
    // collection page at two different viewport widths (600px @1440,
    // 833px @2000 — both match width / 2.4 exactly).
    <section
      className="relative flex w-full min-h-80 aspect-1942/809 items-center justify-center overflow-hidden bg-forest-900"
      style={{ marginTop: "calc(-1 * var(--header-height))" }}
    >
      {/* The banner is this page's largest paint, so it is marked priority
          and shown as soon as it decodes. It used to fade in over 700ms
          once loaded, from back when these were hotlinked and arrived at
          unpredictable times; they ship with the app now, and the fade only
          delayed the paint it was meant to smooth over. */}
      {image && (
        <Image
          src={image}
          alt={title}
          fill
          priority
          fetchPriority="high"
          className="object-contain object-right p-8 sm:px-20"
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-ink/30" />
      <h1 className="text-fluid-h1 relative z-10 max-w-[65%] text-center font-normal text-cream-50">{title}</h1>
    </section>
  );
}
