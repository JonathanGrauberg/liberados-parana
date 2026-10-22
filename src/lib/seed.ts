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
      description: `Usado seleccionado, batería al ${bat} %. Revisado y liberado para cualquier compañía.`,
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
    /* ── Ejemplos de otras categorías (reemplazar por los reales) ── */
    p({
      id: "airpods-pro-2",
      name: "AirPods Pro (2.ª gen.)",
      brand: "Apple",
      category: "audio",
      condition: "sellado",
      price: 389_000,
      cost: 310_000,
      stock: 6,
      color: "#eef0f4",
      description: "Cancelación activa de ruido y audio espacial. Estuche MagSafe USB‑C.",
      featured: true,
    }),
    p({
      id: "jbl-flip-6",
      name: "JBL Flip 6",
      brand: "JBL",
      category: "audio",
      condition: "nuevo",
      price: 189_000,
      cost: 140_000,
      stock: 3,
      color: "#d9363e",
      colorName: "Rojo",
      description: "Parlante portátil resistente al agua, 12 h de batería.",
    }),
    p({
      id: "apple-watch-s9",
      name: "Apple Watch Series 9",
      brand: "Apple",
      category: "smartwatch",
      condition: "sellado",
      price: 699_000,
      cost: 560_000,
      stock: 2,
      color: "#1f2330",
      colorName: "Medianoche",
      description: "Doble toque, pantalla más brillante y detección de choques.",
    }),
    p({
      id: "ipad-10",
      name: "iPad (10.ª gen.)",
      brand: "Apple",
      category: "tablets",
      condition: "sellado",
      price: 799_000,
      cost: 650_000,
      stock: 2,
      color: "#7fb7e6",
      colorName: "Azul",
      storage: "64 GB",
      description: "Pantalla Liquid Retina de 10,9\" y chip A14 Bionic.",
    }),
    p({
      id: "cargador-20w",
      name: "Cargador USB‑C 20 W",
      brand: "Apple",
      category: "accesorios",
      condition: "nuevo",
      price: 39_000,
      cost: 22_000,
      stock: 25,
      color: "#f2f2f2",
      description: "Carga rápida original para iPhone y iPad.",
    }),
    p({
      id: "funda-magsafe",
      name: "Funda MagSafe transparente",
      brand: "Liberados",
      category: "accesorios",
      condition: "nuevo",
      price: 18_000,
      cost: 7_000,
      stock: 40,
      color: "#b9e4f0",
      description: "Antigolpes, con imán MagSafe. Modelos iPhone 12 a 15.",
    }),
    p({
      id: "joystick-ps5",
      name: "Joystick DualSense",
      brand: "Sony",
      category: "gaming",
      condition: "nuevo",
      price: 129_000,
      cost: 95_000,
      stock: 0,
      color: "#e9ebf0",
      description: "Control inalámbrico para PS5 con respuesta háptica.",
    }),
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
      note: "Valor estimado. Lo confirmamos al revisar el equipo en el local.",
      // valores de ejemplo, en dólares: el local los ajusta en el panel
      models: [
        { id: "ip11", name: "iPhone 11", value: 180 },
        { id: "ip12", name: "iPhone 12", value: 240 },
        { id: "ip13", name: "iPhone 13", value: 320 },
        { id: "ip13p", name: "iPhone 13 Pro", value: 400 },
        { id: "ip14", name: "iPhone 14", value: 380 },
        { id: "ip14p", name: "iPhone 14 Pro", value: 460 },
        { id: "ip15", name: "iPhone 15", value: 440 },
        { id: "s22", name: "Samsung Galaxy S22", value: 180 },
        { id: "s23", name: "Samsung Galaxy S23", value: 260 },
        { id: "a54", name: "Samsung Galaxy A54", value: 110 },
        { id: "g54", name: "Motorola G54", value: 70 },
        { id: "otro", name: "Otro modelo", value: 0 },
      ],
    },
    promos: [{ id: "promo-iphone15", image: "/seed/promo-iphone15.jpg", title: "iPhone 15 nuevo sellado en 12 cuotas", active: true }],
  },
};
