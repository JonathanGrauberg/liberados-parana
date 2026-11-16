"use client";

import clsx from "clsx";
import { ArrowLeftRight, BatteryFull, ChevronDown, Search, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { discount } from "@/lib/deal";
import { sortPrice, waLink } from "@/lib/format";
import type { PublicProduct } from "@/lib/types";
import { WhatsAppIcon } from "./icons";
import { Price, priceText } from "./Price";
import { PhotoSlider, Tilt } from "./ProductVisual";
import { SectionHead } from "./SectionHead";
import { useSite } from "./SiteContext";

type Cond = "todos" | "usados" | "nuevos";
type Sort = "destacados" | "menor" | "mayor";

/** Cuántos equipos se ven por grupo antes de "Ver todos". */
const PREVIEW = 4;

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
  // en la vista agrupada se muestran 4 por grupo y un "Ver todos"
  const [more, setMore] = useState<Record<string, boolean>>({});
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
    <section id="catalogo" className="relative scroll-mt-4 overflow-clip px-5 pb-24 pt-16 md:px-8 md:pb-28 md:pt-24">
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
          aside={
            <label className="ring-spin block w-full md:mb-2 md:w-[420px]">
              <span className="relative block">
              <span className="sr-only">Buscar</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fg/80" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscá “13 Pro”, “256”, “Black”…"
                className="h-14 w-full rounded-[14px] bg-[#161447] pl-12 pr-12 text-[17px] text-fg outline-none transition placeholder:text-fg/70 focus:bg-[#1c1955]"
              />
              {q && (
                <button onClick={() => setQ("")} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-fg/10 text-fg">
                  <X className="h-4 w-4" />
                </button>
              )}
              </span>
            </label>
          }
        />

        {/* Filtros: se pegan debajo del navbar (el buscador va al lado del título) */}
        <div className="sticky-under-nav z-30 mt-8 overflow-hidden rounded-[26px] bg-[#151247]/90 p-2 backdrop-blur-xl md:p-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,.6)] ring-1 ring-line">
          {/* en celular: los 3 filtros entran enteros (sin scroll al costado) y el orden va abajo */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <LayoutGroup id="cond">
              <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 md:flex md:gap-2">
                {(
                  [
                    ["todos", "Todos", "Todos"],
                    ["usados", "Usados", "Usados seleccionados"],
                    ["nuevos", "Nuevos", "Nuevos en caja"],
                  ] as [Cond, string, string][]
                ).map(([v, short, label]) => (
                  <Tab key={v} active={cond === v} onClick={() => setCond(v)}>
                    <span className="md:hidden">{short}</span>
                    <span className="max-md:hidden">{label}</span>{" "}
                    <span className={cond === v ? "opacity-60" : "text-muted"}>{counts[v]}</span>
                  </Tab>
                ))}
              </div>
            </LayoutGroup>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-11 w-full shrink-0 rounded-full bg-fg/[.06] px-4 text-[15px] font-medium text-fg outline-none ring-1 ring-line md:w-fit [&>option]:text-text-dark"
              aria-label="Ordenar"
            >
              <option value="destacados">Ordenar: destacados</option>
              <option value="menor">Ordenar: menor precio</option>
              <option value="mayor">Ordenar: mayor precio</option>
            </select>
          </div>
        </div>

        {grouped ? (
          GROUPS.map((g) => {
            const items = list.filter((p) => (g.id === "usados" ? isUsed(p) : !isUsed(p)));
            if (!items.length) return null;
            const open = more[g.id];
            return (
              <div key={g.id} id={`grupo-${g.id}`} className="mt-12 scroll-mt-40 first:mt-10">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                  <h3 className="title-lux text-2xl md:text-3xl">{g.title}</h3>
                  <p className="text-sm text-muted">{g.sub}</p>
                </div>
                <Grid items={open ? items : items.slice(0, PREVIEW)} onOpen={openProduct} />
                {items.length > PREVIEW && (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMore((m) => ({ ...m, [g.id]: !open }));
                        if (open) document.getElementById(`grupo-${g.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="ring-brand flex h-12 items-center gap-2 rounded-full px-7 text-[16px] font-semibold text-fg transition hover:bg-fg/[.06]"
                    >
                      {open ? "Ver menos" : `Ver todos los ${g.id === "usados" ? "usados" : "nuevos"} (${items.length})`}
                      <ChevronDown className={clsx("h-5 w-5 transition-transform", open && "rotate-180")} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="mt-8">
            <Grid items={list} onOpen={openProduct} />
          </div>
        )}

        {/* sin resultados: en vez de "no está", lo mandamos a WhatsApp (muchos equipos están en el local y no en la web) */}
        {!list.length && (
          <div className="mt-8 rounded-[28px] bg-ink-2 px-6 py-14 text-center ring-1 ring-line md:py-16">
            <p className="title-lux text-[28px] md:text-4xl">
              Este equipo <b>consultalo por WhatsApp.</b>
            </p>
            <p className="mx-auto mt-3 max-w-md text-[17px] text-fg/75">
              Puede que lo tengamos en el local. Y si querés enterarte antes que nadie, agendanos para ver las ofertas.
            </p>
            <a
              href={waLink(settings.contact.whatsapp, q.trim() ? `¡Hola Liberados! Estoy buscando un ${q.trim()}. ¿Lo tienen?` : "¡Hola Liberados! Estoy buscando un iPhone. ¿Qué tienen disponible?")}
              target="_blank"
              rel="noopener"
              className="mx-auto mt-7 flex min-h-14 w-fit items-center justify-center gap-2.5 rounded-2xl bg-[#1fae55] px-7 text-[17px] font-semibold text-white transition hover:brightness-110 active:scale-[.98]"
            >
              <WhatsAppIcon className="h-6 w-6" /> Consultar por WhatsApp
            </a>
          </div>
        )}

        {/* leyenda chica al pie del catálogo */}
        {list.length > 0 && (
          <p className="mt-10 text-center text-[14px] text-muted">
            ¿No encontraste el celular que buscabas?{" "}
            <a
              href={waLink(settings.contact.whatsapp, "¡Hola Liberados! No encontré en la web el celular que busco. ¿Me ayudan?")}
              target="_blank"
              rel="noopener"
              className="font-semibold text-fg/90 underline decoration-cyan/60 underline-offset-4 hover:text-fg"
            >
              Consultanos por WhatsApp
            </a>
            , muchos equipos los tenemos en el local.
          </p>
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
      {/* fotos: se deslizan para los costados; un toque abre la ficha */}
      <Tilt className="relative aspect-square w-full overflow-hidden rounded-[18px]" max={4}>
        {/* degradé con el color del equipo */}
        <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(155deg, color-mix(in oklab, ${p.color} 38%, var(--ink-3)) 0%, var(--ink-2) 80%)` }} />
        <PhotoSlider product={p} onOpen={onOpen} dim={out} />
        {out && (
          <div className="pointer-events-none absolute left-2.5 top-2.5">
            <Badge tone="gray">Sin stock</Badge>
          </div>
        )}
        {off > 0 && <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-full bg-pink px-2.5 py-1 text-[13px] font-extrabold text-ink">−{off}%</span>}
      </Tilt>
      {/* datos: abren la ficha */}
      <button onClick={onOpen} className="flex flex-1 flex-col text-left" aria-label={`Ver detalles del ${p.name} ${p.storage ?? ""}`}>
        <div className="flex flex-1 flex-col px-2.5 pb-1 pt-3">
          <h3 className="font-display text-[22px] font-bold leading-tight tracking-tight">
            {p.name} <span className="font-medium text-muted">{p.storage}</span>
          </h3>
          <div className="mt-1.5 flex min-h-7 flex-wrap items-center gap-x-2.5 gap-y-1">
            {p.colorName && <span className="text-[17px] font-semibold text-fg/90">{p.colorName}</span>}
            {/* batería bien visible: es lo primero que mira el que compra un usado */}
            {p.battery ? (
              <span
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[15px] font-bold ring-1",
                  p.battery >= 85 ? "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30" : "bg-amber-400/15 text-amber-200 ring-amber-400/30",
                )}
              >
                <BatteryFull className="h-4 w-4" strokeWidth={2.2} /> Batería {p.battery}%
              </span>
            ) : null}
          </div>
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
        "relative flex h-11 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-1.5 text-[14px] font-semibold transition min-[380px]:text-[15px] md:gap-1.5 md:px-5",
        active ? "text-ink" : "bg-fg/[.06] text-fg/80 ring-1 ring-line hover:bg-fg/[.1]",
      )}
    >
      {active && <motion.span layoutId="cond-tab" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
      <span className="relative">{children}</span>
    </button>
  );
}
