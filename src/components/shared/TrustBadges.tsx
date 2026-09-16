import { Headphones, Plane, ShieldCheck } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

type Badge = {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  description: ReactNode;
};

const whatsappLink = (
  <a
    href="tel:+971551871965"
    className="underline decoration-ink/30 underline-offset-2 hover:text-ink"
  >
    WhatsApp
  </a>
);

const badges: Badge[] = [
  {
    icon: Plane,
    title: "International Shipping",
    description: "Worldwide shipping - customs and duties excluded",
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
      <div className="container-app grid grid-cols-1 gap-6 sm:grid-cols-3">
        {badges.map((badge, i) => (
          <Reveal
            key={badge.title}
            delay={i * 0.05}
            className="flex flex-col items-center gap-3 text-center"
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
