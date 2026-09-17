import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import type { ColumnItem } from "@/data/brand";

type Tone = "forest" | "white" | "gold";

const toneClasses: Record<Tone, { section: string; border: string; kicker: string; heading: string; intro: string; itemTitle: string; itemBody: string }> = {
  forest: {
    section: "bg-forest-900 text-cream-100",
    border: "border-cream-50/10",
    kicker: "text-cream-100",
    heading: "text-cream-100",
    intro: "text-cream-100",
    itemTitle: "text-cream-100",
    itemBody: "text-cream-100/80",
  },
  white: {
    section: "bg-cream-50 text-ink",
    border: "border-ink/10",
    kicker: "text-forest-900",
    heading: "text-forest-900",
    intro: "text-ink/70",
    itemTitle: "text-forest-900",
    itemBody: "text-ink/70",
  },
  gold: {
    section: "bg-gold-500 text-cream-50",
    border: "border-cream-50/10",
    kicker: "text-cream-50",
    heading: "text-cream-50",
    intro: "text-cream-50",
    itemTitle: "text-cream-50",
    itemBody: "text-cream-50/80",
  },
};

type MultiColumnSectionProps = {
  tone: Tone;
  kicker?: string;
  heading?: string;
  intro?: ReactNode[];
  items: ColumnItem[];
};

/**
 * The reference site's repeated "kicker + heading + intro + N columns"
 * pattern — used for the homepage's About Us, and the About page's Our
 * Leaders and values band, all with the exact same layout/spacing, just
 * different copy and color scheme (tone).
 */
export default function MultiColumnSection({ tone, kicker, heading, intro, items }: MultiColumnSectionProps) {
  const classes = toneClasses[tone];

  return (
    <section className={`text-fluid-section-gap border-y ${classes.border} ${classes.section}`}>
      <div className="container-app">
        {(kicker || heading || intro) && (
          <Reveal className="mx-auto max-w-2xl text-center">
            {kicker && (
              <p className={`text-xs font-normal uppercase tracking-[0.18em] ${classes.kicker}`}>
                {kicker}
              </p>
            )}
            {heading && (
              <h2 className={`text-fluid-h2 mt-5 font-normal ${classes.heading}`}>{heading}</h2>
            )}
            {intro?.map((paragraph, i) => (
              <p key={i} className={`mt-5 ${classes.intro}`}>
                {paragraph}
              </p>
            ))}
          </Reveal>
        )}

        {/* Gap matches the reference site's --multi-column-gap exactly:
            3.125rem on mobile, 4.375rem from the desktop breakpoint up. */}
        <div className={`grid gap-12.5 sm:grid-cols-3 md:gap-17.5 ${kicker || heading || intro ? "mt-16" : ""}`}>
          {items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 0.1}
              className="flex flex-col items-center gap-3 text-center"
            >
              <h3 className={`text-lg font-normal uppercase tracking-[0.18em] ${classes.itemTitle}`}>
                {item.title}
              </h3>
              <p className={`text-sm ${classes.itemBody}`}>{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
