import type { Product, Sale } from "./types";

const TZ = "America/Argentina/Buenos_Aires";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ }); // AAAA-MM-DD

export type Period = "hoy" | "semana" | "mes" | "todo";

export function inPeriod(iso: string, period: Period, now = new Date()) {
  if (period === "todo") return true;
  const d = new Date(iso);
  if (period === "hoy") return dayKey(d) === dayKey(now);
  if (period === "mes") return dayKey(d).slice(0, 7) === dayKey(now).slice(0, 7);
  return now.getTime() - d.getTime() < 7 * 24 * 3600 * 1000;
}

export function summarize(sales: Sale[]) {
  let total = 0;
  let cost = 0;
  let units = 0;
  const byPayment: Record<string, number> = {};
  for (const s of sales) {
    total += s.total;
    byPayment[s.payment] = (byPayment[s.payment] ?? 0) + s.total;
    for (const it of s.items) {
      units += it.qty;
      cost += (it.unitCost ?? 0) * it.qty * (it.currency === "USD" ? (s.usdRate ?? 0) : 1);
    }
    // el equipo recibido en canje es mercadería, no pérdida
    cost -= s.tradeIn?.value ?? 0;
  }
  return { total, profit: total - cost, units, count: sales.length, byPayment };
}

/** Proveedores ya usados, para sugerirlos al cargar un producto. */
export function suppliersOf(products: Product[]) {
  return Array.from(new Set(["Canje", ...products.map((p) => p.supplier).filter((x): x is string => !!x)])).sort();
}
