"use client";

import { ArrowRight } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { conditions } from "@/brand.config";
import { pickDeal } from "@/lib/deal";
import { money } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";
import { Reveal } from "./Reveal";
import { useSite } from "./SiteContext";

/** Gran banner del "producto estrella" (el primer destacado que no es la oferta). */
export function Spotlight() {
  const { products, settings, openProduct } = useSite();
  const deal = pickDeal(products, settings);
  const star =
    products.find((p) => p.featured && p.category === "celulares" && p.id !== deal?.id) ??
    products.find((p) => p.featured && p.id !== deal?.id);

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const y = useTransform(p, [0, 1], [70, -70]);
  const rotate = useTransform(p, [0, 1], [-6, 6]);

  if (!star) return null;

  return (
    <section ref={ref} className="bg-ink px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center border border-line md:grid-cols-2">
        <div className="relative z-10 p-7 md:p-12 lg:p-16">
          <Reveal>
            <p className="eyebrow">04 — Producto estrella</p>
            <h2 className="title-lux mt-5 text-[clamp(40px,5vw,76px)] !font-medium">{star.name}</h2>
            <p className="mt-2 text-muted">
              {conditions[star.condition].label}
              {star.storage && ` · ${star.storage}`}
            </p>
            {star.description && <p className="mt-6 max-w-md text-lg leading-relaxed text-fg/65">{star.description}</p>}
            {star.specs.length > 0 && (
              <dl className="mt-8 grid max-w-md grid-cols-2 border-t border-line">
                {star.specs.slice(0, 4).map((s, i) => (
                  <div key={s.label} className={"border-b border-line py-3 " + (i % 2 ? "pl-4" : "pr-4")}>
                    <dt className="eyebrow !text-[10px]">{s.label}</dt>
                    <dd className="mt-1 text-[15px]">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-9 flex flex-wrap items-end gap-6">
              <div>
                <p className="font-display text-3xl font-light tracking-tight">{money(star.price)}</p>
                {star.installments && (
                  <p className="text-sm text-muted">
                    o {star.installments.count} cuotas de {money(star.installments.amount)}
                  </p>
                )}
              </div>
              <button onClick={() => openProduct(star)} className="btn-solid">
                Ver detalles <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
        </div>

        <div className="relative grid h-[380px] place-items-center border-t border-line md:h-[580px] md:border-l md:border-t-0">
          {/* retícula fina de fondo */}
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]" />
          <motion.div style={{ y, rotate }} className="relative h-[64%] w-[56%] drop-shadow-[0_40px_40px_rgba(0,0,0,.6)]">
            <ProductVisual product={star} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
