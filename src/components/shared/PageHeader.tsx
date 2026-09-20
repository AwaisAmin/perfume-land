import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

type PageHeaderProps = {
  children: ReactNode;
  className?: string;
};

/**
 * The bordered, centered heading band used at the top of secondary pages
 * (e.g. World Wide) — page-agnostic, so any page can drop it in via a
 * plain import.
 */
export default function PageHeader({ children, className = "" }: PageHeaderProps) {
  return (
    <div className="border-y border-cream-50/10 bg-forest-900 py-16">
      <Reveal immediate className={`container-app text-center ${className}`}>{children}</Reveal>
    </div>
  );
}
