import { useId } from "react";

/**
 * A self-contained, illustrated perfume bottle used on product cards —
 * amber liquid, black cap, and a small branded label — standing in for real
 * product photography. Colors are fixed (not currentColor-tinted) so it
 * reads the same on every card regardless of the tile background.
 */
export default function ProductBottle({ className }: { className?: string }) {
  const gradientId = `bottle-liquid-${useId()}`;

  return (
    <svg viewBox="0 0 240 320" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4c463" />
          <stop offset="55%" stopColor="#e2a53a" />
          <stop offset="100%" stopColor="#c9862a" />
        </linearGradient>
      </defs>

      <ellipse cx="120" cy="306" rx="68" ry="8" fill="#000" opacity="0.08" />

      {/* Cap */}
      <rect x="90" y="12" width="60" height="58" rx="10" fill="#141414" />
      <rect x="96" y="18" width="10" height="46" rx="5" fill="#fff" opacity="0.08" />

      {/* Neck */}
      <rect x="106" y="64" width="28" height="24" fill="#141414" opacity="0.85" />

      {/* Body */}
      <rect x="40" y="86" width="160" height="212" rx="18" fill={`url(#${gradientId})`} />
      <rect x="40" y="86" width="160" height="212" rx="18" fill="#fff" opacity="0.04" />

      {/* Glass highlight */}
      <path
        d="M62 100 C58 160, 58 220, 66 288"
        stroke="#fff"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.18"
        fill="none"
      />

      {/* Label */}
      <g className="font-heading" fill="#1c1c1a" textAnchor="middle">
        <circle cx="120" cy="158" r="17" fill="none" stroke="#1c1c1a" strokeWidth="1.4" />
        <path
          d="M114 148v6M111 154h6M114 154h1.5"
          stroke="#1c1c1a"
          strokeWidth="1.2"
          fill="none"
        />
        <text x="120" y="163" fontSize="9" fontWeight="700">
          A
        </text>

        <text x="120" y="198" fontSize="19" fontWeight="800" letterSpacing="1">
          AMANZADA
        </text>
        <text x="120" y="212" fontSize="7.5" letterSpacing="3" className="font-body">
          PERFUMES
        </text>

        <rect x="98" y="222" width="44" height="1" fill="#1c1c1a" opacity="0.5" />

        <text
          x="120"
          y="238"
          fontSize="7"
          letterSpacing="1"
          opacity="0.75"
          className="font-body"
        >
          EAU DE PARFUM
        </text>
        <text
          x="120"
          y="250"
          fontSize="7"
          letterSpacing="1"
          opacity="0.75"
          className="font-body"
        >
          100 ML
        </text>
      </g>
    </svg>
  );
}
