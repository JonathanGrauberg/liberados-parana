"use client";

import clsx from "clsx";
import { Eye, EyeOff, Minus, Plus, Search, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { categories, conditions } from "@/brand.config";
import { addStock, toggleProduct } from "@/lib/actions";
import { inCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductVisual } from "../site/ProductVisual";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ProductList({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todos");
  const [, start] = useTransition();
  const [list, optimistic] = useOptimistic(products, (state, action: { id: string; patch: Partial<Product> }) =>
    state.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
  );

  const filtered = useMemo(
    () =>
      list.filter(
        (p) => (cat === "todos" || p.category === cat) && norm(`${p.name} ${p.brand} ${p.storage ?? ""}`).includes(norm(q)),
      ),
    [list, q, cat],
  );

  const changeStock = (p: Product, d: number) =>
    start(async () => {
      optimistic({ id: p.id, patch: { stock: Math.max(0, p.stock + d) } });
      await addStock(p.id, d, d > 0 ? "Ingreso rápido" : "Ajuste rápido");
    });
  const toggle = (p: Product, f: "visible" | "featured") =>
    start(async () => {
      optimistic({ id: p.id, patch: { [f]: !p[f] } });
      await toggleProduct(p.id, f);
    });

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto…"
            className="h-12 w-full rounded-xl border border-black/10 bg-white pl-12 pr-4 text-[16px] outline-none focus:border-violet"
          />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-12 rounded-xl border border-black/10 bg-white px-3 text-[16px]">
          <option value="todos">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <ul className="space-y-2">
        {filtered.map((p) => (
          <li key={p.id} className={clsx("flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_8px_rgba(0,0,0,.04)] md:gap-4 md:p-4", !p.visible && "opacity-60")}>
            <Link href={`/admin-lp/productos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f5f5f7] p-1.5">
                <ProductVisual product={p} />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold leading-tight">{p.name} <span className="font-normal text-text-mute">{p.storage}</span></p>
                <p className="truncate text-sm text-text-mute">
                  {conditions[p.condition].label} · {p.priceOnRequest ? "A consultar" : inCurrency(p.cashPrice || p.price, p.currency)}{p.supplier && <span> · {p.supplier}</span>}
                  {p.images.length === 0 && <span className="ml-1 text-amber-600">· sin foto</span>}
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-1">
              <button onClick={() => changeStock(p, -1)} disabled={p.stock === 0} aria-label="Restar uno" className="grid h-10 w-10 place-items-center rounded-full bg-black/5 disabled:opacity-30">
                <Minus className="h-4 w-4" />
              </button>
              <span className={clsx("w-10 text-center text-lg font-bold tabular-nums", p.stock === 0 ? "text-red-600" : p.stock <= 2 && "text-amber-600")}>{p.stock}</span>
              <button onClick={() => changeStock(p, 1)} aria-label="Sumar uno" className="grid h-10 w-10 place-items-center rounded-full bg-black/5">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="hidden shrink-0 gap-1 sm:flex">
              <button onClick={() => toggle(p, "featured")} aria-label="Destacado" title="Destacado" className={clsx("grid h-10 w-10 place-items-center rounded-full", p.featured ? "bg-amber-100 text-amber-500" : "text-text-mute hover:bg-black/5")}>
                <Star className="h-5 w-5" fill={p.featured ? "currentColor" : "none"} />
              </button>
              <button onClick={() => toggle(p, "visible")} aria-label="Visible en la web" title="Visible en la web" className="grid h-10 w-10 place-items-center rounded-full text-text-mute hover:bg-black/5">
                {p.visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!filtered.length && <p className="py-16 text-center text-text-mute">No hay productos con ese filtro.</p>}
    </>
  );
}
