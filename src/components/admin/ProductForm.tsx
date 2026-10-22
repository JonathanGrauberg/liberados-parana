"use client";

import { Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { categories, conditions, type CategoryId, type Condition } from "@/brand.config";
import { deleteProduct, saveProduct, type ProductInput } from "@/lib/actions";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ImageManager } from "./ImageManager";
import { Button, Card, Field, Input, Select, Textarea, Toggle } from "./ui";

const empty: ProductInput = {
  name: "",
  brand: "",
  category: "celulares",
  condition: "nuevo",
  price: 0,
  stock: 1,
  color: "#7b7fdc",
  description: "",
  specs: [],
  images: [],
  featured: false,
  visible: true,
};

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(product ?? empty);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setP((x) => ({ ...x, [k]: v }));
  const num = (v: string) => (v === "" ? 0 : Number(v.replace(/\D/g, "")));

  const margin = p.cost && p.price ? Math.round(((p.price - p.cost) / p.price) * 100) : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!p.name.trim()) return setMsg("Poné el nombre del producto");
    start(async () => {
      await saveProduct(p);
      router.push("/admin-lp/productos?ok=1");
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div className="space-y-6">
        <Card>
          <h2 className="font-display mb-4 text-xl font-bold">Fotos</h2>
          <ImageManager images={p.images} onChange={(v) => set("images", v)} onColor={(c) => set("color", c)} />
        </Card>

        <Card className="space-y-4">
          <h2 className="font-display text-xl font-bold">Datos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" className="sm:col-span-2">
              <Input value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="iPhone 13" required />
            </Field>
            <Field label="Marca">
              <Input value={p.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Apple" list="brands" />
              <datalist id="brands">
                {["Apple", "Samsung", "Motorola", "Xiaomi", "JBL", "Sony"].map((b) => <option key={b} value={b} />)}
              </datalist>
            </Field>
            <Field label="Categoría">
              <Select value={p.category} onChange={(e) => set("category", e.target.value as CategoryId)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="Estado">
              <Select value={p.condition} onChange={(e) => set("condition", e.target.value as Condition)}>
                {Object.entries(conditions).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </Field>
            <Field label="Capacidad" hint="Opcional">
              <Input value={p.storage ?? ""} onChange={(e) => set("storage", e.target.value || undefined)} placeholder="128 GB" />
            </Field>
            <Field label="Color (nombre)" hint="Opcional">
              <Input value={p.colorName ?? ""} onChange={(e) => set("colorName", e.target.value || undefined)} placeholder="Azul" />
            </Field>
            <Field label="Color de brillo en la web" hint="Se detecta solo con la primera foto">
              <div className="flex gap-2">
                <input type="color" value={p.color} onChange={(e) => set("color", e.target.value)} className="h-12 w-14 cursor-pointer rounded-xl border border-black/10 bg-white p-1" />
                <Input value={p.color} onChange={(e) => set("color", e.target.value)} />
              </div>
            </Field>
            {(p.condition === "usado" || p.condition === "reacondicionado") && (
              <Field label="Salud de batería (%)">
                <Input inputMode="numeric" value={p.battery ?? ""} onChange={(e) => set("battery", num(e.target.value) || undefined)} placeholder="89" />
              </Field>
            )}
            <Field label="Descripción" className="sm:col-span-2">
              <Textarea value={p.description} onChange={(e) => set("description", e.target.value)} placeholder="Contá lo más lindo del equipo en una o dos frases." />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Características</h2>
            <Button type="button" variant="ghost" disabled={p.specs.length >= 6} onClick={() => set("specs", [...p.specs, { label: "", value: "" }])}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </div>
          <p className="mb-3 text-sm text-text-mute">
            Aparecen con flechas alrededor del equipo cuando el cliente lo abre en la web (hasta 6; se reparten izquierda y derecha en este orden). Ej.: Pantalla · 6,1", Cámara · 48 MP, Garantía · 12 meses.
          </p>
          <div className="space-y-2">
            {p.specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input value={s.label} placeholder="Pantalla" onChange={(e) => set("specs", p.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <Input value={s.value} placeholder='6,1"' onChange={(e) => set("specs", p.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                <button type="button" aria-label="Quitar" onClick={() => set("specs", p.specs.filter((_, j) => j !== i))} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-text-mute hover:bg-black/5">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Card className="space-y-4">
          <h2 className="font-display text-xl font-bold">Precio y stock</h2>
          <Field label="Precio de venta ($)">
            <Input inputMode="numeric" value={p.price ? p.price.toLocaleString("es-AR") : ""} onChange={(e) => set("price", num(e.target.value))} className="font-display text-xl font-bold" placeholder="0" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio anterior" hint="Se muestra tachado">
              <Input inputMode="numeric" value={p.comparePrice ? p.comparePrice.toLocaleString("es-AR") : ""} onChange={(e) => set("comparePrice", num(e.target.value) || undefined)} />
            </Field>
            <Field label="Costo" hint="Privado, no se ve en la web">
              <Input inputMode="numeric" value={p.cost ? p.cost.toLocaleString("es-AR") : ""} onChange={(e) => set("cost", num(e.target.value) || undefined)} />
            </Field>
          </div>
          {margin !== null && (
            <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
              Ganás {money(p.price - (p.cost ?? 0))} por unidad ({margin}%)
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cuotas" hint="Cantidad (opcional)">
              <Input inputMode="numeric" value={p.installments?.count ?? ""} onChange={(e) => { const c = num(e.target.value); set("installments", c ? { count: c, amount: p.installments?.amount ?? Math.round(p.price / c) } : undefined); }} placeholder="12" />
            </Field>
            <Field label="Valor de cuota">
              <Input inputMode="numeric" disabled={!p.installments} value={p.installments?.amount ? p.installments.amount.toLocaleString("es-AR") : ""} onChange={(e) => p.installments && set("installments", { ...p.installments, amount: num(e.target.value) })} />
            </Field>
          </div>
          <Field label="Unidades en stock">
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" className="w-14 text-xl" onClick={() => set("stock", Math.max(0, p.stock - 1))}>−</Button>
              <Input inputMode="numeric" value={p.stock} onChange={(e) => set("stock", num(e.target.value))} className="text-center text-xl font-bold" />
              <Button type="button" variant="ghost" className="w-14 text-xl" onClick={() => set("stock", p.stock + 1)}>+</Button>
            </div>
          </Field>
        </Card>

        <Card className="space-y-4">
          <Toggle checked={p.visible} onChange={(v) => set("visible", v)} label="Mostrar en la web" />
          <Toggle checked={p.featured} onChange={(v) => set("featured", v)} label="Destacado (aparece en “Lo más pedido”)" />
        </Card>

        {msg && <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{msg}</p>}
        <div className="flex gap-3">
          <Link href="/admin-lp/productos" className="inline-flex h-14 items-center rounded-xl bg-black/5 px-5 font-semibold">Cancelar</Link>
          <Button type="submit" variant="brand" disabled={pending} className="h-14 flex-1 text-lg">
            <Save className="h-5 w-5" /> {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
        {product && (
          <Button
            type="button"
            variant="danger"
            className="w-full"
            onClick={() => {
              if (!confirm(`¿Eliminar “${product.name}”? No se puede deshacer.`)) return;
              start(async () => {
                await deleteProduct(product.id);
                router.push("/admin-lp/productos");
              });
            }}
          >
            <Trash2 className="h-4 w-4" /> Eliminar producto
          </Button>
        )}
      </div>
    </form>
  );
}
