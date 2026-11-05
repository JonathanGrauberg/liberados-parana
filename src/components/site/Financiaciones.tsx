"use client";

import { CreditCard, FileText, HandCoins } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { waLink } from "@/lib/format";
import { WhatsAppIcon } from "./icons";
import { useSite } from "./SiteContext";

/**
 * "Nuestras financiaciones", debajo del encabezado.
 * Logos de las tarjetas en /public/pagos (Mastercard se dibuja acá con sus dos círculos).
 */
const Pill = ({ children, label }: { children: ReactNode; label: string }) => (
  <span title={label} className="grid h-10 min-w-[78px] place-items-center rounded-lg bg-white px-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,.6)]">
    {children}
    <span className="sr-only">{label}</span>
  </span>
);

const marks = {
  // eslint-disable-next-line @next/next/no-img-element
  visa: <img src="/pagos/visa.png" alt="" className="h-5 w-auto" />,
  master: (
    <svg viewBox="0 0 40 24" className="h-6 w-10" aria-hidden>
      <circle cx="14" cy="12" r="11" fill="#eb001b" />
      <circle cx="26" cy="12" r="11" fill="#f79e1b" />
      <path d="M20 3.2a11 11 0 0 1 0 17.6 11 11 0 0 1 0-17.6z" fill="#ff5f00" />
    </svg>
  ),
  // eslint-disable-next-line @next/next/no-img-element
  naranja: <img src="/pagos/naranja-x.webp" alt="" className="h-5 w-auto" />,
  // eslint-disable-next-line @next/next/no-img-element
  sidecreer: <img src="/pagos/sidecreer.png" alt="" className="h-6 w-auto" />,
};

const items: { icon: typeof CreditCard; title: string; text: string; marks?: { key: keyof typeof marks; label: string }[]; ask: string }[] = [
  {
    icon: CreditCard,
    title: "Tarjetas de crédito",
    text: "Visa, Mastercard y Naranja X.",
    marks: [
      { key: "visa", label: "Visa" },
      { key: "master", label: "Mastercard" },
      { key: "naranja", label: "Naranja X" },
    ],
    ask: "¡Hola Liberados! Quiero consultar por la financiación con tarjeta de crédito.",
  },
  {
    icon: FileText,
    title: "Créditos personales",
    text: "Con tu recibo de sueldo. Te llevás el equipo y lo pagás en cuotas.",
    ask: "¡Hola Liberados! Quiero consultar por los créditos personales con recibo de sueldo.",
  },
  {
    icon: HandCoins,
    title: "Sidecreer",
    text: "Créditos personales Sidecreer, directo en el local.",
    marks: [{ key: "sidecreer", label: "Sidecreer" }],
    ask: "¡Hola Liberados! Quiero consultar por los créditos personales Sidecreer.",
  },
];

export function Financiaciones() {
  const { settings } = useSite();
  return (
    <section id="financiacion" aria-labelledby="financiacion-title" className="band-navy scroll-mt-24 px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">Financiación</p>
          <h2 id="financiacion-title" className="title-lux mt-3 text-[clamp(34px,5vw,64px)]">
            Nuestras <b>financiaciones.</b>
          </h2>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, title, text, marks: m, ask }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="ring-brand relative flex flex-col overflow-hidden rounded-[28px] bg-ink-2 p-6 md:p-7"
            >
              <div className={i % 2 ? "pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-pink/25 blur-[70px]" : "pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-cyan/20 blur-[70px]"} />
              <span className="bg-brand relative grid h-14 w-14 place-items-center rounded-2xl text-[#07071a]">
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="relative mt-5 font-display text-[26px] font-extrabold leading-tight tracking-tight">{title}</h3>
              <p className="relative mt-2 flex-1 text-[16px] text-fg/80">{text}</p>
              {m && (
                <div className="relative mt-5 flex flex-wrap gap-2">
                  {m.map((x) => (
                    <Pill key={x.key} label={x.label}>{marks[x.key]}</Pill>
                  ))}
                </div>
              )}
              <a
                href={waLink(settings.contact.whatsapp, ask)}
                target="_blank"
                rel="noopener"
                className="relative mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#1fae55] px-5 text-[15px] font-semibold text-white transition hover:brightness-110"
              >
                <WhatsAppIcon className="h-5 w-5" /> Consultar
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
