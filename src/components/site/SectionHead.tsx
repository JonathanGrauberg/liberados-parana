import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Encabezado de sección: "02 — Categorías", título liviano con remate y enlace opcional. */
export function SectionHead({ n, label, title, link, aside }: { n: string; label: string; title: ReactNode; link?: { href: string; label: string }; aside?: ReactNode }) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="eyebrow">
          {label}
        </p>
        <h2 className="title-lux mt-3 text-[clamp(34px,5vw,68px)]">{title}</h2>
      </div>
      {link && (
        <a href={link.href} className="link-line">
          {link.label} →
        </a>
      )}
      {aside}
    </Reveal>
  );
}
