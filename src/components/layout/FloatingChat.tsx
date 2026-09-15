"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[300px] overflow-hidden rounded-lg border border-ink/10 bg-cream-50 shadow-xl"
          >
            <div className="flex items-center justify-between bg-forest-900 px-4 py-3 text-cream-50">
              <p className="text-sm font-semibold">Amanzada Assistant</p>
              <button type="button" aria-label="Close chat" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-3 p-4 text-sm text-ink/70">
              <p>Hi! Ask us about scents, sizes, or delivery — we&apos;re happy to help.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label="Open chat"
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-900 text-gold-400 shadow-lg transition hover:bg-forest-950"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
