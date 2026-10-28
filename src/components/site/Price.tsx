"use client";

import clsx from "clsx";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { inCurrency, money, toArs } from "@/lib/format";
import type { PublicProduct } from "@/lib/types";
import { useSite } from "./SiteContext";

type Size = "sm" | "md" | "lg";

const main: Record<Size, string> = {
  sm: "text-[28px] leading-tight",
  md: "text-3xl md:text-4xl",
  lg: "text-4xl",
};

/** Número que "cuenta" desde cero hasta el valor cuando aparece en pantalla. */
export function CountUp({ value, format, className, duration = 1.2 }: { value: number; format: (n: number) => string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  const from = useRef(0);

  // al aparecer cuenta desde 0; si después cambia el valor, cuenta desde el número anterior
  useEffect(() => {
    if (!seen) return;
    if (reduce) return setN(value);
    const c = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        from.current = v;
        setN(v);
      },
    });
    return () => c.stop();
  }, [seen, value, reduce, duration]);

  return (
    <span ref={ref} className={clsx("tabular-nums", className)}>
      {format(n)}
    </span>
  );
}

/**
 * Precio de un producto, igual en toda la web:
 * - efectivo en grande (si lo hay), lista abajo
 * - si está en dólares, el equivalente en pesos con la cotización del local
 * - "Consultá precio" cuando no se publica
 */
export function Price({ p, size = "sm", className }: { p: PublicProduct; size?: Size; className?: string }) {
  const { settings } = useSite();
  const rate = settings.usdRate;

  if (p.priceOnRequest) {
    return (
      <div className={className}>
        <p className={clsx("font-display font-bold tracking-tight", main[size])}>Consultá precio</p>
        <p className={clsx("text-muted", size === "sm" ? "text-[14px]" : "text-xs")}>Te respondemos al toque por WhatsApp</p>
      </div>
    );
  }

  const cur = p.currency ?? "ARS";
  const lead = p.cashPrice || p.price;
  const showList = !!p.cashPrice && p.price > p.cashPrice;
  const ars = cur === "USD" && rate > 0 ? toArs(lead, cur, rate) : 0;
  const fmt = (n: number) => inCurrency(n, cur);

  return (
    <div className={className}>
      {p.comparePrice && p.comparePrice > p.price && <p className="text-xs text-muted line-through">{inCurrency(p.comparePrice, cur)}</p>}
      <p className={clsx("font-display font-bold tracking-tight", main[size])}>
        <CountUp value={lead} format={fmt} />
        {p.cashPrice ? <span className="ml-1.5 align-middle text-[0.5em] font-semibold uppercase tracking-[0.12em] text-accent">efectivo</span> : null}
      </p>
      {ars > 0 && (
        <p className={clsx("text-muted", size === "sm" ? "text-[15px]" : "text-sm")}>
          ≈ <CountUp value={ars} format={money} duration={1.4} />
        </p>
      )}
      {showList && <p className={clsx("text-muted", size === "sm" ? "text-[14px]" : "text-sm")}>Lista {inCurrency(p.price, cur)}</p>}
      {p.installments && (
        <p className={clsx("font-medium text-accent", size === "sm" ? "text-[14px]" : "text-sm")}>
          {p.installments.count} cuotas de {money(p.installments.amount)}
        </p>
      )}
    </div>
  );
}

/** Texto plano del precio (para mensajes de WhatsApp). */
export function priceText(p: PublicProduct) {
  if (p.priceOnRequest) return "";
  const cur = p.currency ?? "ARS";
  return p.cashPrice ? `${inCurrency(p.cashPrice, cur)} efectivo / ${inCurrency(p.price, cur)} lista` : inCurrency(p.price, cur);
}
