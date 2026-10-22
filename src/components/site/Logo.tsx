import clsx from "clsx";
import { useId } from "react";

/**
 * Isotipo "LP" recreado en SVG a partir del cartel.
 * Cuando el diseñador pase el logo oficial en SVG, reemplazar el contenido
 * de <LogoMark/> por ese archivo (o un <img src="/brand/logo.svg" />).
 */
export function LogoMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 104" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="8" y1="4" x2="98" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--cyan)">
            {animated && <animate attributeName="stop-color" values="#3ee6e8;#7b7fdc;#3ee6e8" dur="8s" repeatCount="indefinite" />}
          </stop>
          <stop offset="0.55" stopColor="var(--violet)" />
          <stop offset="1" stopColor="var(--pink)">
            {animated && <animate attributeName="stop-color" values="#f06bb5;#3ee6e8;#f06bb5" dur="8s" repeatCount="indefinite" />}
          </stop>
        </linearGradient>
        <linearGradient id={`f${id}`} x1="34" y1="0" x2="50" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1b1a55" stopOpacity="0" />
          <stop offset="1" stopColor="#1b1a55" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* L */}
      <path d="M8 4h22v58h20v22H8z" fill={`url(#g${id})`} />
      {/* pliegue del L debajo de la P */}
      <rect x="30" y="62" width="18" height="22" fill={`url(#f${id})`} />
      {/* P */}
      <path
        fillRule="evenodd"
        d="M48 26h27a23 23 0 0 1 0 46h-5v32H48zM70 44h5a5 5 0 0 1 0 10h-5z"
        fill={`url(#g${id})`}
      />
    </svg>
  );
}

export function Logo({ className, dark = true }: { className?: string; dark?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9" />
      <span className={clsx("font-display leading-none", dark ? "text-fg" : "text-indigo")}>
        <span className="block text-[15px] font-extrabold tracking-tight">LIBERADOS</span>
        <span className="block text-[9.5px] font-semibold tracking-[0.42em] opacity-80">PARANÁ</span>
      </span>
    </span>
  );
}
