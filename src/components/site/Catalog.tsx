"use client";

import clsx from "clsx";
import { Search, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { categories, conditions, type CategoryId } from "@/brand.config";
import { discount } from "@/lib/deal";
import { money } from "@/lib/format";
import type { PublicProduct } from "@/lib/types";
import { ProductVisual } from "./ProductVisual";
import { SectionHead } from "./SectionHead";
import { useSite } from "./SiteContext";

type Cond = "todos" | "nuevos" | "usados";
type Sort = "destacados" | "menor" | "mayor";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Catalog() {
  const { products, category, setCategory, openProduct, query: q, setQuery: setQ } = useSite();
  const [cond, setCond] = useState<Cond>("todos");
  const [sort, setSort] = useState<Sort>("destacados");

  const list = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    const out = products.filter((p) => {
      if (category !== "todos" && p.category !== category) return false;
      if (cond === "nuevos" && !(p.condition === "nuevo" || p.condition === "sellado")) return false;
      if (cond === "usados" && !(p.condition === "usado" || p.condition === "reacondicionado")) return false;
      if (!terms.length) return true;
      const hay = norm([p.name, p.brand, p.storage, p.colorName, p.description, categories.find((c) => c.id === p.category)?.label].join(" "));
      return terms.every((t) => hay.includes(t));
    });
    if (sort === "menor") out.sort((a, b) => a.price - b.price);
    else if (sort === "mayor") out.sort((a, b) => b.price - a.price);
    else out.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.stock > 0) - Number(a.stock > 0));
    return out;
  }, [products, category, cond, q, sort]);

  const usedCats = categories.filter((c) => products.some((p) => p.category === c.id));

  return (
    <section id="catalogo" className="relative scroll-mt-4 bg-ink px-5 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          n="03"
          label="Catálogo"
          title={
            <>
              Encontrá <b>el tuyo.</b>
            </>
          }
          aside={<p className="text-sm text-muted">{products.length} productos · actualizado por el local</p>}
        />

        {/* Buscador y filtros: se pegan debajo del navbar */}
        <div className="sticky-under-nav z-30 -mx-5 mt-10 border-b border-line bg-ink/90 px-5 pt-3 backdrop-blur-md md:-mx-8 md:px-8">
          <label className="relative block">
            <span className="sr-only">Buscar</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscá “iPhone 13”, “funda”, “Samsung”…"
              className="h-12 w-full border border-line bg-transparent pl-11 pr-12 text-[16px] text-fg outline-none transition placeholder:text-muted focus:border-line-strong"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Borrar búsqueda" className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-muted hover:text-fg">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <div className="mt-1 flex min-w-0 items-center justify-between gap-6">
            <LayoutGroup id="cats">
              <div className="no-scrollbar -mx-5 flex min-w-0 gap-7 overflow-x-auto px-5 md:mx-0 md:px-0">
                <Tab active={category === "todos"} onClick={() => setCategory("todos")}>
                  Todo
                </Tab>
                {usedCats.map((c) => (
                  <Tab key={c.id} active={category === c.id} onClick={() => setCategory(c.id as CategoryId)}>
                    {c.label}
                  </Tab>
                ))}
              </div>
            </LayoutGroup>
            <div className="hidden shrink-0 items-center gap-6 xl:flex">{filters()}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 xl:hidden">{filters()}</div>

        <motion.div layout className="mt-8 grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="border-b border-r border-line bg-ink"
              >
                <ProductCard product={p} onOpen={() => openProduct(p)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {!list.length && (
          <div className="border border-t-0 border-line py-20 text-center">
            <p className="title-lux text-2xl">No encontramos eso todavía.</p>
            <p className="mt-2 text-muted">Escribinos y te lo conseguimos.</p>
          </div>
        )}
      </div>
    </section>
  );

  function filters() {
    return (
      <>
        <div className="flex gap-5">
          {(
            [
              ["todos", "Todos"],
              ["nuevos", "Nuevos"],
              ["usados", "Usados"],
            ] as [Cond, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setCond(v)}
              className={clsx("font-display text-[11px] uppercase tracking-[0.2em] transition-colors", cond === v ? "text-fg" : "text-muted hover:text-fg")}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="font-display h-9 border border-line bg-transparent px-3 text-[11px] uppercase tracking-[0.18em] text-fg/80 outline-none [&>option]:text-text-dark"
          aria-label="Ordenar"
        >
          <option value="destacados">Destacados</option>
          <option value="menor">Menor precio</option>
          <option value="mayor">Mayor precio</option>
        </select>
      </>
    );
  }
}

function ProductCard({ product: p, onOpen }: { product: PublicProduct; onOpen: () => void }) {
  const out = p.stock <= 0;
  const off = discount(p);
  return (
    <button onClick={onOpen} className="group relative flex h-full w-full flex-col text-left transition-colors duration-500 hover:bg-ink-2">
      <div className="relative aspect-square w-full overflow-hidden">
        <div className="absolute inset-[18%] transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]">
          <ProductVisual product={p} className={clsx(out && "opacity-35 grayscale", p.images[1] && "transition-opacity duration-700 group-hover:opacity-0")} />
          {p.images[1] && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
              <ProductVisual product={p} index={1} />
            </div>
          )}
        </div>
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="eyebrow !text-[9.5px] !tracking-[0.22em]">{conditions[p.condition].label}</span>
          {off > 0 && <span className="font-display text-[11px] tracking-[0.1em] text-accent">−{off}%</span>}
        </div>
        {(out || p.stock <= 2) && (
          <span className={clsx("eyebrow absolute bottom-3 left-3 !text-[9.5px]", !out && "!text-accent")}>{out ? "Sin stock" : "Últimas unidades"}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col border-t border-line px-3 pb-4 pt-3 md:px-4">
        <p className="text-xs text-muted">{p.brand}</p>
        <h3 className="mt-0.5 text-[15px] font-normal leading-snug">{p.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted">{[p.storage, p.colorName, p.battery ? `Batería ${p.battery}%` : null].filter(Boolean).join(" · ")}</p>
        <div className="mt-auto pt-3">
          {p.comparePrice && p.comparePrice > p.price && <p className="text-xs text-muted line-through">{money(p.comparePrice)}</p>}
          <p className="font-display text-[17px] font-normal tracking-tight">{money(p.price)}</p>
          {p.installments && (
            <p className="text-xs text-muted">
              {p.installments.count} cuotas de {money(p.installments.amount)}
            </p>
          )}
        </div>
      </div>
      <span className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-700 group-hover:w-full" />
    </button>
  );
}

/** Etiqueta chica y recta (estado, stock). */
export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={clsx("border px-2 py-1 font-display text-[10px] uppercase tracking-[0.2em]", tone === "amber" ? "border-accent/50 text-accent" : "border-line-strong text-fg/75")}>
      {children}
    </span>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative shrink-0 py-3.5 font-display text-[11px] uppercase tracking-[0.2em] transition-colors",
        active ? "text-fg" : "text-muted hover:text-fg",
      )}
    >
      {children}
      {active && <motion.span layoutId="tab" className="absolute inset-x-0 bottom-0 h-px bg-accent" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />}
    </button>
  );
}
