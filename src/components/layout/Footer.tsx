"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { countrySelector } from "@/data/nav";
import Flag from "@/components/ui/Flag";

const infoLinks = [
  { label: "FAQ", href: "/pages/faq" },
  { label: "SHIPPING & RETURNS", href: "/pages/shipping-returns" },
  { label: "TERMS OF SERVICE", href: "/pages/terms-of-service" },
  { label: "PRIVACY POLICY", href: "/pages/privacy-policy" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5.5" width="20" height="13" rx="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M16.5 3c.3 2.1 1.6 3.6 3.8 3.8v2.8a6.6 6.6 0 0 1-3.8-1.2v6.4a5.2 5.2 0 1 1-5.2-5.2c.15 0 .3 0 .45.02v2.7a2.5 2.5 0 1 0 2 2.45V3h2.75Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "tel:+971551871965",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M19.35 4.55A10.3 10.3 0 0 0 12 1.5C6.26 1.5 1.6 6.17 1.6 11.9c0 1.85.49 3.63 1.4 5.2L1.5 22.5l5.52-1.45a10.4 10.4 0 0 0 4.97 1.27h.01c5.74 0 10.4-4.67 10.4-10.4a10.34 10.34 0 0 0-3.05-7.37Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8.9 7.6c-.22-.5-.39-.5-.58-.5h-.5a.95.95 0 0 0-.69.33c-.24.26-.91.89-.91 2.17s.93 2.51 1.06 2.69c.13.17 1.83 2.8 4.44 3.92 2.16.94 2.6.75 3.07.7.5-.07 1.53-.63 1.75-1.24.22-.6.22-1.12.15-1.23-.06-.11-.24-.17-.5-.3-.26-.13-1.54-.76-1.78-.84-.24-.09-.41-.13-.59.13-.17.26-.67.84-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.1-.4-2.09-1.29a7.82 7.82 0 0 1-1.44-1.8c-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.06-.13-.55-1.41-.8-1.93Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

const paymentBadges = [
  { label: "AMEX", bg: "#0071CE", fg: "#ffffff" },
  { label: "APPLE PAY", bg: "#000000", fg: "#ffffff" },
  { label: "DINERS", bg: "#0079BE", fg: "#ffffff" },
  { label: "DISCOVER", bg: "#F16521", fg: "#ffffff" },
  { label: "G PAY", bg: "#ffffff", fg: "#3c4043" },
  { label: "JCB", bg: "#0e4c96", fg: "#ffffff" },
  { label: "MASTERCARD", bg: "#16130d", fg: "#ffffff" },
  { label: "VISA", bg: "#1a1f71", fg: "#ffffff" },
];

export default function Footer() {
  const [countryOpen, setCountryOpen] = useState(false);

  return (
    <footer className="bg-forest-900 text-cream-100">
      {/* Matches the reference site's actual computed footer spacing
          exactly: pt-112px/pb-48px, and a single 48px gap between every
          row (columns, social icons, bottom bar) — it has no border
          anywhere in or around it, so none is added here either. */}
      <div className="container-app flex flex-col gap-12 pt-28 pb-12">
        {/* Content-sized columns spread with space-between (not a stretched
            50/50 grid) — matches the reference's --footer-content-justify-
            items: space-between, so the gap grows on wide screens instead
            of the columns themselves. */}
        <div className="flex flex-col flex-wrap gap-10 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-4 sm:gap-5">
            <p className="text-xs font-normal uppercase tracking-[0.18em] text-cream-100">
              Contact Us
            </p>
            <div className="flex flex-col gap-5 text-sm text-cream-100/70">
              <Link
                href="/pages/amanzada-store-locations-in-uae"
                className="underline decoration-cream-100/30 underline-offset-2 hover:text-cream-50"
              >
                Amanzada Perfumes Store Locations UAE
              </Link>
              <p>+971 55 187 1965</p>
              <p>info@amanzadaperfumes.com</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            <p className="text-xs font-normal uppercase tracking-[0.18em] text-cream-100">
              Information
            </p>
            <ul className="flex flex-col gap-2.5 text-sm text-cream-100/70">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-cream-50">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-8">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="text-cream-100/70 transition-colors hover:text-cream-50"
            >
              {social.icon}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCountryOpen((open) => !open)}
              aria-expanded={countryOpen}
              className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-widest text-cream-100/70 hover:text-cream-50"
            >
              <Flag code="ae" className="h-3.5 w-5 rounded-xs" />
              United Arab Emirates (AED د.إ)
              <ChevronDown size={10} className={countryOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>

            <AnimatePresence>
              {countryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute bottom-full left-0 z-10 mb-2 max-h-80 w-64 overflow-y-auto rounded-md border border-cream-50/10 bg-forest-900 p-2 shadow-lg"
                >
                  {countrySelector.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCountryOpen(false)}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-left text-sm text-cream-50/50 transition-colors hover:text-cream-50"
                    >
                      <Flag code={c.code} className="h-3.5 w-5 shrink-0 rounded-[1px]" />
                      <span>
                        {c.label} <span className="whitespace-nowrap">(AED د.إ)</span>
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-xs text-cream-100/50">
            © {new Date().getFullYear()} - Amanzada Perfumes
          </p>

          <ul className="flex flex-wrap items-center gap-2">
            {paymentBadges.map((badge) => (
              <li
                key={badge.label}
                style={{ background: badge.bg, color: badge.fg }}
                className="flex h-6 items-center rounded-xs px-2 text-[9px] font-semibold tracking-wide"
              >
                {badge.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
