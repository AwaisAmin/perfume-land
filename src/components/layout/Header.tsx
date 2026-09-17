"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { preload } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import {
  brandImpressionsGroups,
  countrySelector,
  primaryNavEnd,
  primaryNavStart,
  worldwideLinks,
} from "@/data/nav";
import { collections } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import Flag from "@/components/ui/Flag";
import Logo from "@/components/ui/Logo";
import MobileDrawer from "./MobileDrawer";

type MenuKey = "brand" | "worldwide" | "country" | null;

// Every collection page's hero banner is a large hotlinked image with no
// local caching, so navigating straight to it shows a flash of the hero's
// plain forest-900 fallback background before the real photo loads. Kicking
// off the fetch as soon as the user hovers the nav link (well before the
// click/route-change) gives it a head start so it's usually already in the
// browser cache by the time the new page mounts.
function preloadCollectionHeroes() {
  for (const collection of collections) {
    if (collection.heroImage) {
      preload(collection.heroImage, { as: "image" });
    }
  }
}

const iconButtonClass = "cursor-pointer transition-opacity duration-200 hover:opacity-70";

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
      className={`pointer-events-none absolute inset-x-3 -bottom-2 h-0.5 origin-left bg-cream-50 transition-transform duration-300 ease-out ${
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
    <button type="button" onMouseEnter={onMouseEnter} className={`cursor-pointer ${className}`}>
      {children}
      {underline}
    </button>
  );
}

export default function Header() {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { itemCount, openCart } = useCart();
  // Only pages with a dark hero banner directly beneath the header (the
  // homepage, and every collection page's CollectionHero) can have it
  // overlay transparently — every other page needs the solid background
  // by default, or the cream text/logo is invisible against the plain
  // page background.
  const pathname = usePathname();
  const hasHeroBanner = pathname === "/" || pathname.startsWith("/collections/");

  const closeMenus = () => {
    setOpenMenu(null);
    setHovered(false);
    setActiveGroup(null);
  };

  // Header persists across client-side navigations (it lives in the root
  // layout), so this runs once per visit, well before any collection page
  // is actually reached — covering every entry point (menu clicks, "View
  // all" buttons, back/forward, a pasted link), not just menu hovers.
  useEffect(() => {
    preloadCollectionHeroes();
  }, []);

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
        hovered || !hasHeroBanner ? "bg-forest-900" : "bg-transparent"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={closeMenus}
    >
      {/* Row 1: spacer / logo / account icons */}
      <div className="container-app grid grid-cols-3 items-center py-5">
        <div />

        <Link
          href="/"
          onMouseEnter={() => setOpenMenu(null)}
          className="justify-self-center"
          aria-label="Amanzada home"
        >
          <Logo className="border-cream-50/40" />
        </Link>

        <div className="flex items-center justify-self-end gap-5 sm:gap-6">
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "country" ? null : "country"))}
              className={`flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest ${iconButtonClass}`}
            >
              <Flag code="ae" className="h-4 w-5.5 shrink-0 rounded-[1px]" />
              AED
              <span className="text-xs opacity-60">د.إ</span>
              <ChevronDown size={13} />
            </button>

            <AnimatePresence>
              {openMenu === "country" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full z-10 mt-2 max-h-80 w-64 overflow-y-auto rounded-md border border-cream-50/10 bg-forest-900 p-2 shadow-lg"
                >
                  {countrySelector.map((c) => (
                    <button
                      key={c.code}
                      type="button"
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

          <Link
            href="/account"
            onMouseEnter={() => setOpenMenu(null)}
            className={`hidden flex-col items-center gap-0.5 text-xs font-semibold uppercase tracking-widest md:flex ${iconButtonClass}`}
          >
            <User size={19} />
            <span>Login</span>
          </Link>

          <button
            type="button"
            aria-label="Search"
            onMouseEnter={() => setOpenMenu(null)}
            onClick={() => setSearchOpen((s) => !s)}
            className={iconButtonClass}
          >
            <Search size={20} />
          </button>

          <button
            type="button"
            aria-label="Cart"
            onMouseEnter={() => setOpenMenu(null)}
            onClick={openCart}
            className={`relative ${iconButtonClass}`}
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-forest-900 px-1 text-[10px] leading-none text-cream-50">
                {itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label="Open menu"
            onMouseEnter={() => setOpenMenu(null)}
            className={`lg:hidden ${iconButtonClass}`}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Row 2: primary navigation */}
      <div className="container-app hidden items-center justify-center gap-8 pb-2 lg:flex">
        {primaryNavStart.map((link) => (
          <NavItem
            key={link.href}
            href={link.href}
            onMouseEnter={() => {
              setOpenMenu(null);
              if (link.href === "/collections/signature-collection") preloadCollectionHeroes();
            }}
          >
            {link.label}
          </NavItem>
        ))}

        <div
          className="relative"
          onMouseEnter={() => {
            setOpenMenu("brand");
            preloadCollectionHeroes();
          }}
        >
          <NavItem href="/collections/standard-collection" active={openMenu === "brand"}>
            Brand Impressions
          </NavItem>

          {/* When the mega-menu is open, the indicator widens to match the
              first flyout column below it, instead of just the label width. */}
          {openMenu === "brand" && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 -bottom-2 h-0.5 w-56 bg-cream-50"
            />
          )}

          <AnimatePresence>
            {openMenu === "brand" && (
              <motion.ul
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-3 top-full z-10 mt-2 w-56 bg-forest-900 py-3"
              >
                {brandImpressionsGroups.map((group) => (
                  <li
                    key={group.title}
                    className="relative"
                    onMouseEnter={() => setActiveGroup(group.title)}
                  >
                    {/* The group heading is itself a link on the live site —
                        clicking "Perfumes" (not just its Standard/Premium/
                        Exclusive sub-items) navigates to that group's
                        Standard tier collection, confirmed by clicking it
                        directly on the reference site. */}
                    <Link
                      href={group.links[0].href}
                      className={`flex w-full items-center justify-between px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest transition-colors ${
                        activeGroup === group.title ? "text-cream-50/50" : "text-cream-50 hover:text-cream-50/50"
                      }`}
                    >
                      {group.title}
                      <ChevronRight size={13} />
                    </Link>

                    <AnimatePresence>
                      {activeGroup === group.title && (
                        <motion.ul
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-full top-0 w-56 border-l border-cream-50/10 bg-forest-900 py-3"
                        >
                          {group.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="block px-5 py-3 text-xs font-semibold uppercase tracking-widest text-cream-50 transition-colors hover:text-cream-50/50"
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
          <NavItem key={link.href} href={link.href} onMouseEnter={() => setOpenMenu(null)}>
            {link.label}
          </NavItem>
        ))}

        <div className="relative" onMouseEnter={() => setOpenMenu("worldwide")}>
          <NavItem href="/pages/world-wide" active={openMenu === "worldwide"}>
            World Wide
          </NavItem>

          {openMenu === "worldwide" && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 -bottom-2 h-0.5 w-64 bg-cream-50"
            />
          )}

          <AnimatePresence>
            {openMenu === "worldwide" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-3 top-full z-10 mt-2 flex w-64 flex-col bg-forest-900 py-2"
              >
                {worldwideLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-baseline gap-1.5 px-5 py-2.5 text-sm text-cream-50 transition-colors hover:text-cream-50/50"
                  >
                    <span className="text-[10px] font-semibold">{link.code}</span>
                    <span className="uppercase tracking-wide">{link.label}</span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-cream-50/10 bg-forest-900"
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
