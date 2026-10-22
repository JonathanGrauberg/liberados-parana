const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export const money = (n: number) => ars.format(Math.round(n || 0));

const usdFmt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
export const usd = (n: number) => `U$S ${usdFmt.format(Math.round(n || 0))}`;

/** Muestra un monto en su moneda: "U$S 380" o "$ 456.000". */
export const inCurrency = (n: number, currency: "USD" | "ARS" = "ARS") => (currency === "USD" ? usd(n) : money(n));

/** Pasa a pesos (redondeado a mil, para que se lea limpio). */
export function toArs(n: number, currency: "USD" | "ARS" = "ARS", rate = 0) {
  if (currency !== "USD") return n;
  return Math.round((n * rate) / 1000) * 1000;
}

/** Precio con el que se compara/ordena un producto (el más bajo publicado, en pesos). */
export function sortPrice(p: { price: number; cashPrice?: number; currency?: "USD" | "ARS"; priceOnRequest?: boolean }, rate: number) {
  if (p.priceOnRequest) return Number.POSITIVE_INFINITY;
  return toArs(p.cashPrice || p.price, p.currency, rate);
}

export function waLink(phone: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
