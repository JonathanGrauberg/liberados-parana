"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, isAdmin } from "./auth";
import { getSettings, productData, saveSettingsRow, slugify, uid } from "./db";
import { prisma } from "./prisma";
import type { PaymentMethod, Product, Sale, Settings, StockMove, WelcomePopup } from "./types";
import { clampWelcome, defaultWelcome } from "./welcome";

async function guard() {
  if (!(await isAdmin())) throw new Error("No autorizado");
}

function refresh() {
  revalidatePath("/", "layout");
}

const move = (productId: string, productName: string, delta: number, reason: StockMove["reason"], note?: string, saleId?: string) =>
  prisma.stockMove.create({ data: { id: uid("m"), productId, productName, delta, reason, note, saleId } });

/* ───────────── Sesión ───────────── */

export async function loginAction(_: unknown, form: FormData) {
  const pass = String(form.get("password") ?? "");
  if (!checkPassword(pass)) return { error: "Contraseña incorrecta" };
  await createSession();
  redirect("/admin-lp");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin-lp/login");
}

/* ───────────── Productos ───────────── */

export type ProductInput = Omit<Product, "id" | "slug" | "createdAt" | "updatedAt"> & { id?: string };

export async function saveProduct(input: ProductInput) {
  await guard();
  const clean = {
    ...input,
    name: input.name.trim(),
    price: Math.max(0, Number(input.price) || Number(input.cashPrice) || 0),
    stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
    specs: input.specs.filter((s) => s.label.trim() && s.value.trim()),
  };
  const data = productData(clean);

  const existing = input.id ? await prisma.product.findUnique({ where: { id: input.id } }) : null;
  if (existing) {
    const delta = clean.stock - existing.stock;
    await prisma.$transaction([
      prisma.product.update({ where: { id: existing.id }, data }),
      ...(delta !== 0 ? [move(existing.id, clean.name, delta, "ajuste", "Edición manual")] : []),
    ]);
    refresh();
    return { id: existing.id };
  }

  let slug = slugify(`${clean.brand} ${clean.name} ${clean.storage ?? ""}`) || uid();
  if (await prisma.product.findUnique({ where: { slug } })) slug += "-" + uid().slice(-4);
  // los nuevos aparecen primero en el catálogo
  const first = await prisma.product.aggregate({ _min: { position: true } });
  await prisma.$transaction([
    prisma.product.create({ data: { id: slug, slug, position: (first._min.position ?? 0) - 1, ...data } }),
    ...(clean.stock > 0 ? [move(slug, clean.name, clean.stock, "ingreso", "Alta de producto")] : []),
  ]);
  refresh();
  return { id: slug };
}

export async function deleteProduct(id: string) {
  await guard();
  await prisma.product.delete({ where: { id } }).catch(() => undefined);
  refresh();
}

export async function toggleProduct(id: string, field: "visible" | "featured") {
  await guard();
  const p = await prisma.product.findUnique({ where: { id }, select: { visible: true, featured: true } });
  if (p) await prisma.product.update({ where: { id }, data: { [field]: !p[field] } });
  refresh();
}

/* ───────────── Stock y ventas ───────────── */

export async function addStock(productId: string, qty: number, note?: string) {
  await guard();
  const p = await prisma.product.findUnique({ where: { id: productId } });
  if (!p || !qty) return;
  await prisma.$transaction([
    prisma.product.update({ where: { id: p.id }, data: { stock: Math.max(0, p.stock + qty) } }),
    move(p.id, p.name, qty, qty > 0 ? "ingreso" : "ajuste", note),
  ]);
  refresh();
}

export type SaleInput = {
  items: { productId: string; qty: number; unitPrice: number }[];
  payment: PaymentMethod;
  tradeIn?: { description: string; value: number };
  note?: string;
};

export async function registerSale(input: SaleInput) {
  await guard();
  const products = await prisma.product.findMany({ where: { id: { in: input.items.map((i) => i.productId) } } });
  const items: Sale["items"] = [];
  for (const it of input.items) {
    const p = products.find((x) => x.id === it.productId);
    if (!p || it.qty <= 0) continue;
    if (p.stock < it.qty) return { error: `No hay stock suficiente de ${p.name} (quedan ${p.stock})` };
    items.push({ productId: p.id, name: p.name, qty: it.qty, unitPrice: it.unitPrice, unitCost: p.cost ?? undefined, currency: p.currency === "USD" ? "USD" : "ARS" });
  }
  if (!items.length) return { error: "Agregá al menos un producto" };

  // todo se totaliza en pesos con la cotización del día
  const { usdRate: rate } = await getSettings();
  const gross = items.reduce((s, i) => s + i.qty * i.unitPrice * (i.currency === "USD" ? rate : 1), 0);
  const tradeIn = input.tradeIn?.value ? input.tradeIn : undefined;
  const saleId = uid("v");

  try {
    await prisma.$transaction([
    // descuenta solo si sigue habiendo stock (evita vender dos veces el mismo equipo)
    ...items.map((it) => prisma.product.update({ where: { id: it.productId, stock: { gte: it.qty } }, data: { stock: { decrement: it.qty } } })),
    ...items.map((it) => move(it.productId, it.name, -it.qty, "venta", undefined, saleId)),
    prisma.sale.create({
      data: {
        id: saleId,
        items,
        tradeIn: tradeIn ?? undefined,
        payment: input.payment,
        total: Math.round(Math.max(0, gross - (tradeIn?.value ?? 0))),
        usdRate: Math.round(rate),
        note: input.note?.trim() || null,
      },
    }),
    ]);
  } catch {
    return { error: "El stock cambió mientras cargabas la venta. Revisá y volvé a intentar." };
  }
  refresh();
  return { ok: true as const };
}

export async function deleteSale(id: string) {
  await guard();
  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale) return;
  const items = sale.items as Sale["items"];
  const existing = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } }, select: { id: true } });
  const alive = items.filter((it) => existing.some((p) => p.id === it.productId));
  await prisma.$transaction([
    ...alive.map((it) => prisma.product.update({ where: { id: it.productId }, data: { stock: { increment: it.qty } } })),
    ...alive.map((it) => move(it.productId, it.name, it.qty, "ajuste", "Venta anulada", id)),
    prisma.sale.delete({ where: { id } }),
  ]);
  refresh();
}

/* ───────────── Ajustes ───────────── */

export async function saveSettings(patch: Partial<Settings>) {
  await guard();
  const current = await getSettings();
  await saveSettingsRow({ ...current, ...patch });
  refresh();
}

/** Guarda el cartel de bienvenida. Si cambió algo, sube la versión para que se vuelva a mostrar una vez. */
export async function saveWelcome(input: WelcomePopup) {
  await guard();
  const current = await getSettings();
  const prev = current.welcome ?? defaultWelcome;
  const next = clampWelcome({ ...input, version: prev.version });
  const changed = JSON.stringify({ ...prev, version: 0 }) !== JSON.stringify({ ...next, version: 0 });
  await saveSettingsRow({ ...current, welcome: { ...next, version: changed ? prev.version + 1 : prev.version } });
  refresh();
}
