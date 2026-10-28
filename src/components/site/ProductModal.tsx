"use client";

import clsx from "clsx";
import { ArrowLeftRight, Check, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { conditions } from "@/brand.config";
import { discount } from "@/lib/deal";
import { waLink } from "@/lib/format";
import type { PublicProduct, Spec } from "@/lib/types";
import { Badge } from "./Catalog";
import { WhatsAppIcon } from "./icons";
import { ProductVisual } from "./ProductVisual";
import { Price, priceText } from "./Price";
import { useSite } from "./SiteContext";

const ease = [0.22, 1, 0.36, 1] as const;
// alturas de los carteles a cada lado del equipo
const ROWS = ["18%", "50%", "82%"];

/** Características que se muestran con flechas alrededor del equipo (se cargan en el panel). */
function calloutsFor(p: PublicProduct): Spec[] {
  const list: Spec[] = [];
  if (p.battery) list.push({ label: "Batería", value: `${p.battery} %` });
  list.push(...p.specs);
  if (list.length < 2 && p.storage) list.push({ label: "Capacidad", value: p.storage });
  if (list.length < 2 && p.colorName) list.push({ label: "Color", value: p.colorName });
  return list.slice(0, 6);
}

export function ProductModal() {
  const { open: p, openProduct, settings, startTradeIn } = useSite();
  const [img, setImg] = useState(0);

  useEffect(() => {
    setImg(0);
    if (!p) return;
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && openProduct(null);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [p, openProduct]);

  const msg = p
    ? `¡Hola Liberados! Me interesa el ${p.name}${p.storage ? ` ${p.storage}` : ""}${p.colorName ? ` (${p.colorName})` : ""} que vi en la web${p.priceOnRequest ? "" : ` a ${priceText(p)}`}. ¿${p.priceOnRequest ? "Me pasás precio y disponibilidad" : "Está disponible"}?`
    : "";
  const callouts = p ? calloutsFor(p) : [];
  const off = p ? discount(p) : 0;

  return (
    <AnimatePresence>
      {p && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-sm md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => openProduct(null)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={p.name}
            data-lenis-prevent
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[94dvh] w-full max-w-6xl overflow-y-auto border border-line bg-ink"
          >
            <div className="sticky top-0 z-30 h-0">
              <button
                onClick={() => openProduct(null)}
                className="absolute right-4 top-4 grid h-11 w-11 place-items-center border border-line bg-ink/70 backdrop-blur transition duration-300 hover:border-fg hover:bg-fg hover:text-ink"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Escenario: equipo al centro y características con flechas */}
            <div
              className="relative overflow-hidden border-b border-line bg-ink-2 px-4 pb-6 pt-14 md:px-8 md:pt-10"
            >
              <div className="relative mx-auto h-[300px] max-w-5xl md:h-[440px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={img}
                    className="absolute inset-y-0 left-1/2 w-[62%] -translate-x-1/2 md:w-[34%]"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <ProductVisual product={p} index={img} />
                  </motion.div>
                </AnimatePresence>

                {/* carteles con flecha (PC) */}
                <div className="hidden md:block">
                  {callouts.map((c, i) => (
                    <Callout key={c.label + i} spec={c} side={i % 2 === 0 ? "left" : "right"} top={ROWS[Math.floor(i / 2)]} delay={0.35 + i * 0.12} />
                  ))}
                </div>
              </div>

              {p.images.length > 1 && (
                <div className="relative mt-4 flex justify-center gap-2">
                  {p.images.map((src, i) => (
                    <button
                      key={src}
                      onClick={() => setImg(i)}
                      className={clsx("h-14 w-14 overflow-hidden border p-1 transition", i === img ? "border-line-strong" : "border-line opacity-50 hover:opacity-100")}
                      aria-label={`Foto ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* características en celular */}
              {callouts.length > 0 && (
                <ul className="relative mt-5 grid grid-cols-2 gap-2 md:hidden">
                  {callouts.map((c, i) => (
                    <motion.li
                      key={c.label + i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.07 }}
                      className="border border-line px-3.5 py-2.5"
                    >
                      <p className="eyebrow !text-[10px]">{c.label}</p>
                      <p className="mt-1 text-[15px] leading-tight">{c.value}</p>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Info y compra */}
            <div className="grid gap-8 p-6 md:grid-cols-[1.3fr_1fr] md:p-10">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={conditions[p.condition].tone}>{conditions[p.condition].label}</Badge>
                  {p.priceOnRequest ? <Badge tone="cyan">Consultá disponibilidad</Badge> : p.stock <= 0 ? <Badge tone="gray">Sin stock — consultá</Badge> : p.condition === "usado" ? <Badge tone="cyan">Unidad única</Badge> : p.stock <= 2 ? <Badge tone="amber">Últimas unidades</Badge> : <Badge tone="cyan">En stock</Badge>}
                </div>
                <p className="mt-5 text-muted">{p.brand}</p>
                <h3 className="title-lux text-4xl !font-medium md:text-5xl">{p.name}</h3>
                <p className="mt-2 text-lg text-muted">{[p.storage, p.colorName].filter(Boolean).join(" · ")}</p>
                {p.description && <p className="mt-5 max-w-xl text-lg leading-relaxed text-fg/70">{p.description}</p>}
                <ul className="mt-6 space-y-2 text-[15px] text-muted">
                  <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-fg/60" strokeWidth={1.5} /> Liberado para cualquier compañía</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-fg/60" strokeWidth={1.5} /> Lo probás en el local antes de llevarlo</li>
                </ul>
              </div>

              <div className="border border-line p-6">
                {off > 0 && <p className="text-gradient font-display mb-1 w-fit text-xs font-medium tracking-[0.1em]">−{off}%</p>}
                <Price p={p} size="lg" />
                <div className="mt-6 grid gap-3">
                  <a
                    href={waLink(settings.contact.whatsapp, msg)}
                    target="_blank"
                    rel="noopener"
                    className="btn-solid w-full !min-h-[54px]"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Consultar por WhatsApp
                  </a>
                  {p.category === "celulares" && (
                    <button
                      onClick={() => startTradeIn(p.id)}
                      className="btn-outline w-full !min-h-[54px]"
                    >
                      <ArrowLeftRight className="h-4 w-4" /> Entregar mi iPhone
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Cartel con línea y flecha que apunta al equipo. */
function Callout({ spec, side, top, delay }: { spec: Spec; side: "left" | "right"; top: string; delay: number }) {
  const left = side === "left";
  return (
    <div
      className={clsx("absolute flex w-[33%] -translate-y-1/2 items-center", left ? "left-0 flex-row" : "right-0 flex-row-reverse")}
      style={{ top }}
    >
      <motion.div
        initial={{ opacity: 0, x: left ? -16 : 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.6, ease }}
        className={clsx("shrink-0 border border-line bg-ink/70 px-4 py-2.5 backdrop-blur", left ? "text-right" : "text-left")}
      >
        <p className="eyebrow !text-[10px]">{spec.label}</p>
        <p className="mt-1 text-[15px] leading-tight">{spec.value}</p>
      </motion.div>
      {/* línea que crece hacia el equipo */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.25, duration: 0.7, ease }}
        className={clsx("relative h-px flex-1", left ? "origin-left bg-gradient-to-r" : "origin-right bg-gradient-to-l", "from-fg/5 to-fg/50")}
      >
        <span className={clsx("absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand", left ? "-right-0.5" : "-left-0.5")} />
        <span className={clsx("absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-accent/50", left ? "-right-2" : "-left-2")} />
      </motion.div>
    </div>
  );
}
