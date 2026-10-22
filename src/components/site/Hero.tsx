"use client";

import clsx from "clsx";
import { ArrowRight, Search } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { conditions } from "@/brand.config";
import { money } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";
import { useSite } from "./SiteContext";

const ease = [0.16, 1, 0.3, 1] as const;
const SLIDE_MS = 6000;

const trust = [
  { title: "Equipos originales", sub: "Revisados uno por uno" },
  { title: "Garantía escrita", sub: "En cada equipo" },
  { title: "Plan canje", sub: "Tu usado vale" },
];

export function Hero() {
  const { products, openProduct, search } = useSite();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [q, setQ] = useState("");

  // Los destacados con stock se turnan sobre el pedestal
  const slides = (() => {
    const f = products.filter((p) => p.featured && p.stock > 0);
    return (f.length ? f : products.filter((p) => p.stock > 0)).slice(0, 5);
  })();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const cur = slides[i % Math.max(1, slides.length)];

  useEffect(() => {
    if (paused || reduce || slides.length < 2) return;
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, paused, reduce, slides.length]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // parallax solo en la foto de fondo; el contenido queda quieto
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);

  return (
    <section id="inicio" ref={ref} className="relative overflow-hidden border-b border-line bg-ink pb-12 pt-24 md:pt-28 lg:min-h-[88dvh]">
      {/* foto del cartel, apenas insinuada */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src="/local-cartel.jpg"
        alt=""
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 h-full w-full object-cover object-[50%_40%] opacity-[.1] grayscale"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,14,.6),var(--ink)_70%)]" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[1fr_1.05fr]">
        {/* Texto */}
        <div className="min-w-0">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="eyebrow">
            01 — Celulares y tecnología · Paraná
          </motion.p>
          <h1 className="title-lux mt-6 text-[clamp(44px,6.6vw,96px)] leading-[0.98]">
            {[
              { w: "Tecnología", b: false },
              { w: "liberada.", b: true },
            ].map(({ w, b }, n) => (
              <span key={w} className="block overflow-hidden pb-1">
                <motion.span
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, delay: 0.15 + n * 0.12, ease }}
                  className={clsx("block", b && "font-medium")}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45, ease }}
            className="mt-6 max-w-md text-lg leading-relaxed text-fg/65"
          >
            Nuevos, sellados y usados premium. Accesorios y plan canje en el centro de Paraná.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-9 grid max-w-lg grid-cols-3 border-y border-line"
          >
            {trust.map(({ title, sub }, n) => (
              <li key={title} className={clsx("py-4 pr-3", n > 0 && "border-l border-line pl-4")}>
                <span className="block text-[14px] font-normal">{title}</span>
                <span className="block text-xs text-muted">{sub}</span>
              </li>
            ))}
          </motion.ul>

          {/* buscador visible en celular (en PC está en el navbar) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search(q);
            }}
            className="mt-7 flex items-center border border-line lg:hidden"
          >
            <Search className="ml-3.5 h-4 w-4 shrink-0 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="¿Qué estás buscando?"
              aria-label="Buscar en el catálogo"
              className="h-12 min-w-0 flex-1 bg-transparent px-3 text-[16px] text-fg outline-none placeholder:text-muted"
            />
            <button className="btn-solid shrink-0">Buscar</button>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.75, ease }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a href="#catalogo" className="btn-solid">
              Ver catálogo <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#canje" className="btn-outline">
              Cotizar mi usado
            </a>
          </motion.div>
        </div>

        {/* Escenario con pedestal */}
        {cur && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.2 }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="relative mx-auto aspect-[1/0.92] w-full max-w-[540px]"
          >
            <Pedestal />

            <AnimatePresence mode="wait">
              <motion.button
                key={cur.id}
                onClick={() => openProduct(cur)}
                aria-label={`Ver ${cur.name}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.9, ease }}
                className="absolute inset-x-[20%] bottom-[27%] top-[4%]"
              >
                <motion.div
                  animate={reduce ? undefined : { y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full w-full drop-shadow-[0_40px_40px_rgba(0,0,0,.65)]"
                >
                  <ProductVisual product={cur} />
                </motion.div>
              </motion.button>
            </AnimatePresence>

            {/* ficha del producto */}
            <AnimatePresence mode="wait">
              <motion.button
                key={cur.id + "-tag"}
                onClick={() => openProduct(cur)}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease }}
                className="absolute right-0 top-[10%] border-l border-accent bg-ink/70 py-2 pl-4 pr-5 text-left backdrop-blur md:right-[-2%]"
              >
                <span className="eyebrow block !text-[10px]">{conditions[cur.condition].label}</span>
                <span className="title-lux mt-1 block text-lg !font-medium">{cur.name}</span>
                <span className="block text-sm text-muted">{money(cur.price)}</span>
              </motion.button>
            </AnimatePresence>

            {slides.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4">
                <span className="font-display text-[11px] tabular-nums tracking-[0.2em] text-muted">
                  <span className="text-fg">{String((i % slides.length) + 1).padStart(2, "0")}</span> — {String(slides.length).padStart(2, "0")}
                </span>
                <div className="flex gap-1.5">
                  {slides.map((s, n) => {
                    const active = n === i % slides.length;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setI(n)}
                        aria-label={`Ver ${s.name}`}
                        aria-current={active}
                        className={clsx(
                          "relative h-11 w-11 overflow-hidden border transition duration-500",
                          active ? "border-line-strong bg-white/[.04]" : "border-line opacity-45 hover:opacity-90",
                        )}
                      >
                        <span className="absolute inset-1.5 block">
                          <ProductVisual product={s} />
                        </span>
                        {active && (
                          <motion.span
                            key={i + (paused ? "p" : "")}
                            className="absolute bottom-0 left-0 h-px bg-accent"
                            initial={{ width: paused ? "100%" : "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: paused || reduce ? 0 : SLIDE_MS / 1000, ease: "linear" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/** Pedestal cilíndrico (SVG), neutro, con luz cenital suave. */
function Pedestal() {
  const id = useId().replace(/:/g, "");
  return (
    <div className="absolute inset-x-[10%] bottom-[11%]">
      {/* luz cenital */}
      <div
        className="absolute bottom-[55%] left-1/2 h-[260%] w-[60%] -translate-x-1/2 opacity-[.07]"
        style={{ background: "linear-gradient(to top, #fff, transparent 85%)", clipPath: "polygon(22% 100%, 78% 100%, 100% 0, 0 0)", filter: "blur(16px)" }}
      />
      <div className="absolute -bottom-[30%] left-1/2 h-[60%] w-[110%] -translate-x-1/2 rounded-[50%] bg-black/80 blur-2xl" />
      <svg viewBox="0 0 400 112" className="relative block w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`side${id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#0c0c0f" />
            <stop offset=".45" stopColor="#24242a" />
            <stop offset="1" stopColor="#0c0c0f" />
          </linearGradient>
          <radialGradient id={`top${id}`} cx=".5" cy=".3" r=".75">
            <stop offset="0" stopColor="#2a2a31" />
            <stop offset="1" stopColor="#141418" />
          </radialGradient>
        </defs>
        {/* lateral: el borde de abajo es media elipse, sin esquinas */}
        <path d="M2 40 V72 A198 38 0 0 0 398 72 V40 Z" fill={`url(#side${id})`} />
        <ellipse cx="200" cy="40" rx="198" ry="38" fill={`url(#top${id})`} />
        <ellipse cx="200" cy="40" rx="198" ry="38" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="1" />
        <ellipse cx="200" cy="40" rx="140" ry="25" fill="none" stroke="#fff" strokeOpacity=".06" />
      </svg>
    </div>
  );
}
