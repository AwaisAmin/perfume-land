import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import Newsletter from "@/components/home/Newsletter";
import { worldwideLinks } from "@/data/nav";

export default function WorldWidePage() {
  return (
    <>
      <PageHeader>
        <h1 className="text-fluid-h2 font-normal text-cream-50">World Wide</h1>
      </PageHeader>

      <section className="text-fluid-section-gap border-b border-cream-50/10 bg-forest-900">
        <div className="container-app">
          {/* Left-aligned (not centered) but pulled in well past the plain
              container gutter, matching the reference site's list inset. */}
          <Reveal className="flex max-w-170 flex-col gap-6 pl-32 sm:pl-48 lg:pl-72">
            {worldwideLinks.map((link) => (
              <div key={link.href} className="flex items-baseline gap-1">
                <span className="text-[10px] font-semibold text-cream-50/70">{link.code}</span>
                <Link
                  href={link.href}
                  className="text-[15px] text-cream-50 underline decoration-cream-50/40 underline-offset-4 transition-colors hover:text-cream-50/70"
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <Newsletter />
      <ContactForm />
      <TrustBadges />
    </>
  );
}
