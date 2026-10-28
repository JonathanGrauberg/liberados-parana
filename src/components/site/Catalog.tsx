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
import { ProductVisual, Tilt } from "./ProductVisual";
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
    <section id="catalogo" className="relative scroll-mt-4 overflow-hidden px-5 pb-24 pt-16 md:px-8 md:pb-28 md:pt-24">
      <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-cyan/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full bg-pink/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl">
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
        <div className="sticky-under-nav glass z-30 -mx-5 mt-8 px-5 pb-3 pt-3 md:-mx-8 md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <label className="relative block md:w-80">
              <span className="sr-only">Buscar</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscá “13 Pro”, “256”, “Black”…"
                className="h-12 w-full rounded-2xl bg-fg/[.06] pl-12 pr-12 text-[16px] text-fg outline-none ring-1 ring-line transition placeholder:text-muted focus:ring-2 focus:ring-cyan/60"
              />
              {q && (
                <button onClick={() => setQ("")} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-fg/10 text-fg">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <LayoutGroup id="cond">
              <div className="no-scrollbar -mx-5 flex min-w-0 flex-1 gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
                {(
                  [
                    ["todos", "Todos"],
                    ["usados", "Usados seleccionados"],
                    ["nuevos", "Nuevos en caja"],
                  ] as [Cond, string][]
                ).map(([v, label]) => (
                  <Tab key={v} active={cond === v} onClick={() => setCond(v)}>
                    {label} <span className={cond === v ? "opacity-60" : "text-muted"}>{counts[v]}</span>
                  </Tab>
                ))}
              </div>
            </LayoutGroup>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-11 w-fit rounded-full bg-fg/[.06] px-4 text-[15px] font-medium text-fg outline-none ring-1 ring-line [&>option]:text-text-dark"
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
                  <h3 className="title-lux text-2xl md:text-3xl">{g.title}</h3>
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
          <div className="mt-8 rounded-[28px] bg-ink-2 py-20 text-center ring-1 ring-line">
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
    <motion.div layout className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {items.map((p) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
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
    <article className="group relative flex h-full flex-col rounded-[24px] bg-ink-2 p-2 ring-1 ring-line transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-24px_rgba(0,0,0,.7)] hover:ring-fg/20">
      {/* foto y datos: abren la ficha */}
      <button onClick={onOpen} className="flex flex-1 flex-col text-left" aria-label={`Ver detalles del ${p.name} ${p.storage ?? ""}`}>
        <Tilt className="relative aspect-[4/3.4] w-full overflow-hidden rounded-[18px]" max={7}>
          {/* degradé con el color del equipo */}
          <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(155deg, color-mix(in oklab, ${p.color} 38%, var(--ink-3)) 0%, var(--ink-2) 80%)` }} />
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100"
            style={{ background: `radial-gradient(55% 50% at 50% 55%, ${p.color}66, transparent 70%)` }}
          />
          <div className="absolute inset-[13%] transition duration-700 group-hover:scale-[1.07]">
            <ProductVisual product={p} className={clsx(out && "opacity-40 grayscale", p.images[1] && "transition-opacity duration-500 group-hover:opacity-0")} />
            {p.images[1] && (
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <ProductVisual product={p} index={1} />
              </div>
            )}
          </div>
          <div className="absolute left-2.5 top-2.5 flex max-w-[75%] flex-wrap gap-1">
            <Badge tone={conditions[p.condition].tone}>{conditions[p.condition].label}</Badge>
            {out && <Badge tone="gray">Sin stock</Badge>}
          </div>
          {off > 0 && <span className="absolute right-2.5 top-2.5 rounded-full bg-pink px-2.5 py-1 text-[13px] font-extrabold text-ink">−{off}%</span>}
        </Tilt>
        <div className="flex flex-1 flex-col px-2.5 pb-1 pt-3">
          <h3 className="font-display text-[22px] font-bold leading-tight tracking-tight">
            {p.name} <span className="font-medium text-muted">{p.storage}</span>
          </h3>
          <p className="mt-1 text-[15px] text-muted">{[p.colorName, p.battery ? `Batería ${p.battery}%` : null].filter(Boolean).join(" · ") || " "}</p>
          <div className="mt-auto pt-3">
            <Price p={p} />
          </div>
        </div>
      </button>

      {/* acciones siempre visibles */}
      <div className="mt-3 grid gap-2 px-0.5 pb-0.5">
        <a
          href={waLink(settings.contact.whatsapp, msg)}
          target="_blank"
          rel="noopener"
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1fae55] text-[16px] font-semibold text-white transition hover:brightness-110"
        >
          <WhatsAppIcon className="h-5 w-5" /> Consultar por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => startTradeIn(p.id)}
          className="ring-brand flex min-h-11 items-center justify-center gap-2 rounded-full text-[16px] font-semibold text-fg transition hover:bg-fg/[.06]"
        >
          <ArrowLeftRight className="h-4 w-4" /> Entregar mi iPhone
        </button>
      </div>
    </article>
  );
}

/** Etiqueta de color (estado, stock). */
export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    cyan: "bg-[#d5fafa] text-[#067073]",
    pink: "bg-[#fde0ef] text-[#a3246c]",
    violet: "bg-[#e3e4fa] text-[#3b3fa8]",
    amber: "bg-amber-200 text-amber-900",
    gray: "bg-white/85 text-black/60",
  };
  return <span className={clsx("rounded-full px-3 py-1 text-[13px] font-bold", tones[tone] ?? tones.gray)}>{children}</span>;
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative flex h-11 shrink-0 items-center gap-1.5 rounded-full px-5 text-[15px] font-semibold transition",
        active ? "text-ink" : "bg-fg/[.06] text-fg/80 ring-1 ring-line hover:bg-fg/[.1]",
      )}
    >
      {active && <motion.span layoutId="cond-tab" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
      <span className="relative">{children}</span>
    </button>
  );
}
