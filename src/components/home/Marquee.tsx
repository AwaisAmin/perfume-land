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
        "overflow-hidden border-y py-4",
        tone === "gold"
          ? "border-gold-600/40 bg-gold-500 text-cream-50"
          : "border-forest-700 bg-forest-800 text-cream-100",
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
            className="text-fluid-h2 mx-6 font-extrabold uppercase tracking-wide"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
