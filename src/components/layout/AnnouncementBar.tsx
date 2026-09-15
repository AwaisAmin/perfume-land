"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const messages = ["Free Delivery Over AED 500 in UAE", "Worldwide Shipping"];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Publish this bar's height so the full-screen hero below can subtract it
  // and still fill exactly one viewport together with the header.
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const publishHeight = () => {
      document.documentElement.style.setProperty("--announcement-height", `${el.offsetHeight}px`);
    };
    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const go = (dir: 1 | -1) => {
    setIndex((i) => (i + dir + messages.length) % messages.length);
  };

  return (
    <div
      ref={barRef}
      className="relative flex h-10 items-center justify-center gap-4 bg-cream-50 px-12 text-ink"
    >
      <button
        type="button"
        aria-label="Previous announcement"
        onClick={() => go(-1)}
        className="absolute left-4 flex h-6 w-6 items-center justify-center text-ink/60 transition hover:text-ink"
      >
        <ChevronLeft size={16} />
      </button>

      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="text-xs font-semibold uppercase tracking-[0.12em]"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>

      <button
        type="button"
        aria-label="Next announcement"
        onClick={() => go(1)}
        className="absolute right-4 flex h-6 w-6 items-center justify-center text-ink/60 transition hover:text-ink"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
