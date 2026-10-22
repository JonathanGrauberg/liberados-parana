import "server-only";
import type { CategoryId, Condition } from "@/brand.config";
import { Prisma, type Product as ProductRow, type Sale as SaleRow, type StockMove as MoveRow } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { seed } from "./seed";
import type { DB, Product, PublicProduct, Sale, Settings, StockMove } from "./types";

/**
 * Acceso a datos (PostgreSQL en Neon vía Prisma).
 * Las páginas y acciones usan estas funciones; el resto del código no conoce la base.
 */

const SETTINGS_KEY = "site";

/* ───────────── Conversión fila ⇄ tipo de la app ───────────── */

export function toProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    category: r.category as CategoryId,
    condition: r.condition as Condition,
    currency: r.currency === "USD" ? "USD" : "ARS",
    price: r.price,
    cashPrice: r.cashPrice ?? undefined,
    priceOnRequest: r.priceOnRequest || undefined,
    comparePrice: r.comparePrice ?? undefined,
    cost: r.cost ?? undefined,
    supplier: r.supplier ?? undefined,
    installments: (r.installments as Product["installments"]) ?? undefined,
    stock: r.stock,
    color: r.color,
    colorName: r.colorName ?? undefined,
    storage: r.storage ?? undefined,
    battery: r.battery ?? undefined,
    description: r.description,
    specs: (r.specs as Product["specs"]) ?? [],
    images: r.images,
    featured: r.featured,
    visible: r.visible,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/** Campos de un producto listos para guardar (sin id/slug/fechas). */
export function productData(p: Omit<Product, "id" | "slug" | "createdAt" | "updatedAt">) {
  return {
    name: p.name,
    brand: p.brand,
    category: p.category,
    condition: p.condition,
    currency: p.currency,
    price: Math.round(p.price),
    cashPrice: p.cashPrice ? Math.round(p.cashPrice) : null,
    priceOnRequest: !!p.priceOnRequest,
    comparePrice: p.comparePrice ? Math.round(p.comparePrice) : null,
    cost: p.cost ? Math.round(p.cost) : null,
    supplier: p.supplier || null,
    installments: p.installments ?? Prisma.DbNull,
    stock: p.stock,
    color: p.color,
    colorName: p.colorName || null,
    storage: p.storage || null,
    battery: p.battery ?? null,
    description: p.description,
    specs: p.specs,
    images: p.images,
    featured: p.featured,
    visible: p.visible,
  };
}

const toSale = (r: SaleRow): Sale => ({
  id: r.id,
  date: r.date.toISOString(),
  items: r.items as Sale["items"],
  tradeIn: (r.tradeIn as Sale["tradeIn"]) ?? undefined,
  payment: r.payment as Sale["payment"],
  total: r.total,
  usdRate: r.usdRate ?? undefined,
  note: r.note ?? undefined,
});

const toMove = (r: MoveRow): StockMove => ({
  id: r.id,
  date: r.date.toISOString(),
  productId: r.productId,
  productName: r.productName,
  delta: r.delta,
  reason: r.reason as StockMove["reason"],
  note: r.note ?? undefined,
  saleId: r.saleId ?? undefined,
});

/* ───────────── Datos iniciales ───────────── */

/** La primera vez que arranca con una base vacía, carga los ajustes y la lista inicial. */
async function ensureSeeded(): Promise<Settings> {
  const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
  if (row) return { ...seed.settings, ...(row.value as Partial<Settings>) };
  await prisma.$transaction([
    prisma.product.createMany({
      data: seed.products.map((p, i) => ({ id: p.id, slug: p.slug, position: i, ...productData(p) })),
      skipDuplicates: true,
    }),
    prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      create: { key: SETTINGS_KEY, value: seed.settings as object },
      update: {},
    }),
  ]);
  return structuredClone(seed.settings);
}

/* ───────────── Lecturas ───────────── */

export const getSettings = () => ensureSeeded();

export async function getProducts({ visibleOnly = false } = {}) {
  await ensureSeeded();
  const rows = await prisma.product.findMany({
    where: visibleOnly ? { visible: true } : undefined,
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toProduct);
}

export async function getProduct(id: string) {
  const r = await prisma.product.findUnique({ where: { id } });
  return r ? toProduct(r) : null;
}

/** Todo lo que necesita el panel. Ventas: el último año; movimientos: los últimos 200. */
export async function readDB(): Promise<DB> {
  const settings = await ensureSeeded();
  const since = new Date(Date.now() - 366 * 24 * 3600 * 1000);
  const [products, sales, moves] = await Promise.all([
    prisma.product.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] }),
    prisma.sale.findMany({ where: { date: { gte: since } }, orderBy: { date: "desc" } }),
    prisma.stockMove.findMany({ orderBy: { date: "desc" }, take: 200 }),
  ]);
  return { products: products.map(toProduct), sales: sales.map(toSale), moves: moves.map(toMove), settings };
}

export async function getPublicData() {
  const [all, settings] = await Promise.all([getProducts({ visibleOnly: true }), getSettings()]);
  const products: PublicProduct[] = all.map(({ cost: _cost, supplier: _supplier, ...rest }) => rest);
  return { products, settings };
}

/* ───────────── Utilidades ───────────── */

export async function saveSettingsRow(settings: Settings) {
  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value: settings as object },
    update: { value: settings as object },
  });
}

export function uid(prefix = "") {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
