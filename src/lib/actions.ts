"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, isAdmin } from "./auth";
import { mutateDB, slugify, uid } from "./db";
import type { PaymentMethod, Product, Settings, StockMove, WelcomePopup } from "./types";
import { clampWelcome, defaultWelcome } from "./welcome";

async function guard() {
  if (!(await isAdmin())) throw new Error("No autorizado");
}

function refresh() {
  revalidatePath("/", "layout");
}

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
  const id = await mutateDB((db) => {
    const now = new Date().toISOString();
    const clean = {
      ...input,
      name: input.name.trim(),
      price: Math.max(0, Number(input.price) || Number(input.cashPrice) || 0),
      stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
      specs: input.specs.filter((s) => s.label.trim() && s.value.trim()),
    };
    const existing = input.id ? db.products.find((p) => p.id === input.id) : undefined;
    if (existing) {
      const delta = clean.stock - existing.stock;
      if (delta !== 0) db.moves.unshift(move(existing.id, clean.name, delta, "ajuste", "Edición manual"));
      Object.assign(existing, clean, { id: existing.id, updatedAt: now });
      return existing.id;
    }
    let slug = slugify(`${clean.brand} ${clean.name} ${clean.storage ?? ""}`) || uid();
    if (db.products.some((p) => p.slug === slug)) slug += "-" + uid().slice(-4);
    const product: Product = { ...clean, id: slug, slug, createdAt: now, updatedAt: now };
    db.products.unshift(product);
    if (product.stock > 0) db.moves.unshift(move(product.id, product.name, product.stock, "ingreso", "Alta de producto"));
    return product.id;
  });
  refresh();
  return { id };
}

export async function deleteProduct(id: string) {
  await guard();
  await mutateDB((db) => {
    db.products = db.products.filter((p) => p.id !== id);
  });
  refresh();
}

export async function toggleProduct(id: string, field: "visible" | "featured") {
  await guard();
  await mutateDB((db) => {
    const p = db.products.find((x) => x.id === id);
    if (p) p[field] = !p[field];
  });
  refresh();
}

/* ───────────── Stock y ventas ───────────── */

function move(productId: string, productName: string, delta: number, reason: StockMove["reason"], note?: string, saleId?: string): StockMove {
  return { id: uid("m"), date: new Date().toISOString(), productId, productName, delta, reason, note, saleId };
}

export async function addStock(productId: string, qty: number, note?: string) {
  await guard();
  await mutateDB((db) => {
    const p = db.products.find((x) => x.id === productId);
    if (!p || !qty) return;
    p.stock = Math.max(0, p.stock + qty);
    p.updatedAt = new Date().toISOString();
    db.moves.unshift(move(p.id, p.name, qty, qty > 0 ? "ingreso" : "ajuste", note));
  });
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
  const result = await mutateDB((db) => {
    const saleId = uid("v");
    const items = [];
    for (const it of input.items) {
      const p = db.products.find((x) => x.id === it.productId);
      if (!p || it.qty <= 0) continue;
      if (p.stock < it.qty) return { error: `No hay stock suficiente de ${p.name} (quedan ${p.stock})` };
      items.push({ productId: p.id, name: p.name, qty: it.qty, unitPrice: it.unitPrice, unitCost: p.cost, currency: p.currency });
    }
    if (!items.length) return { error: "Agregá al menos un producto" };
    for (const it of items) {
      const p = db.products.find((x) => x.id === it.productId)!;
      p.stock -= it.qty;
      db.moves.unshift(move(p.id, p.name, -it.qty, "venta", undefined, saleId));
    }
    // todo se totaliza en pesos con la cotización del día
    const rate = db.settings.usdRate;
    const gross = items.reduce((s, i) => s + i.qty * i.unitPrice * (i.currency === "USD" ? rate : 1), 0);
    const tradeIn = input.tradeIn?.value ? input.tradeIn : undefined;
    db.sales.unshift({
      id: saleId,
      date: new Date().toISOString(),
      items,
      payment: input.payment,
      tradeIn,
      total: Math.round(Math.max(0, gross - (tradeIn?.value ?? 0))),
      usdRate: rate,
      note: input.note?.trim() || undefined,
    });
    return { ok: true as const };
  });
  refresh();
  return result;
}

export async function deleteSale(id: string) {
  await guard();
  await mutateDB((db) => {
    const sale = db.sales.find((s) => s.id === id);
    if (!sale) return;
    for (const it of sale.items) {
      const p = db.products.find((x) => x.id === it.productId);
      if (p) {
        p.stock += it.qty;
        db.moves.unshift(move(p.id, p.name, it.qty, "ajuste", "Venta anulada", id));
      }
    }
    db.sales = db.sales.filter((s) => s.id !== id);
  });
  refresh();
}

/* ───────────── Ajustes ───────────── */

export async function saveSettings(patch: Partial<Settings>) {
  await guard();
  await mutateDB((db) => {
    db.settings = { ...db.settings, ...patch };
  });
  refresh();
}

/** Guarda el cartel de bienvenida. Si cambió algo, sube la versión para que se vuelva a mostrar una vez. */
export async function saveWelcome(input: WelcomePopup) {
  await guard();
  await mutateDB((db) => {
    const prev = db.settings.welcome ?? defaultWelcome;
    const next = clampWelcome({ ...input, version: prev.version });
    const changed = JSON.stringify({ ...prev, version: 0 }) !== JSON.stringify({ ...next, version: 0 });
    db.settings.welcome = { ...next, version: changed ? prev.version + 1 : prev.version };
  });
  refresh();
}
