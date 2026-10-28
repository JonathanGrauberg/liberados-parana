import type { TradeInPricing } from "./types";

/** Opciones de estado del formulario (el texto es lo que ve el cliente). */
export const LOOKS = [
  { id: "Impecable", hint: "Como nuevo, sin marcas" },
  { id: "Bueno, marcas leves", hint: "Detalles mínimos de uso" },
  { id: "Marcas visibles", hint: "Rayones o golpes a la vista" },
  { id: "Dañado o roto", hint: "Pantalla, tapa o cámara rota" },
] as const;

/** Porcentajes de arranque. El local los ajusta en Panel › Ajustes. */
export const DEFAULT_PRICING: TradeInPricing = {
  looks: { Impecable: 100, "Bueno, marcas leves": 90, "Marcas visibles": 75, "Dañado o roto": 45 },
  battery: { high: 100, mid: 95, low: 88, unknown: 92 },
  fault: 70,
  partsYes: 85,
  partsUnknown: 92,
};

export type TradeInAnswers = {
  look: string;
  /** % de batería escrito por el cliente ("" si no sabe) */
  battery: string;
  works: boolean;
  parts: "No" | "Sí" | "No sé";
};

/** Valor estimado (uso interno) en dólares, redondeado de a 5. */
export function estimateTradeIn(max: number, a: TradeInAnswers, pricing: TradeInPricing = DEFAULT_PRICING) {
  if (!max) return 0;
  const bat = Number(a.battery);
  const pBattery = !a.battery ? pricing.battery.unknown : bat >= 85 ? pricing.battery.high : bat >= 80 ? pricing.battery.mid : pricing.battery.low;
  const pParts = a.parts === "Sí" ? pricing.partsYes : a.parts === "No sé" ? pricing.partsUnknown : 100;
  const pct = ((pricing.looks[a.look] ?? 100) / 100) * (pBattery / 100) * ((a.works ? 100 : pricing.fault) / 100) * (pParts / 100);
  return Math.round((max * pct) / 5) * 5;
}
