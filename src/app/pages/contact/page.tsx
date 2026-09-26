import Link from "next/link";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import { getSiteData } from "@/lib/site-data";

export default async function ContactPage() {
  const texts = (await getSiteData()).content.contactPage;
  return (
    <>
      {/* The general "Contact Us" form — the only genuinely new section
          here; everything else on the page is reused as-is. */}
      <ContactForm
        kicker={texts.kicker}
        title={texts.title}
        description={
          <>
            {texts.descriptionStart}{" "}
            <Link href={texts.link.href} className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
              {texts.link.label}
            </Link>
            {texts.descriptionEnd}
          </>
        }
      />

      {/* Reused features — already built, just imported. */}
      <ContactForm />
      <TrustBadges />
    </>
  );
}
