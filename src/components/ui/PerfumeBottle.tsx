type PerfumeBottleProps = {
  className?: string;
};

export default function PerfumeBottle({ className }: PerfumeBottleProps) {
  return (
    <svg
      viewBox="0 0 120 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="50" y="8" width="20" height="14" rx="2" className="fill-current opacity-80" />
      <rect x="54" y="2" width="12" height="8" rx="1.5" className="fill-current opacity-90" />
      <path
        d="M40 30h40l6 20v128a10 10 0 0 1-10 10H44a10 10 0 0 1-10-10V50l6-20Z"
        className="fill-current opacity-15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M34 70h52" stroke="currentColor" strokeWidth="1" className="opacity-40" />
      <rect x="38" y="90" width="44" height="46" rx="2" className="fill-current opacity-10" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
