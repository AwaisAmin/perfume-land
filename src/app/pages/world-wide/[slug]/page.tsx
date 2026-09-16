import { notFound } from "next/navigation";
import { Clock, Globe, MapPin, Phone } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import Newsletter from "@/components/home/Newsletter";
import { getWorldwideLocation, worldwideLocations } from "@/data/locations";

export function generateStaticParams() {
  return worldwideLocations.map((location) => ({ slug: location.slug }));
}

export default async function WorldWideLocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getWorldwideLocation(slug);

  if (!location) {
    notFound();
  }

  const infoItems = [
    { icon: MapPin, label: "Location", value: location.location },
    { icon: Phone, label: "Telephone", value: location.telephone, href: `tel:${location.telephone.replace(/\s+/g, "")}` },
    { icon: Globe, label: "Website", value: location.website, href: location.website },
    { icon: Clock, label: "Working Hours", value: location.workingHours },
  ];

  return (
    <>
      <PageHeader className="flex flex-col items-center gap-16">
        <h1 className="text-fluid-h2 font-normal text-gold-400">
          <span className="mr-2 align-middle text-sm font-semibold">{location.code}</span>
          {location.label}
        </h1>
        <p className="text-sm uppercase tracking-[0.18em] text-cream-50">{location.storeName}</p>
      </PageHeader>

      <section className="text-fluid-section-gap border-b border-cream-50/10 bg-forest-900">
        <div className="container-app grid grid-cols-2 gap-10 text-center lg:grid-cols-4">
          {infoItems.map((item) => (
            <Reveal key={item.label} className="flex flex-col items-center gap-4">
              <item.icon size={28} strokeWidth={1.5} className="text-gold-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-sm text-cream-50/80 underline decoration-cream-50/30 underline-offset-4 hover:text-cream-50"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-sm text-cream-50/80">{item.value}</p>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      <Newsletter />
      <ContactForm />
      <TrustBadges />
    </>
  );
}
