import type { DB, Product } from "./types";

/** Datos de ejemplo para la demo. Se cargan la primera vez que arranca. */
const now = new Date().toISOString();

function p(partial: Partial<Product> & Pick<Product, "id" | "name" | "brand" | "category" | "condition" | "price" | "color">): Product {
  return {
    slug: partial.id,
    currency: "ARS",
    stock: 3,
    description: "",
    specs: [],
    images: [],
    featured: false,
    visible: true,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}


const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const FEATURED = new Set(["15", "14 Pro", "13 Pro", "11"]);

type Usado = [modelo: string, capacidad: string, color: string, hex: string, bateria: number, efectivo: number, lista: number, proveedor: string];

function usados(rows: Usado[]): Product[] {
  const seen = new Set<string>();
  return rows.map(([modelo, cap, color, hex, bat, cash, list, supplier]) => {
    const id = slug(`iphone ${modelo} ${cap} ${color} usado`);
    const featured = FEATURED.has(modelo) && !seen.has(modelo);
    seen.add(modelo);
    return p({
      id,
      name: `iPhone ${modelo}`,
      brand: "Apple",
      category: "celulares",
      condition: "usado",
      currency: "USD",
      price: list,
      cashPrice: cash,
      supplier,
      stock: 1,
      color: hex,
      colorName: color,
      storage: cap,
      battery: bat,
      description: `Usado seleccionado, batería al ${bat} %. Revisado uno por uno.`,
      specs: [{ label: "Estado", value: "Usado seleccionado" }],
      featured,
    });
  });
}

function nuevos(rows: [modelo: string, capacidad: string][]): Product[] {
  return rows.map(([modelo, cap]) =>
    p({
      id: slug(`iphone ${modelo} ${cap} nuevo`),
      name: `iPhone ${modelo}`,
      brand: "Apple",
      category: "celulares",
      condition: "sellado",
      currency: "USD",
      price: 0,
      priceOnRequest: true,
      stock: 0,
      color: "#c9cbd1",
      storage: cap,
      description: "Nuevo, en caja, con garantía de 1 año. Consultanos precio y colores disponibles.",
      specs: [
        { label: "Estado", value: "Nuevo en caja" },
        { label: "Garantía", value: "1 año" },
      ],
    }),
  );
}

export const seed: DB = {
  products: [
    /* ── iPhone usados seleccionados (lista del local) ── */
    ...usados([
      ["11", "64 GB", "Black", "#2b2b2e", 100, 280, 380, "Ikings"],
      ["11", "128 GB", "Black", "#2b2b2e", 100, 300, 400, "Rudi"],
      ["13", "128 GB", "Midnight", "#232a35", 89, 410, 510, "Rudi"],
      ["13", "256 GB", "Midnight", "#232a35", 100, 490, 590, "Ikings"],
      ["13 Pro", "128 GB", "Graphite", "#4a4a4f", 98, 530, 630, "Canje"],
      ["13 Pro", "128 GB", "Green", "#4f6b5a", 100, 550, 650, "Rudi"],
      ["14", "128 GB", "Blue", "#a9c3db", 100, 490, 590, "Facundo"],
      ["14 Pro", "128 GB", "Black", "#2f2e33", 100, 565, 665, "Facundo"],
      ["15", "128 GB", "Black", "#35363a", 100, 550, 650, "Facundo"],
    ]),
    /* ── iPhone nuevos, en caja, garantía 1 año: precio y stock a consultar ── */
    ...nuevos([
      ["13", "128 GB"],
      ["15", "128 GB"],
      ["16", "128 GB"],
      ["17", "256 GB"],
      ["17 Air", "256 GB"],
      ["17 Pro", "256 GB"],
      ["17 Pro", "512 GB"],
      ["17 Pro Max", "256 GB"],
      ["17 Pro Max", "512 GB"],
    ]),
  ],
  sales: [],
  moves: [],
  settings: {
    contact: {
      phone: "+54 343 438-6383",
      whatsapp: "543434386383",
      address: "25 de Mayo 181",
      city: "Paraná, Entre Ríos",
      instagram: "liberadosparana",
      mapsQuery: "25 de Mayo 181, Paraná, Entre Ríos, Argentina",
    },
    hours: [
      { open: false, ranges: [] },
      { open: true, ranges: [{ from: "09:00", to: "13:00" }, { from: "17:00", to: "21:00" }] },
      { open: true, ranges: [{ from: "09:00", to: "13:00" }, { from: "17:00", to: "21:00" }] },
      { open: true, ranges: [{ from: "09:00", to: "13:00" }, { from: "17:00", to: "21:00" }] },
      { open: true, ranges: [{ from: "09:00", to: "13:00" }, { from: "17:00", to: "21:00" }] },
      { open: true, ranges: [{ from: "09:00", to: "13:00" }, { from: "17:00", to: "21:00" }] },
      { open: true, ranges: [{ from: "09:00", to: "13:00" }] },
    ],
    hoursNote: "",
    usdRate: 1450,
    tradeIn: {
      note: "La cotización final la confirmamos al revisar el equipo en el local.",
      // modelos que el cliente puede elegir en el formulario del Plan Canje
      models: [
        { id: "iphone-11", name: "iPhone 11", value: 150 },
        { id: "iphone-11-pro", name: "iPhone 11 Pro", value: 190 },
        { id: "iphone-11-pro-max", name: "iPhone 11 Pro Max", value: 220 },
        { id: "iphone-12-mini", name: "iPhone 12 mini", value: 170 },
        { id: "iphone-12", name: "iPhone 12", value: 200 },
        { id: "iphone-12-pro", name: "iPhone 12 Pro", value: 260 },
        { id: "iphone-12-pro-max", name: "iPhone 12 Pro Max", value: 300 },
        { id: "iphone-13-mini", name: "iPhone 13 mini", value: 240 },
        { id: "iphone-13", name: "iPhone 13", value: 280 },
        { id: "iphone-13-pro", name: "iPhone 13 Pro", value: 360 },
        { id: "iphone-13-pro-max", name: "iPhone 13 Pro Max", value: 400 },
        { id: "iphone-14", name: "iPhone 14", value: 330 },
        { id: "iphone-14-plus", name: "iPhone 14 Plus", value: 350 },
        { id: "iphone-14-pro", name: "iPhone 14 Pro", value: 450 },
        { id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", value: 500 },
        { id: "iphone-15", name: "iPhone 15", value: 420 },
        { id: "iphone-15-plus", name: "iPhone 15 Plus", value: 450 },
        { id: "iphone-15-pro", name: "iPhone 15 Pro", value: 560 },
        { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", value: 620 },
        { id: "iphone-16e", name: "iPhone 16e", value: 400 },
        { id: "iphone-16", name: "iPhone 16", value: 520 },
        { id: "iphone-16-plus", name: "iPhone 16 Plus", value: 560 },
        { id: "iphone-16-pro", name: "iPhone 16 Pro", value: 700 },
        { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", value: 780 },
        { id: "iphone-17", name: "iPhone 17", value: 650 },
        { id: "iphone-17-air", name: "iPhone 17 Air", value: 700 },
        { id: "iphone-17-pro", name: "iPhone 17 Pro", value: 850 },
        { id: "iphone-17-pro-max", name: "iPhone 17 Pro Max", value: 950 },
        { id: "otro-modelo", name: "Otro modelo", value: 0 },
      ],
    },
    promos: [{ id: "promo-iphone15", image: "/seed/promo-iphone15.jpg", title: "iPhone 15 nuevo sellado en 12 cuotas", active: true }],
  },
};
