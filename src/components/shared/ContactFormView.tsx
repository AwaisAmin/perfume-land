"use client";

import { useId, useState, type ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

type ContactFormViewProps = {
  kicker: ReactNode;
  title: string;
  description: ReactNode;
  labels: { name: string; email: string; message: string; submit: string; submitted: string };
};

/**
 * A reusable contact-form section (kicker + heading + description + Name/
 * E-mail/Message form) — page-agnostic, so it can be dropped onto any page
 * via a plain import. Used as-is for "Suggest a Fragrance" and with
 * overridden copy for the general "Contact Us" page; `useId` keeps field
 * ids unique even when both instances render on the same page.
 */
export default function ContactFormView({ kicker, title, description, labels }: ContactFormViewProps) {
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
                {labels.name}
              </label>
              <input
                id={`${id}-name`}
                type="text"
                required
                placeholder={labels.name}
                autoComplete="name"
                className="w-full rounded-none border border-ink/15 bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor={`${id}-email`} className="sr-only">
                {labels.email}
              </label>
              <input
                id={`${id}-email`}
                type="email"
                required
                placeholder={labels.email}
                autoComplete="email"
                className="w-full rounded-none border border-ink/15 bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-message`} className="sr-only">
              {labels.message}
            </label>
            <textarea
              id={`${id}-message`}
              required
              placeholder={labels.message}
              rows={4}
              className="w-full resize-y rounded-none border border-ink/15 bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-none bg-forest-900 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-cream-100 transition-colors hover:bg-forest-950"
          >
            {submitted ? labels.submitted : labels.submit}
          </button>
        </form>
      </div>
    </section>
  );
}
