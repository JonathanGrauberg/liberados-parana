"use client";

import { ArrowLeftRight, BadgeCheck, CreditCard, Wrench } from "lucide-react";
import { motion } from "motion/react";

const items = [
  { icon: BadgeCheck, title: "Equipos originales", sub: "Revisados uno por uno" },
  { icon: CreditCard, title: "Hasta 12 cuotas", sub: "Con tarjeta de crédito" },
  { icon: ArrowLeftRight, title: "Plan canje", sub: "Tu usado como parte de pago" },
  { icon: Wrench, title: "Te lo configuramos", sub: "Pasamos tus datos y WhatsApp" },
];

/** Franja de "por qué elegirnos". */
export function Benefits() {
  return (
    <section className="px-5 pb-6 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-[24px] bg-line ring-1 ring-line md:grid-cols-4">
        {items.map(({ icon: Icon, title, sub }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.06 }}
            className="flex items-center gap-3 bg-ink-2 p-4 md:p-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,rgba(62,230,232,.18),rgba(240,107,181,.18))] text-accent ring-1 ring-line">
              <Icon className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-[14px] font-semibold">{title}</span>
              <span className="block text-xs text-muted">{sub}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
