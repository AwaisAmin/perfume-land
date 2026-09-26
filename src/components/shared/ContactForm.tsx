import type { ReactNode } from "react";
import ContactFormView from "@/components/shared/ContactFormView";
import { getSiteData } from "@/lib/site-data";

type ContactFormProps = {
  kicker?: ReactNode;
  title?: string;
  description?: ReactNode;
};

/**
 * The reusable contact-form section. Texts come from the CRM
 * (`content.contactForm`); a page can override the heading copy (the
 * "Contact Us" page does). Only the texts the form needs are sent to the
 * client component.
 */
export default async function ContactForm({ kicker, title, description }: ContactFormProps) {
  const texts = (await getSiteData()).content.contactForm;
  return (
    <ContactFormView
      kicker={kicker ?? texts.kicker}
      title={title ?? texts.title}
      description={description ?? texts.description}
      labels={{
        name: texts.nameLabel,
        email: texts.emailLabel,
        message: texts.messageLabel,
        submit: texts.submit,
        submitted: texts.submitted,
      }}
    />
  );
}
