import type { CategoryId, Condition } from "@/brand.config";

export type Spec = { label: string; value: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  condition: Condition;
  /** Precio de venta en pesos */
  price: number;
  /** Precio de lista anterior (para mostrar tachado) */
  comparePrice?: number;
  /** Costo (solo panel interno, nunca se muestra en la web) */
  cost?: number;
  installments?: { count: number; amount: number };
  stock: number;
  /** Color de acento del equipo (hex). Se calcula solo al subir la foto. */
  color: string;
  colorName?: string;
  storage?: string;
  /** Para usados: % de salud de batería */
  battery?: number;
  description: string;
  specs: Spec[];
  /** Rutas públicas: "/media/xxx.webp" */
  images: string[];
  featured: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMethod = "efectivo" | "transferencia" | "debito" | "credito" | "otro";

export type SaleItem = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  unitCost?: number;
};

export type Sale = {
  id: string;
  date: string;
  items: SaleItem[];
  /** Equipo recibido en parte de pago (plan canje) */
  tradeIn?: { description: string; value: number };
  payment: PaymentMethod;
  /** Lo que efectivamente pagó el cliente (total − canje) */
  total: number;
  note?: string;
};

export type StockReason = "venta" | "ingreso" | "ajuste" | "canje";

export type StockMove = {
  id: string;
  date: string;
  productId: string;
  productName: string;
  delta: number;
  reason: StockReason;
  note?: string;
  saleId?: string;
};

export type TimeRange = { from: string; to: string };
export type DayHours = { open: boolean; ranges: TimeRange[] };

export type TradeInModel = { id: string; name: string; value: number };

export type Promo = { id: string; image: string; title: string; active: boolean };

export type Settings = {
  contact: {
    phone: string;
    whatsapp: string; // solo dígitos, con código de país: 543434386383
    address: string;
    city: string;
    instagram: string;
    mapsQuery: string;
  };
  /** 0 = domingo … 6 = sábado */
  hours: DayHours[];
  hoursNote: string;
  tradeIn: { models: TradeInModel[]; note: string };
  promos: Promo[];
  /** Producto en "Oferta de la semana". Vacío = el de mayor descuento. */
  weeklyDeal?: { productId: string; endsOn?: string };
  /** Cartel que aparece la primera vez que alguien entra a la web. */
  welcome?: WelcomePopup;
};

export type WelcomeAction = "producto" | "catalogo" | "canje" | "whatsapp";

export type WelcomePopup = {
  enabled: boolean;
  theme: "dark" | "light";
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  action: WelcomeAction;
  /** Producto que se muestra en la imagen (y al que lleva el botón si la acción es "producto"). */
  productId?: string;
  /** Imagen propia subida desde el panel (reemplaza la del producto). */
  image?: string;
  /** Sube cada vez que se guarda un cambio: así el cartel vuelve a mostrarse una vez. */
  version: number;
};

export type DB = {
  products: Product[];
  sales: Sale[];
  moves: StockMove[];
  settings: Settings;
};

/** Lo que la web pública puede ver de un producto (sin costo). */
export type PublicProduct = Omit<Product, "cost">;
