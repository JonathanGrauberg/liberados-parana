"use client";

import clsx from "clsx";
import { ArrowLeftRight, Search, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { conditions } from "@/brand.config";
import { discount } from "@/lib/deal";
import { sortPrice, waLink } from "@/lib/format";
import type { PublicProduct } from "@/lib/types";
import { WhatsAppIcon } from "./icons";
import { Price, priceText } from "./Price";
import { ProductVisual } from "./ProductVisual";
import { SectionHead } from "./SectionHead";
import { useSite } from "./SiteContext";

type Cond = "todos" | "usados" | "nuevos";
type Sort = "destacados" | "menor" | "mayor";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const isUsed = (p: PublicProduct) => p.condition === "usado" || p.condition === "reacondicionado";

const GROUPS: { id: Exclude<Cond, "todos">; title: string; sub: string }[] = [
  { id: "usados", title: "Usados seleccionados", sub: "Revisados uno por uno, con batería informada y garantía." },
  { id: "nuevos", title: "Nuevos en caja", sub: "Sellados, con garantía de 1 año. Consultá precio y colores." },
];

/** Catálogo de iPhone: usados seleccionados y nuevos en caja. */
export function Catalog() {
  const { products, settings, openProduct, query: q, setQuery: setQ } = useSite();
  const [cond, setCond] = useState<Cond>("todos");
  const [sort, setSort] = useState<Sort>("destacados");
  const phones = useMemo(() => products.filter((p) => p.category === "celulares"), [products]);

  const list = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    const out = phones.filter((p) => {
      if (cond === "usados" && !isUsed(p)) return false;
      if (cond === "nuevos" && isUsed(p)) return false;
      if (!terms.length) return true;
      const hay = norm([p.name, p.brand, p.storage, p.colorName, p.description].join(" "));
      return terms.every((t) => hay.includes(t));
    });
    const sp = (x: PublicProduct) => sortPrice(x, settings.usdRate);
    if (sort === "menor") out.sort((a, b) => sp(a) - sp(b));
    else if (sort === "mayor") out.sort((a, b) => (sp(b) === Infinity ? -1 : sp(a) === Infinity ? 1 : sp(b) - sp(a)));
    else out.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.stock > 0 || !!b.priceOnRequest) - Number(a.stock > 0 || !!a.priceOnRequest));
    return out;
  }, [phones, cond, q, sort, settings.usdRate]);

  // Con "Todos" y sin búsqueda, se muestra agrupado: usados arriba, nuevos abajo
  const grouped = cond === "todos" && !q.trim();
  const counts = { todos: phones.length, usados: phones.filter(isUsed).length, nuevos: phones.filter((p) => !isUsed(p)).length };

  return (
    <section id="catalogo" className="relative scroll-mt-4 bg-ink px-5 pb-24 pt-16 md:px-8 md:pb-28 md:pt-24">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          n="01"
          label="Equipos disponibles"
          title={
            <>
              Elegí tu <b>iPhone.</b>
            </>
          }
          aside={<p className="text-sm text-muted">Stock actualizado por el local</p>}
        />

        {/* Buscador y filtros: se pegan debajo del navbar */}
        <div className="sticky-under-nav z-30 -mx-5 mt-8 border-b border-line bg-ink/90 px-5 pt-3 backdrop-blur-md md:-mx-8 md:px-8">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-6">
            <label className="relative block md:w-80">
              <span className="sr-only">Buscar</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscá “13 Pro”, “256”, “Black”…"
                className="h-12 w-full border border-line bg-transparent pl-11 pr-12 text-[16px] text-fg outline-none transition placeholder:text-muted focus:border-line-strong"
              />
              {q && (
                <button onClick={() => setQ("")} aria-label="Borrar búsqueda" className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-muted hover:text-fg">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <LayoutGroup id="cond">
              <div className="no-scrollbar -mx-5 flex min-w-0 flex-1 gap-7 overflow-x-auto px-5 md:mx-0 md:px-0">
                {(
                  [
                    ["todos", "Todos"],
                    ["usados", "Usados seleccionados"],
                    ["nuevos", "Nuevos en caja"],
                  ] as [Cond, string][]
                ).map(([v, label]) => (
                  <Tab key={v} active={cond === v} onClick={() => setCond(v)}>
                    {label} <span className="text-muted">{counts[v]}</span>
                  </Tab>
                ))}
              </div>
            </LayoutGroup>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="font-display mb-3 h-9 w-fit border border-line bg-transparent px-3 text-[11px] uppercase tracking-[0.18em] text-fg/80 outline-none md:mb-0 [&>option]:text-text-dark"
              aria-label="Ordenar"
            >
              <option value="destacados">Destacados</option>
              <option value="menor">Menor precio</option>
              <option value="mayor">Mayor precio</option>
            </select>
          </div>
        </div>

        {grouped ? (
          GROUPS.map((g) => {
            const items = list.filter((p) => (g.id === "usados" ? isUsed(p) : !isUsed(p)));
            if (!items.length) return null;
            return (
              <div key={g.id} className="mt-12 first:mt-10">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                  <h3 className="title-lux text-2xl md:text-3xl">
                    <span className="font-medium">{g.title}</span>
                  </h3>
                  <p className="text-sm text-muted">{g.sub}</p>
                </div>
                <Grid items={items} onOpen={openProduct} />
              </div>
            );
          })
        ) : (
          <div className="mt-8">
            <Grid items={list} onOpen={openProduct} />
          </div>
        )}

        {!list.length && (
          <div className="mt-8 border border-line py-20 text-center">
            <p className="title-lux text-2xl">No encontramos ese equipo todavía.</p>
            <p className="mt-2 text-muted">Escribinos y te lo conseguimos.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Grid({ items, onOpen }: { items: PublicProduct[]; onOpen: (p: PublicProduct) => void }) {
  return (
    <motion.div layout className="grid grid-cols-1 border-l border-t border-line min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {items.map((p) => (
          <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="border-b border-r border-line bg-ink">
            <ProductCard product={p} onOpen={() => onOpen(p)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function ProductCard({ product: p, onOpen }: { product: PublicProduct; onOpen: () => void }) {
  const { settings, startTradeIn } = useSite();
  const out = p.stock <= 0 && !p.priceOnRequest;
  const off = discount(p);
  const msg = `¡Hola Liberados! Me interesa el ${p.name}${p.storage ? ` ${p.storage}` : ""}${p.colorName ? ` ${p.colorName}` : ""}${
    p.priceOnRequest ? "" : ` (${priceText(p)})`
  }. ¿${p.priceOnRequest ? "Me pasás precio y disponibilidad" : "Está disponible"}?`;

  return (
    <article className="group relative flex h-full flex-col transition-colors duration-500 hover:bg-ink-2">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-700 group-hover:scale-x-100" />
      {/* foto y datos: abren la ficha */}
      <button onClick={onOpen} className="flex flex-1 flex-col text-left" aria-label={`Ver detalles del ${p.name} ${p.storage ?? ""}`}>
        <div className="relative aspect-[4/3.4] w-full overflow-hidden">
          <div className="absolute inset-[14%] transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]">
            <ProductVisual product={p} className={clsx(out && "opacity-35 grayscale", p.images[1] && "transition-opacity duration-700 group-hover:opacity-0")} />
            {p.images[1] && (
              <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                <ProductVisual product={p} index={1} />
              </div>
            )}
          </div>
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <span className="eyebrow !text-[9.5px] !tracking-[0.22em]">{conditions[p.condition].label}</span>
            {off > 0 && <span className="text-gradient font-display text-[11px] font-medium tracking-[0.1em]">−{off}%</span>}
          </div>
          {out && <span className="eyebrow absolute bottom-3 left-3 !text-[9.5px]">Sin stock · consultá</span>}
        </div>
        <div className="flex flex-1 flex-col border-t border-line px-4 pb-4 pt-3">
          <h3 className="text-[17px] font-normal leading-snug">
            {p.name} <span className="text-muted">{p.storage}</span>
          </h3>
          <p className="mt-0.5 text-xs text-muted">{[p.colorName, p.battery ? `Batería ${p.battery}%` : null].filter(Boolean).join(" · ") || " "}</p>
          <div className="mt-auto pt-3">
            <Price p={p} />
          </div>
        </div>
      </button>

      {/* acciones siempre visibles */}
      <div className="grid border-t border-line">
        <a
          href={waLink(settings.contact.whatsapp, msg)}
          target="_blank"
          rel="noopener"
          className="font-display flex min-h-12 items-center justify-center gap-2 text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-fg hover:text-ink"
        >
          <WhatsAppIcon className="h-4 w-4" /> Consultar por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => startTradeIn(p.id)}
          className="font-display flex min-h-12 items-center justify-center gap-2 border-t border-line text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-fg hover:text-ink"
        >
          <ArrowLeftRight className="h-4 w-4" /> Entregar mi iPhone
        </button>
      </div>
    </article>
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
      className={clsx("relative shrink-0 py-3.5 font-display text-[11px] uppercase tracking-[0.2em] transition-colors", active ? "text-fg" : "text-muted hover:text-fg")}
    >
      {children}
      {active && <motion.span layoutId="cond-tab" className="absolute inset-x-0 bottom-0 h-[2px] bg-brand" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />}
    </button>
  );
}
