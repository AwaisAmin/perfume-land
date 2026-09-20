"use client";

import { useId, useState, type ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

type ContactFormProps = {
  kicker?: ReactNode;
  title?: string;
  description?: ReactNode;
};

/**
 * A reusable contact-form section (kicker + heading + description + Name/
 * E-mail/Message form) — page-agnostic, so it can be dropped onto any page
 * via a plain import. Used as-is for "Suggest a Fragrance" and with
 * overridden copy for the general "Contact Us" page; `useId` keeps field
 * ids unique even when both instances render on the same page.
 */
export default function ContactForm({
  kicker = "Can't find your perfect scent? Tell us what you're looking for and we'll bring it to you.",
  title = "Suggest a Fragrance",
  description = "Please include your WhatsApp number in your message so we can reach out to you with personalized fragrance recommendations.",
}: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const id = useId();

  return (
    <section className="text-fluid-section-gap border-y border-ink/10 bg-cream-50">
      {/* container-app's own responsive gutter padding stacks with this
          max-width, so the cap needs to be the reference site's 680px
          content width PLUS that gutter (2×48px at desktop) — otherwise
          the actual content renders narrower than the real container--xs. */}
      <div className="container-app mx-auto max-w-194">
        <Reveal className="text-center">
          <p className="text-xs font-normal uppercase tracking-[0.18em] text-forest-900">
            {kicker}
          </p>
          <h2 className="text-fluid-h2 mt-4.5 font-semibold text-forest-900">{title}</h2>
          <p className="mt-8 text-ink/70">{description}</p>
        </Reveal>

        <form
          className="mt-20 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-name`} className="sr-only">
                Name
              </label>
              <input
                id={`${id}-name`}
                type="text"
                required
                placeholder="Name"
                autoComplete="name"
                className="w-full rounded-none border border-ink/15 bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor={`${id}-email`} className="sr-only">
                E-mail
              </label>
              <input
                id={`${id}-email`}
                type="email"
                required
                placeholder="E-mail"
                autoComplete="email"
                className="w-full rounded-none border border-ink/15 bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-message`} className="sr-only">
              Message
            </label>
            <textarea
              id={`${id}-message`}
              required
              placeholder="Message"
              rows={4}
              className="w-full resize-y rounded-none border border-ink/15 bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-none bg-forest-900 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-cream-100 transition-colors hover:bg-forest-950"
          >
            {submitted ? "Message not sent — please contact us on WhatsApp" : "Send message"}
          </button>
        </form>
      </div>
    </section>
  );
}
