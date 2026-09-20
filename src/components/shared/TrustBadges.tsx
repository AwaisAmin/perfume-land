import { Headphones, ShieldCheck, Truck } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import { whatsappUrl } from "@/data/branches";

type Badge = {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  description: ReactNode;
};

const whatsappLink = (
  <a
    href={whatsappUrl}
    target="_blank"
    rel="noreferrer"
    className="underline decoration-ink/30 underline-offset-2 hover:text-ink"
  >
    WhatsApp
  </a>
);

const badges: Badge[] = [
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description: "Delivered anywhere in Pakistan",
  },
  {
    icon: Headphones,
    title: "Customer Service",
    description: <>Get in touch through {whatsappLink}</>,
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Your payment information is processed securely.",
  },
];

/**
 * The reference site's three-icon trust-badges row — a standalone,
 * page-agnostic section so it can be reused anywhere via a plain import.
 */
export default function TrustBadges() {
  return (
    <section className="text-fluid-section-gap-tight border-y border-ink/10 bg-cream-50">
      {/* The reference site doesn't stretch these across 3 equal columns —
          each item is capped at 300px (min(18.75rem, ...)) and the row is
          centered with a fixed gap, so the badges group together instead
          of spreading edge to edge on a wide screen. */}
      <div className="container-app flex flex-wrap justify-center gap-x-15 gap-y-10">
        {badges.map((badge, i) => (
          <Reveal
            key={badge.title}
            delay={i * 0.05}
            className="flex basis-75 grow-0 shrink flex-col items-center gap-3 text-center"
          >
            <badge.icon size={24} strokeWidth={1.5} />
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-normal uppercase tracking-[0.18em] text-forest-900">
                {badge.title}
              </p>
              <p className="text-sm text-ink/70">{badge.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
