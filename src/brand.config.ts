/**
 * ─────────────────────────────────────────────────────────────
 *  BRANDING — todo lo que define la identidad vive acá.
 *  Cuando llegue el manual de marca del diseñador, se cambia
 *  en este archivo y en las variables de `src/app/globals.css`
 *  (bloque "TOKENS DE MARCA"). Nada más.
 *
 *  Tipografía: se define en `src/app/fonts.ts`.
 * ─────────────────────────────────────────────────────────────
 */
export const brand = {
  name: "Liberados Paraná",
  shortName: "Liberados",
  tagline: "Celulares y tecnología",
  description:
    "Celulares nuevos, sellados y usados, accesorios y plan canje en Paraná, Entre Ríos.",
  // Colores del logo (los mismos que en globals.css, para usar desde JS/canvas)
  colors: {
    ink: "#1d1a55",
    indigo: "#2b2a80",
    cyan: "#3ee6e8",
    violet: "#7b7fdc",
    pink: "#f06bb5",
  },
} as const;

/** Categorías del catálogo. El orden es el que se ve en la web. */
export const categories = [
  { id: "celulares", label: "Celulares", icon: "Smartphone" },
  { id: "tablets", label: "Tablets", icon: "Tablet" },
  { id: "computacion", label: "Computación", icon: "Laptop" },
  { id: "audio", label: "Audio", icon: "Headphones" },
  { id: "smartwatch", label: "Smartwatch", icon: "Watch" },
  { id: "accesorios", label: "Accesorios", icon: "Cable" },
  { id: "gaming", label: "Gaming", icon: "Gamepad2" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export const conditions = {
  sellado: { label: "Nuevo sellado", tone: "cyan" },
  nuevo: { label: "Nuevo", tone: "cyan" },
  usado: { label: "Usado premium", tone: "pink" },
  reacondicionado: { label: "Reacondicionado", tone: "violet" },
} as const;

export type Condition = keyof typeof conditions;
