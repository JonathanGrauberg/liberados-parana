"use client";

import { ArrowLeftRight, BadgeCheck, CreditCard, Sparkles, Wrench } from "lucide-react";

const items = [
  { icon: BadgeCheck, title: "Equipos originales", sub: "Revisados uno por uno" },
  { icon: CreditCard, title: "Hasta 12 cuotas", sub: "Con tarjeta de crédito" },
  { icon: ArrowLeftRight, title: "Plan canje", sub: "Tu usado como parte de pago" },
  { icon: Wrench, title: "Te lo configuramos", sub: "Pasamos tus datos y WhatsApp" },
];

/** "Por qué elegirnos" como cinta que corre de lado a lado (se frena al pasar el mouse). */
export function Benefits() {
  // se repite la lista para que la cinta nunca quede con huecos, y todo dos veces para el loop infinito
  const run = [...items, ...items, ...items, ...items];
  return (
    <section aria-label="Por qué elegirnos" className="bg-brand group relative overflow-hidden py-4 text-[#07071a] shadow-[0_20px_60px_-20px_rgba(123,127,220,.6)] md:py-5">
      <ul className="sr-only">
        {items.map((it) => (
          <li key={it.title}>{it.title}: {it.sub}</li>
        ))}
      </ul>
      <div aria-hidden className="marquee flex w-max" style={{ ["--dur" as string]: "80s" }}>
        {[...run, ...run].map(({ icon: Icon, title, sub }, i) => (
          <div key={i} className="flex shrink-0 items-center gap-3 pr-10 md:pr-14">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#07071a]/10">
              <Icon className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[16px] font-extrabold md:text-[17px]">{title}</span>
              <span className="block text-[13px] font-medium opacity-75">{sub}</span>
            </span>
            <Sparkles className="ml-10 h-4 w-4 shrink-0 opacity-50 md:ml-14" />
          </div>
        ))}
      </div>
    </section>
  );
}
