"use client";

import clsx from "clsx";
import { inCurrency, money, toArs } from "@/lib/format";
import type { PublicProduct } from "@/lib/types";
import { useSite } from "./SiteContext";

type Size = "sm" | "md" | "lg";

const main: Record<Size, string> = {
  sm: "text-[17px]",
  md: "text-2xl md:text-3xl",
  lg: "text-4xl",
};

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
        <p className={clsx("font-display font-light tracking-tight", main[size])}>Consultá precio</p>
        <p className="text-xs text-muted">Te respondemos al toque por WhatsApp</p>
      </div>
    );
  }

  const cur = p.currency ?? "ARS";
  const lead = p.cashPrice || p.price;
  const showList = !!p.cashPrice && p.price > p.cashPrice;
  const ars = cur === "USD" && rate > 0 ? toArs(lead, cur, rate) : 0;

  return (
    <div className={className}>
      {p.comparePrice && p.comparePrice > p.price && <p className="text-xs text-muted line-through">{inCurrency(p.comparePrice, cur)}</p>}
      <p className={clsx("font-display font-light tracking-tight", main[size])}>
        {inCurrency(lead, cur)}
        {p.cashPrice ? <span className="ml-1.5 align-middle text-[0.45em] uppercase tracking-[0.18em] text-muted">efectivo</span> : null}
      </p>
      {ars > 0 && <p className="text-xs text-muted">≈ {money(ars)}</p>}
      {showList && <p className={clsx("text-muted", size === "sm" ? "text-xs" : "text-sm")}>Lista {inCurrency(p.price, cur)}</p>}
      {p.installments && (
        <p className={clsx("text-muted", size === "sm" ? "text-xs" : "text-sm")}>
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
