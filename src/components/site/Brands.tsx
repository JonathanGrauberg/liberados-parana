"use client";

import { useSite } from "./SiteContext";

const BASE = ["Apple", "Samsung", "Motorola", "Xiaomi", "JBL", "Sony"];

/** Franja de marcas en movimiento continuo. Toca una marca y busca en el catálogo. */
export function Brands() {
  const { products, search } = useSite();
  const brands = Array.from(new Set([...BASE, ...products.map((p) => p.brand)])).filter((b) => b && b !== "Liberados");
  const row = [...brands, ...brands];

  return (
    <section aria-label="Marcas" className="relative mt-24 overflow-hidden border-y border-line bg-ink py-8 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-14 hover:[animation-play-state:paused] md:gap-20">
        {row.map((b, i) => (
          <button
            key={i}
            onClick={() => search(b)}
            aria-hidden={i >= brands.length}
            tabIndex={i >= brands.length ? -1 : 0}
            className="font-display shrink-0 text-sm uppercase tracking-[0.4em] text-fg/35 transition-colors duration-500 hover:text-fg md:text-base"
          >
            {b}
          </button>
        ))}
      </div>
    </section>
  );
}
