"use client";

import { CreditCard } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Flyer de financiación entre el encabezado y el catálogo.
 * Las marcas son versiones simples dibujadas acá; si el local consigue los logos oficiales,
 * se pueden reemplazar por <img src="/pagos/visa.svg" /> etc.
 */
const cards: { name: string; mark: ReactNode }[] = [
  { name: "Visa", mark: <span className="font-display text-[22px] font-black italic tracking-tight text-[#1a1f71]">VISA</span> },
  {
    name: "Mastercard",
    mark: (
      <svg viewBox="0 0 40 24" className="h-6 w-10" aria-hidden>
        <circle cx="14" cy="12" r="11" fill="#eb001b" />
        <circle cx="26" cy="12" r="11" fill="#f79e1b" />
        <path d="M20 3.2a11 11 0 0 1 0 17.6 11 11 0 0 1 0-17.6z" fill="#ff5f00" />
      </svg>
    ),
  },
  { name: "Cabal", mark: <span className="font-display text-[19px] font-extrabold lowercase tracking-tight text-[#0067b1]">cabal</span> },
  { name: "Sidecreer", mark: <span className="font-display text-[17px] font-extrabold tracking-tight text-[#1d1a55]">Sidecreer</span> },
];

export function CuotasBanner() {
  return (
    <section aria-label="Financiación" className="px-5 pt-10 md:px-8 md:pt-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="ring-brand relative mx-auto flex max-w-7xl flex-col items-start gap-6 overflow-hidden rounded-[28px] bg-ink-2 p-6 md:flex-row md:items-center md:justify-between md:p-8"
      >
        <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-cyan/25 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-pink/30 blur-[80px]" />

        <div className="relative flex items-center gap-4">
          <span className="bg-brand grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-[#07071a]">
            <CreditCard className="h-7 w-7" />
          </span>
          <p className="font-display text-[clamp(26px,3.4vw,44px)] font-extrabold leading-[1.02] tracking-tight">
            Hasta <span className="text-gradient">12 cuotas</span>
            <span className="block text-[0.55em] font-bold text-fg/80">con tus tarjetas de crédito</span>
          </p>
        </div>

        <ul className="relative flex flex-wrap gap-2.5">
          {cards.map((c) => (
            <li key={c.name} title={c.name} className="grid h-12 min-w-[92px] place-items-center rounded-xl bg-white px-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,.6)]">
              {c.mark}
              <span className="sr-only">{c.name}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
