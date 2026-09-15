import clsx from "clsx";

export default function Logo({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border sm:h-16 sm:w-16",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="h-9 w-9 sm:h-10 sm:w-10" fill="none">
        <path d="M50 14v10" stroke="currentColor" strokeWidth="1.6" />
        <rect x="42" y="24" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M37 33h26l4 13v28a7 7 0 0 1-7 7H40a7 7 0 0 1-7-7V46l4-13Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M33 50h34" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <text
          x="50"
          y="72"
          textAnchor="middle"
          fontSize="22"
          fontFamily="var(--font-heading)"
          fill="currentColor"
          fontWeight="800"
        >
          A
        </text>
      </svg>
      <span className="absolute right-1.5 top-2 text-[7px]">&reg;</span>
    </span>
  );
}
