"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import {
  brandImpressionsGroups,
  countrySelector,
  primaryNavEnd,
  primaryNavStart,
  worldwideLinks,
} from "@/data/nav";
import Logo from "@/components/ui/Logo";
import MobileDrawer from "./MobileDrawer";

type MenuKey = "brand" | "worldwide" | "country" | null;

const navLinkClass =
  "rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors duration-200 hover:bg-cream-50/10";

export default function Header() {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [activeGroup, setActiveGroup] = useState(brandImpressionsGroups[0].title);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const closeMenus = () => setOpenMenu(null);
  const activeLinks =
    brandImpressionsGroups.find((g) => g.title === activeGroup)?.links ?? [];

  // Publish the header's real (responsive) height so the hero below can pull
  // itself up underneath it and overlay it transparently, instead of the
  // header pushing page content down.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publishHeight = () => {
      document.documentElement.style.setProperty("--header-height", `${el.offsetHeight}px`);
    };
    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className="relative z-40 w-full bg-transparent text-cream-50"
      onMouseLeave={closeMenus}
    >
      {/* Row 1: spacer / logo / account icons */}
      <div className="container-app grid grid-cols-3 items-center py-2">
        <div />

        <Link href="/" className="justify-self-center" aria-label="Amanzada home">
          <Logo className="border-cream-50/40" />
        </Link>

        <div className="flex items-center justify-self-end gap-4 sm:gap-5">
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "country" ? null : "country"))}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-widest transition hover:bg-cream-50/10"
            >
              🇦🇪 AED
              <ChevronDown size={12} />
            </button>
          </div>

          <Link
            href="/account"
            className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-widest transition hover:bg-cream-50/10 md:flex"
          >
            <User size={17} />
            <span>Login</span>
          </Link>

          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((s) => !s)}
            className="rounded-md p-1.5 transition hover:bg-cream-50/10"
          >
            <Search size={18} />
          </button>

          <Link href="/cart" aria-label="Cart" className="rounded-md p-1.5 transition hover:bg-cream-50/10">
            <ShoppingBag size={18} />
          </Link>

          <button
            type="button"
            aria-label="Open menu"
            className="rounded-md p-1.5 transition hover:bg-cream-50/10 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Row 2: primary navigation */}
      <div className="container-app hidden items-center justify-center gap-2 pb-3 lg:flex">
        {primaryNavStart.map((link) => (
          <Link key={link.href} href={link.href} className={navLinkClass}>
            {link.label}
          </Link>
        ))}

        <div className="relative" onMouseEnter={() => setOpenMenu("brand")}>
          <Link href="/collections/standard-collection" className={navLinkClass}>
            Brand Impressions
          </Link>

          <AnimatePresence>
            {openMenu === "brand" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-1/2 top-full z-10 flex -translate-x-1/2 overflow-hidden rounded-md border border-cream-50/10 bg-forest-950 shadow-xl"
              >
                <ul className="w-56 py-3">
                  {brandImpressionsGroups.map((group) => (
                    <li key={group.title}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveGroup(group.title)}
                        className={`flex w-full items-center justify-between px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${
                          activeGroup === group.title
                            ? "bg-cream-50/10 text-gold-400"
                            : "hover:bg-cream-50/5"
                        }`}
                      >
                        {group.title}
                        <ChevronRight size={13} />
                      </button>
                    </li>
                  ))}
                </ul>

                <ul className="w-56 border-l border-cream-50/10 py-3">
                  {activeLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block px-5 py-3 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-cream-50/10 hover:text-gold-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {primaryNavEnd.map((link) => (
          <Link key={link.href} href={link.href} className={navLinkClass}>
            {link.label}
          </Link>
        ))}

        <div className="relative" onMouseEnter={() => setOpenMenu("worldwide")}>
          <button type="button" className={navLinkClass}>
            World Wide
          </button>

          <AnimatePresence>
            {openMenu === "worldwide" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full z-10 grid w-72 grid-cols-2 gap-1 rounded-md border border-cream-50/10 bg-forest-950 p-3 shadow-xl"
              >
                {worldwideLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded px-3 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-cream-50/10"
                  >
                    {link.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {openMenu === "country" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-10 w-64 rounded-md border border-ink/10 bg-cream-50 p-2 text-ink shadow-lg"
            style={{ insetInlineEnd: "clamp(1rem, 1rem + 2vw, 3rem)" }}
          >
            {countrySelector.map((c) => (
              <button
                key={c.label}
                type="button"
                className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-cream-200"
              >
                {c.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-cream-50/10 bg-forest-950"
          >
            <div className="container-app flex items-center gap-3 py-5">
              <Search size={18} className="shrink-0 opacity-50" />
              <input
                autoFocus
                type="search"
                placeholder="Search for..."
                className="w-full bg-transparent text-lg outline-none placeholder:text-cream-50/40"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
