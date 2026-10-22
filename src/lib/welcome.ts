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
  eyebrow: "Solo esta semana",
  title: "iPhone 15 −8%",
  text: "Nuevo sellado, liberado y con garantía. Hasta 12 cuotas o entregando tu usado.",
  cta: "Ver oferta",
  action: "producto",
  productId: "iphone-15-128",
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
