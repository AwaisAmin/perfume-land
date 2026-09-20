"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { preload } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import {
  brandImpressionsGroups,
  primaryNavEnd,
  primaryNavStart,
} from "@/data/nav";
import { collections } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/currency";
import { searchProducts } from "@/lib/search";
import ProductImage from "@/components/ui/ProductImage";
import Flag from "@/components/ui/Flag";
import Logo from "@/components/ui/Logo";
import MobileDrawer from "./MobileDrawer";

type MenuKey = "brand" | null;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [hovered, setHovered] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { itemCount, openCart } = useCart();
  // Only pages with a dark hero banner directly beneath the header (the
  // homepage, and every collection page's CollectionHero) can have it
  // overlay transparently — every other page needs the solid background
  // by default, or the cream text/logo is invisible against the plain
  // page background.
  const pathname = usePathname();
  const router = useRouter();

  // The header lives in the root layout, so it survives client-side
  // navigation — without this the search panel would stay open (with its
  // stale query) on top of the page the searcher just opened. Adjusting
  // during render rather than in an effect avoids rendering the stale
  // panel for a frame first.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setSearchOpen(false);
    setSearchQuery("");
  }
  const hasHeroBanner = pathname === "/" || pathname.startsWith("/collections/");

  const closeMenus = () => {
    setOpenMenu(null);
    setHovered(false);
    setActiveGroup(null);
  };

  // Capped so the dropdown stays a preview — the full list lives on
  // /search, which the form's submit (and "View all results") navigates to.
  const searchResults = searchQuery.trim() === "" ? [] : searchProducts(searchQuery, 6);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const submitSearch = () => {
    const query = searchQuery.trim();
    if (query === "") return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    closeSearch();
  };

  // Preloading every collection hero cost a few hundred KB on pages that
  // never show one, so it now waits until the visitor actually opens the
  // collections menu — still ahead of the click, but paid for only by
  // people heading that way.
  useEffect(() => {
    if (openMenu === "brand") preloadCollectionHeroes();
  }, [openMenu]);

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
          aria-label="Haris Bhai Perfumes home"
        >
          <Logo />
        </Link>

        <div className="flex items-center justify-self-end gap-5 sm:gap-6">
          {/* The shop delivers within Pakistan only, so this is a plain
              currency/market label rather than a picker. */}
          <div className="hidden items-center gap-1.5 text-sm font-semibold uppercase tracking-widest sm:flex">
            <Flag code="pk" className="h-4 w-5.5 shrink-0 rounded-[1px]" />
            PKR
            <span className="text-xs opacity-60">Rs</span>
          </div>

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
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-cream-50/10 bg-forest-900"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="container-app flex items-center gap-3 py-5"
            >
              <Search size={18} className="shrink-0 opacity-50" />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                }}
                placeholder="Search for..."
                aria-label="Search products"
                className="w-full bg-transparent text-lg outline-none placeholder:text-cream-50/40"
              />
              <button type="button" onClick={closeSearch} aria-label="Close search">
                <X size={18} />
              </button>
            </form>

            {/* Live results, matched in the browser against the static
                product data — no backend, so there is nothing to debounce
                and no loading state to show. */}
            {searchQuery.trim() !== "" && (
              <div className="container-app pb-5">
                {searchResults.length === 0 ? (
                  <p className="py-4 text-sm text-cream-100/60">
                    No products match &ldquo;{searchQuery.trim()}&rdquo;.
                  </p>
                ) : (
                  <>
                    <ul className="flex flex-col">
                      {searchResults.map(({ product, collection }) => (
                        <li key={product.id}>
                          <Link
                            href={`/products/${product.handle}`}
                            onClick={closeSearch}
                            className="flex items-center gap-4 border-t border-cream-50/10 py-3 transition-colors hover:bg-cream-50/5"
                          >
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-cream-50/5">
                              <ProductImage
                                product={product}
                                imageClassName="object-contain p-1.5"
                                bottleClassName="h-full w-full p-2"
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm text-cream-50">{product.title}</span>
                              <span className="block text-xs uppercase tracking-widest text-cream-100/50">
                                {collection.title}
                              </span>
                            </span>
                            <span className="shrink-0 text-sm text-gold-400">
                              {formatPrice(product.price)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={submitSearch}
                      className="mt-4 w-full cursor-pointer border-t border-cream-50/10 pt-4 text-sm font-semibold uppercase tracking-widest text-cream-50 hover:text-cream-50/70"
                    >
                      View all results
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}
