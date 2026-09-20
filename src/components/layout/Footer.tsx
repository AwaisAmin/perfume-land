import Link from "next/link";
import { ArrowUpRight, MapPin, MessageCircle } from "lucide-react";
import { brandImpressionsGroups } from "@/data/nav";
import { branches, whatsappNumber, whatsappUrl } from "@/data/branches";
import Flag from "@/components/ui/Flag";
import Logo from "@/components/ui/Logo";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/harissbhaiperfumer/",
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
    href: "https://www.youtube.com/@HarissBhaiPerfumer",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5.5" width="20" height="13" rx="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@harissbhaiperfumer",
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
    href: whatsappUrl,
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

export default function Footer() {
  return (
    <footer className="border-t border-cream-100/10 bg-forest-900 text-cream-100">
      <div className="container-app">
        <div className="flex flex-col gap-6 border-b border-cream-100/15 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-gold-400">A fragrance that feels like you</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">Let&apos;s find your next favourite.</h2>
            <p className="mt-3 text-sm leading-7 text-cream-100/70">Tell us the scents you love. We&apos;ll help you choose a blend, a refill or an everyday signature.</p>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit shrink-0 items-center justify-center gap-3 rounded-sm bg-gold-400 px-6 py-4 text-sm font-semibold text-forest-950 transition-colors hover:bg-gold-100">
            <MessageCircle size={18} aria-hidden="true" /> Ask Hariss Bhai <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>

        <div className="grid gap-x-10 gap-y-10 py-12 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_0.8fr_1.2fr]">
          <div>
            <Link href="/" aria-label="Hariss Bhai Perfumes home" className="inline-flex items-center gap-3">
              <Logo />
              <span className="text-base font-semibold">Hariss Bhai Perfumes</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-cream-100/70">From our counter in Lahore to your doorstep. Perfumes, oils and designer-inspired blends, mixed and filled by hand for the way you like to wear them.</p>
            <p className="mt-5 text-xs uppercase tracking-widest text-gold-400">Blended in Lahore &middot; Shipped across Pakistan</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-100/20 text-cream-100/80 transition-colors hover:border-gold-400 hover:text-gold-400">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer collections">
            <h2 className="text-xs uppercase tracking-[0.18em] text-gold-400">Explore the Collection</h2>
            <ul className="mt-5 space-y-3 text-sm text-cream-100/75">
              <li><Link href="/collections/signature-collection" className="inline-block py-1 hover:text-cream-50">Signature Collection</Link></li>
              {brandImpressionsGroups[0].links.map((link) => (
                <li key={link.href}><Link href={link.href} className="inline-block py-1 hover:text-cream-50">{link.label}</Link></li>
              ))}
              <li><Link href="/collections/standard-collection-oil" className="inline-block py-1 hover:text-cream-50">Perfume Oils</Link></li>
              <li><Link href="/collections/standard-collection-interior-perfumes" className="inline-block py-1 hover:text-cream-50">Interior Perfumes</Link></li>
              <li><Link href="/collections" className="inline-block py-1 text-gold-400 hover:text-cream-50">Shop All Collections &rarr;</Link></li>
            </ul>
          </nav>

          <nav aria-label="Footer help and information">
            <h2 className="text-xs uppercase tracking-[0.18em] text-gold-400">Here to Help</h2>
            <ul className="mt-5 space-y-3 text-sm text-cream-100/75">
              <li><Link href="/pages/about" className="inline-block py-1 hover:text-cream-50">Our Story</Link></li>
              <li><Link href="/pages/contact" className="inline-block py-1 hover:text-cream-50">Contact Us</Link></li>
              <li><Link href="/search" className="inline-block py-1 hover:text-cream-50">Find a Fragrance</Link></li>
              <li><a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-block py-1 hover:text-cream-50">Custom Blends & Refills</a></li>
              <li><a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-block py-1 hover:text-cream-50">Order & Delivery Help</a></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-xs uppercase tracking-[0.18em] text-gold-400">Visit Our Counters</h2>
            <div className="mt-5 space-y-5 text-sm">
              {branches.map((branch) => (
                <div key={branch.name} className="flex items-start gap-3">
                  <MapPin size={18} className="mt-1 shrink-0 text-gold-400" aria-hidden="true" />
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    <p className="mt-1 leading-6 text-cream-100/70">{branch.address}</p>
                    {branch.mapUrl && <a href={branch.mapUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 py-1 text-xs text-gold-400 hover:text-cream-50">Get directions <ArrowUpRight size={13} aria-hidden="true" /></a>}
                  </div>
                </div>
              ))}
              <div className="border-t border-cream-100/15 pt-5">
                <p className="text-xs text-cream-100/60">WhatsApp for orders & enquiries</p>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-base font-medium hover:text-gold-400">{whatsappNumber}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-cream-100/15 py-6 text-xs text-cream-100/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Hariss Bhai Perfumes. All rights reserved.</p>
          <p className="flex items-center gap-2"><Flag code="pk" className="h-3.5 w-5 rounded-xs" /> Pakistan &middot; PKR Rs</p>
          <p>Made with care. Worn with character.</p>
        </div>
      </div>
    </footer>
  );
}
