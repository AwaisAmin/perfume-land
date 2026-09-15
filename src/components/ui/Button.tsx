import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "light";
  className?: string;
};

export default function Button({ href, children, variant = "solid", className }: ButtonProps) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-sm px-8 py-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-300",
        variant === "solid" &&
          "bg-forest-900/90 text-gold-400 backdrop-blur-sm hover:bg-forest-950",
        variant === "outline" &&
          "border border-current text-ink hover:bg-ink hover:text-cream-50",
        variant === "light" &&
          "bg-cream-50 text-forest-900 hover:bg-gold-100",
        className,
      )}
    >
      {children}
    </Link>
  );
}
