"use client";

import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { dealEnd, discount, pickDeal } from "@/lib/deal";
import { money } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";
import { useSite } from "./SiteContext";

/** Oferta de la semana + accesos rápidos, en una grilla de líneas finas. */
export function Deals() {
  const { products, settings, showCategory } = useSite();
  const deal = pickDeal(products, settings);
  const accessories = products.filter((p) => p.category === "accesorios");
  const cheapestAcc = accessories.length ? Math.min(...accessories.map((p) => p.price)) : 0;

  return (
    <section className="relative z-10 bg-ink px-5 pb-4 pt-16 md:px-8 md:pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(200px,auto))]">
        {deal && (
          <Cell className="col-span-2 lg:row-span-2">
            <WeeklyDeal />
          </Cell>
        )}

        <Cell className="col-span-2" href="#canje">
          <div className="flex h-full flex-col justify-between gap-8 p-6 md:p-8">
            <Label n="b">Plan Canje</Label>
            <div>
              <p className="title-lux text-[clamp(26px,2.8vw,38px)]">
                Tu usado vale. <b>Cotizalo en un minuto.</b>
              </p>
              <p className="mt-2 text-fg/55">Lo tomamos como parte de pago de tu próximo equipo.</p>
            </div>
          </div>
        </Cell>

        <Cell onClick={() => showCategory("accesorios")}>
          <div className="flex h-full flex-col justify-between gap-8 p-5 md:p-7">
            <Label n="c">Accesorios</Label>
            <div>
              {cheapestAcc > 0 && <p className="text-sm text-muted">desde</p>}
              <p className="title-lux text-2xl !font-medium md:text-3xl">{cheapestAcc ? money(cheapestAcc) : "Ver todo"}</p>
              <p className="mt-1 text-sm text-muted">Fundas, vidrios, cargadores</p>
            </div>
          </div>
        </Cell>

        <Cell onClick={() => showCategory("celulares")}>
          <div className="flex h-full flex-col justify-between gap-8 p-5 md:p-7">
            <Label n="d">Financiación</Label>
            <div>
              <p className="title-lux text-2xl md:text-3xl">
                Hasta <b>12 cuotas</b>
              </p>
              <p className="mt-1 text-sm text-muted">Con tarjeta de crédito</p>
            </div>
          </div>
        </Cell>
      </div>
    </section>
  );
}

function WeeklyDeal() {
  const { products, settings, openProduct } = useSite();
  const deal = pickDeal(products, settings)!;
  const off = discount(deal);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <button onClick={() => openProduct(deal)} className="group relative grid h-full w-full grid-cols-[1.5fr_1fr] text-left md:grid-cols-[1.1fr_1fr]">
      <div className="relative z-10 flex flex-col justify-between gap-6 p-6 md:p-9">
        <div className="flex items-center gap-4">
          <Label n="a">Oferta de la semana</Label>
          {off > 0 && <span className="font-display text-[11px] tracking-[0.2em] text-accent">−{off}%</span>}
        </div>
        <div>
          <p className="text-muted">{deal.brand}</p>
          <h3 className="title-lux text-[clamp(32px,4vw,56px)] !font-medium">{deal.name}</h3>
          <p className="mt-1 text-fg/55">{[deal.storage, deal.colorName].filter(Boolean).join(" · ")}</p>
          <div className="mt-5">
            {deal.comparePrice && deal.comparePrice > deal.price && <p className="text-muted line-through">{money(deal.comparePrice)}</p>}
            <p className="font-display text-3xl font-normal tracking-tight md:text-4xl">{money(deal.price)}</p>
            {deal.installments && (
              <p className="text-sm text-muted">
                o {deal.installments.count} cuotas de {money(deal.installments.amount)}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-5">
          <Countdown endsOn={settings.weeklyDeal?.endsOn} />
          <span className="link-line">Lo quiero →</span>
        </div>
      </div>
      <motion.div ref={ref} style={{ y }} className="relative z-0 -ml-2 h-[200px] self-center pr-6 md:-ml-6 md:h-auto md:self-stretch md:py-10 md:pr-6">
        <div className="h-full w-full transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]">
          <ProductVisual product={deal} />
        </div>
      </motion.div>
    </button>
  );
}

function Countdown({ endsOn }: { endsOn?: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = dealEnd(endsOn).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsOn]);

  const parts =
    left === null
      ? ["--", "--", "--", "--"]
      : [left / 86_400_000, (left / 3_600_000) % 24, (left / 60_000) % 60, (left / 1000) % 60].map((n) => String(Math.floor(n)).padStart(2, "0"));
  return (
    <div className="flex border border-line" aria-label="Tiempo restante de la oferta">
      {["días", "hs", "min", "seg"].map((label, i) => (
        <div key={label} className={clsx("w-14 py-2 text-center", i > 0 && "border-l border-line")}>
          <p className="font-display text-lg font-light tabular-nums leading-tight">{parts[i]}</p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

function Label({ n, children }: { n: string; children: ReactNode }) {
  return (
    <span className="eyebrow flex items-center gap-2">
      <span className="text-fg/30">{n}</span> {children}
      <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-accent opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
    </span>
  );
}

function Cell({ children, className, href, onClick }: { children: ReactNode; className?: string; href?: string; onClick?: () => void }) {
  const cls = "group relative block h-full w-full overflow-hidden bg-ink text-left transition-colors duration-500 hover:bg-ink-2";
  const line = <span className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-700 group-hover:w-full" />;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{ duration: 1 }}
      className={clsx("min-h-[200px] bg-ink", className)}
    >
      {href ? (
        <a href={href} className={cls}>
          {children}
          {line}
        </a>
      ) : onClick ? (
        <button onClick={onClick} className={cls}>
          {children}
          {line}
        </button>
      ) : (
        <div className={cls}>{children}</div>
      )}
    </motion.div>
  );
}
