import Link from "next/link";

const infoLinks = [
  { label: "FAQ", href: "/pages/faq" },
  { label: "Shipping & Returns", href: "/pages/shipping-returns" },
  { label: "Terms of Service", href: "/pages/terms-of-service" },
  { label: "Privacy Policy", href: "/pages/privacy-policy" },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-forest-950 text-cream-100">
      <div className="container-app grid gap-10 py-16 sm:grid-cols-3">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-400">
            Contact Us
          </p>
          <div className="flex flex-col gap-2 text-sm text-cream-100/70">
            <Link href="/pages/store-locations" className="hover:text-cream-50">
              Amanzada Store Locations
            </Link>
            <p>+971 55 187 1965</p>
            <p>info@amanzadaland.com</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-400">
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

        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-400">
            Follow Us
          </p>
          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-cream-100/70 hover:text-cream-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="text-cream-100/70 hover:text-cream-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="5.5" width="20" height="13" rx="4" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-cream-100/10 py-6">
        <p className="container-app text-center text-xs text-cream-100/50">
          © {new Date().getFullYear()} Amanzada Land. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
