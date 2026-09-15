"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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

const iconButtonClass = "transition-opacity duration-200 hover:opacity-70";

function NavItem({
  href,
  children,
  active = false,
  onMouseEnter,
}: {
  href?: string;
  children: ReactNode;
  active?: boolean;
  onMouseEnter?: () => void;
}) {
  const className =
    "group relative inline-flex items-center px-3 pt-2 pb-3 text-xs font-semibold uppercase leading-none tracking-widest";
  const underline = (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-3 bottom-0 h-px origin-left bg-cream-50 transition-transform duration-300 ease-out ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  );

  if (href) {
    return (
      <Link href={href} onMouseEnter={onMouseEnter} className={className}>
        {children}
        {underline}
      </Link>
    );
  }

  return (
    <button type="button" onMouseEnter={onMouseEnter} className={className}>
      {children}
      {underline}
    </button>
  );
}

export default function Header() {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [activeGroup, setActiveGroup] = useState(brandImpressionsGroups[0].title);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const closeMenus = () => {
    setOpenMenu(null);
    setHovered(false);
    setActiveGroup(brandImpressionsGroups[0].title);
  };

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
      className={`relative z-40 w-full text-cream-50 transition-colors duration-300 ${
        hovered ? "bg-forest-950" : "bg-transparent"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={closeMenus}
    >
      {/* Row 1: spacer / logo / account icons */}
      <div className="container-app grid grid-cols-3 items-center py-2">
        <div />

        <Link href="/" className="justify-self-center" aria-label="Amanzada home">
          <Logo className="border-cream-50/40" />
        </Link>

        <div className="flex items-end justify-self-end gap-4 sm:gap-5">
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "country" ? null : "country"))}
              className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest ${iconButtonClass}`}
            >
              🇦🇪 AED
              <ChevronDown size={12} />
            </button>
          </div>

          <Link
            href="/account"
            className={`hidden flex-col items-center gap-0.5 text-[10px] font-semibold uppercase tracking-widest md:flex ${iconButtonClass}`}
          >
            <User size={17} />
            <span>Login</span>
          </Link>

          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((s) => !s)}
            className={iconButtonClass}
          >
            <Search size={18} />
          </button>

          <Link href="/cart" aria-label="Cart" className={iconButtonClass}>
            <ShoppingBag size={18} />
          </Link>

          <button
            type="button"
            aria-label="Open menu"
            className={`lg:hidden ${iconButtonClass}`}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Row 2: primary navigation */}
      <div className="container-app hidden items-center justify-center gap-2 lg:flex">
        {primaryNavStart.map((link) => (
          <NavItem key={link.href} href={link.href}>
            {link.label}
          </NavItem>
        ))}

        <div className="relative" onMouseEnter={() => setOpenMenu("brand")}>
          <NavItem href="/collections/standard-collection" active={openMenu === "brand"}>
            Brand Impressions
          </NavItem>

          <AnimatePresence>
            {openMenu === "brand" && (
              <motion.ul
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 top-full z-10 w-56 bg-forest-950 py-3"
              >
                {brandImpressionsGroups.map((group) => (
                  <li
                    key={group.title}
                    className="relative"
                    onMouseEnter={() => setActiveGroup(group.title)}
                  >
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${
                        activeGroup === group.title
                          ? "bg-cream-50/10 text-gold-400"
                          : "hover:bg-cream-50/5"
                      }`}
                    >
                      {group.title}
                      <ChevronRight size={13} />
                    </button>

                    <AnimatePresence>
                      {activeGroup === group.title && (
                        <motion.ul
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-full top-0 w-56 border-l border-cream-50/10 bg-forest-950 py-3"
                        >
                          {group.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="block px-5 py-3 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-cream-50/10 hover:text-gold-400"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {primaryNavEnd.map((link) => (
          <NavItem key={link.href} href={link.href}>
            {link.label}
          </NavItem>
        ))}

        <div className="relative" onMouseEnter={() => setOpenMenu("worldwide")}>
          <NavItem active={openMenu === "worldwide"}>World Wide</NavItem>

          <AnimatePresence>
            {openMenu === "worldwide" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 top-full z-10 flex w-64 flex-col bg-forest-950 py-2"
              >
                {worldwideLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-cream-50/10"
                  >
                    <span className="w-6 text-xs font-semibold text-gold-400">{link.code}</span>
                    <span className="uppercase tracking-wide">{link.label}</span>
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
