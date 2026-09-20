"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  /**
   * Render visible from the very first frame, with no reveal animation.
   *
   * The animated version server-renders at `opacity: 0` and only fades in
   * once framer-motion has hydrated, which is fine for sections the visitor
   * scrolls to but ruinous above the fold: it holds back the largest paint
   * until the JavaScript has loaded. Use this for anything in the first
   * screenful.
   */
  immediate?: boolean;
};

const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  { children, delay = 0, y = 24, immediate = false, ...rest },
  ref,
) {
  if (immediate) {
    return (
      <motion.div ref={ref} {...rest}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

export default Reveal;
