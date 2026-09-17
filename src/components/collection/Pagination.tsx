"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const ELLIPSIS = "…";

/**
 * Builds the truncated page-number list the live site uses: always the
 * first and last page, the current page and its immediate neighbors, and
 * an ellipsis filling any gap — matching its behavior of showing extra
 * numbers on whichever side is short on siblings (e.g. page 1 of 9 shows
 * "1 2 3 … 9", not just "1 2 … 9").
 */
function buildPageList(page: number, totalPages: number): (number | typeof ELLIPSIS)[] {
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 2);

  const pages: (number | typeof ELLIPSIS)[] = [1];
  if (start > 2) pages.push(ELLIPSIS);
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push(ELLIPSIS);
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

/**
 * Page-number navigation for the product grid — a controlled component
 * (the parent owns `page` state), so swapping the static in-memory slice
 * for a real paginated API later only changes how the parent computes
 * `totalPages`, not this component.
 */
export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav
      aria-label="Pagination navigation"
      className="mt-16 flex items-center justify-center gap-6 text-xs text-ink"
    >
      <button
        type="button"
        aria-label="Go to previous page"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="flex cursor-pointer items-center disabled:invisible"
      >
        <ChevronLeft size={11} strokeWidth={1.5} />
      </button>

      {pages.map((p, i) =>
        p === ELLIPSIS ? (
          <span key={`ellipsis-${i}`} aria-hidden="true" className="text-ink/40">
            {ELLIPSIS}
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-label={`Go to page ${p}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPageChange(p)}
            className={`cursor-pointer pb-0.5 transition-colors ${
              p === page ? "border-b-2 border-ink text-ink" : "text-ink/60 hover:text-ink"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Go to next page"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex cursor-pointer items-center disabled:invisible"
      >
        <ChevronRight size={11} strokeWidth={1.5} />
      </button>
    </nav>
  );
}
