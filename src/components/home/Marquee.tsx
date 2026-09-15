import clsx from "clsx";

type MarqueeProps = {
  text: string;
  tone?: "gold" | "forest";
  direction?: "left" | "right";
};

export default function Marquee({ text, tone = "gold", direction = "left" }: MarqueeProps) {
  const items = Array.from({ length: 8 }, (_, i) => i);

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
