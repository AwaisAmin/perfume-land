"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="text-fluid-section-gap bg-gold-500 text-cream-50">
      <div className="container-app flex flex-col items-center text-center">
        <Reveal className="flex flex-col items-center gap-5">
          <p className="text-xs font-normal uppercase tracking-[0.18em]">
            Keep me updated
          </p>
          <h2 className="text-fluid-h2 font-normal">Newsletter</h2>
          {/* No wrap-forcing max-width here — the reference site's copy
              runs on a single line at this length; max-w-md was narrower
              than the text needed, forcing an unwanted second line. */}
          <p className="max-w-xl text-cream-50/90">
            Subscribe to receive exclusive previews, private releases, and the
            art of fragrance.
          </p>
        </Reveal>

        {/* Same max-width as the paragraph above, so the form's edges line
            up with the text instead of reading as a narrower, off-center
            block underneath it. */}
        <form
          className="mt-8 flex w-full max-w-xl gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            E-mail
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-none border border-cream-50/40 bg-transparent px-5 py-3 text-sm text-cream-50 placeholder:text-cream-50/70 focus:border-cream-50 focus:outline-none"
          />
          {/* The reference theme sets both --button-border-radius and
              --input-border-radius to 0 — every button/input on the site
              is square-cornered, not pill-shaped. */}
          <button
            type="submit"
            className="shrink-0 rounded-none bg-forest-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-cream-100 transition hover:bg-forest-950"
          >
            {submitted ? "Not available yet" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
