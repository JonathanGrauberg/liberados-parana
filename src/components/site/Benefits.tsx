"use client";

import { ArrowLeftRight, BadgeCheck, CreditCard, ShieldCheck, Wrench } from "lucide-react";
import { motion } from "motion/react";

const items = [
  { icon: BadgeCheck, title: "Equipos originales", sub: "Revisados uno por uno" },
  { icon: ShieldCheck, title: "Garantía escrita", sub: "En cada equipo" },
  { icon: CreditCard, title: "Hasta 12 cuotas", sub: "Con tarjeta de crédito" },
  { icon: ArrowLeftRight, title: "Plan canje", sub: "Tu usado como parte de pago" },
  { icon: Wrench, title: "Te lo configuramos", sub: "Pasamos tus datos y WhatsApp" },
];

/** Franja de "por qué elegirnos". */
export function Benefits() {
  return (
    <section className="bg-ink px-5 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 border-l border-t border-line md:grid-cols-5">
        {items.map(({ icon: Icon, title, sub }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.08 }}
            className="flex flex-col gap-4 border-b border-r border-line p-5 md:p-6 [&:last-child]:col-span-2 md:[&:last-child]:col-span-1"
          >
            <Icon className="h-5 w-5 text-fg/60" strokeWidth={1.2} />
            <span>
              <span className="block text-[15px] font-normal">{title}</span>
              <span className="mt-0.5 block text-xs text-muted">{sub}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
