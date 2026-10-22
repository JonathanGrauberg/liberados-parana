import type { PublicProduct, Settings } from "./types";

/** Elige la oferta de la semana: la que fijó el local o, si no, la de mayor descuento con stock. */
export function pickDeal(products: PublicProduct[], settings: Settings) {
  const chosen = products.find((p) => p.id === settings.weeklyDeal?.productId && p.stock > 0);
  if (chosen) return chosen;
  return products
    .filter((p) => p.stock > 0 && p.comparePrice && p.comparePrice > p.price)
    .sort((a, b) => discount(b) - discount(a))[0];
}

export const discount = (p: { price: number; comparePrice?: number }) =>
  p.comparePrice && p.comparePrice > p.price ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;

/** Fin de la oferta: la fecha que puso el local, o el domingo a la noche (hora de Argentina). */
export function dealEnd(endsOn?: string, now = new Date()) {
  if (endsOn) return new Date(`${endsOn}T23:59:59-03:00`);
  const tz = "America/Argentina/Buenos_Aires";
  const weekday = new Date(now.toLocaleString("en-US", { timeZone: tz })).getDay();
  const sunday = new Date(now.getTime() + ((7 - weekday) % 7) * 86_400_000);
  return new Date(`${sunday.toLocaleDateString("en-CA", { timeZone: tz })}T23:59:59-03:00`);
}
