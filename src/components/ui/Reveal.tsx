"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
};

const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  { children, delay = 0, y = 24, ...rest },
  ref,
) {
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
