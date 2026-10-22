import type { TradeInBattery, TradeInState } from "./types";

/** Descuentos de canje por estado y batería. El local los edita en Ajustes; estos son los de arranque. */
export const DEFAULT_STATES: TradeInState[] = [
  { id: "impecable", label: "Impecable", hint: "Como nuevo, sin marcas", pct: 100 },
  { id: "muybueno", label: "Muy bueno", hint: "Marcas mínimas de uso", pct: 88 },
  { id: "bueno", label: "Bueno", hint: "Rayones visibles", pct: 74 },
  { id: "detalles", label: "Con detalles", hint: "Pantalla, cámara o botón a revisar", pct: 50 },
];

export const DEFAULT_BATTERY: TradeInBattery[] = [
  { id: "alta", label: "85 % o más", pct: 100 },
  { id: "media", label: "80 – 84 %", pct: 95 },
  { id: "baja", label: "Menos de 80 %", pct: 88 },
];

/** Valor estimado en dólares, redondeado de a 5. */
export const estimateTradeIn = (max: number, statePct: number, batteryPct: number) => Math.round((max * (statePct / 100) * (batteryPct / 100)) / 5) * 5;
