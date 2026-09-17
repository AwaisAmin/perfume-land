"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, User, X } from "lucide-react";
import { useState } from "react";
import {
  brandImpressionsGroups,
  primaryNavEnd,
  primaryNavStart,
  worldwideLinks,
} from "@/data/nav";
import Logo from "@/components/ui/Logo";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Closes the drawer and opens the header's Login popover — the live
   *  site drops the desktop header's Login button below `md`, moving it
   *  into this drawer's own footer instead. */
  onLoginClick: () => void;
};

export default function MobileDrawer({ open, onClose, onLoginClick }: MobileDrawerProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-sm flex-col overflow-y-auto bg-forest-900 text-cream-50"
          >
            <div className="flex h-20 items-center justify-between border-b border-cream-50/10 px-6">
              <Logo className="border-cream-50/40" />
              <button type="button" aria-label="Close menu" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col px-6 py-4">
              {primaryNavStart.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="border-b border-cream-50/10 py-4 text-sm font-semibold uppercase tracking-widest"
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-b border-cream-50/10">
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroup((g) => (g === "brand" ? null : "brand"))
                  }
                  className="flex w-full items-center justify-between py-4 text-sm font-semibold uppercase tracking-widest"
                >
                  Brand Impressions
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openGroup === "brand" ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openGroup === "brand" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-5 pb-5 pl-3">
                        {brandImpressionsGroups.map((group) => (
                          <div key={group.title}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold-400">
                              {group.title}
                            </p>
                            <ul className="flex flex-col gap-2.5">
                              {group.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    onClick={onClose}
                                    className="text-sm text-cream-100/70"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {primaryNavEnd.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="border-b border-cream-50/10 py-4 text-sm font-semibold uppercase tracking-widest"
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-b border-cream-50/10">
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroup((g) => (g === "worldwide" ? null : "worldwide"))
                  }
                  className="flex w-full items-center justify-between py-4 text-sm font-semibold uppercase tracking-widest"
                >
                  World Wide
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openGroup === "worldwide" ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openGroup === "worldwide" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="flex flex-col gap-3 pb-4 pl-3">
                        {worldwideLinks.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className="text-sm text-cream-100/70"
                            >
                              <span className="mr-1.5 text-[10px] font-semibold">{link.code}</span>
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <button
              type="button"
              onClick={onLoginClick}
              className="mt-auto flex cursor-pointer items-center gap-2.5 border-t border-cream-50/10 px-6 py-5 text-sm font-semibold uppercase tracking-widest"
            >
              <User size={18} />
              Login
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
