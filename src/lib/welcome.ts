import type { WelcomePopup } from "./types";

/** Límites de texto del cartel: así siempre entra prolijo en celular y en PC. */
export const WELCOME_LIMITS = {
  eyebrow: 24,
  title: 22,
  text: 110,
  cta: 18,
} as const;

export const WELCOME_ACTIONS = {
  producto: "Abrir el producto",
  catalogo: "Ir al catálogo",
  canje: "Ir al Plan Canje",
  whatsapp: "Escribir por WhatsApp",
} as const;

export const defaultWelcome: WelcomePopup = {
  enabled: true,
  theme: "dark",
  eyebrow: "Usados seleccionados",
  title: "iPhone 15 · 128 GB",
  text: "Batería al 100 %, revisado y liberado. U$S 550 en efectivo o entregando tu usado.",
  cta: "Ver equipo",
  action: "producto",
  productId: "iphone-15-128-gb-black-usado",
  version: 1,
};

/** Recorta los textos a los límites (por si llegan más largos). */
export function clampWelcome(w: WelcomePopup): WelcomePopup {
  return {
    ...w,
    eyebrow: w.eyebrow.slice(0, WELCOME_LIMITS.eyebrow),
    title: w.title.slice(0, WELCOME_LIMITS.title),
    text: w.text.slice(0, WELCOME_LIMITS.text),
    cta: w.cta.slice(0, WELCOME_LIMITS.cta),
  };
}
