import clsx from "clsx";

type MarqueeProps = {
  text: string;
  tone?: "gold" | "forest";
  direction?: "left" | "right";
};

export default function Marquee({ text, tone = "gold", direction = "left" }: MarqueeProps) {
  // Generous repeat count so both scrolling halves stay wider than the
  // viewport on very wide screens too — otherwise a gap flashes at the loop
  // seam once the content runs out before the translate completes.
  const items = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div
      className={clsx(
        "marquee-padding overflow-hidden border-y text-cream-100",
        tone === "gold" ? "border-gold-600/40 bg-gold-500" : "border-forest-700 bg-forest-800",
      )}
    >
      <div
        className={clsx(
          "flex w-max whitespace-nowrap",
          direction === "left" ? "animate-marquee" : "animate-marquee-reverse",
        )}
      >
        {items.map((i) => (
          <span
            key={i}
            className="marquee-text marquee-gap font-heading font-normal uppercase"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
