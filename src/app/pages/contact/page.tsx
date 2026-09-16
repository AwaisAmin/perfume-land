import Link from "next/link";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";

export default function ContactPage() {
  return (
    <>
      {/* The general "Contact Us" form — the only genuinely new section
          here; everything else on the page is reused as-is. */}
      <ContactForm
        kicker="Need assistance?"
        title="Contact Us"
        description={
          <>
            To get answers to general questions, check out our{" "}
            <Link href="/pages/faq" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
              FAQ
            </Link>
            . For additional assistance, please complete the form below. Our team will contact you soon.
          </>
        }
      />

      {/* Reused features — already built, just imported. */}
      <ContactForm />
      <TrustBadges />
    </>
  );
}
