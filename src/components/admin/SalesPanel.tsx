"use client";

import clsx from "clsx";
import { ArrowLeftRight, PackagePlus, Plus, Receipt, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, useTransition } from "react";
import { addStock, deleteSale, registerSale } from "@/lib/actions";
import { dateTime, inCurrency, money, usd } from "@/lib/format";
import { inPeriod, summarize, type Period } from "@/lib/stats";
import type { PaymentMethod, Product, Sale, StockMove } from "@/lib/types";
import { Button, Card, Field, Input, Select, Stat } from "./ui";

const PAYMENTS: [PaymentMethod, string][] = [
  ["efectivo", "Efectivo"],
  ["transferencia", "Transferencia"],
  ["debito", "Débito"],
  ["credito", "Crédito"],
  ["otro", "Otro"],
];
const REASON: Record<StockMove["reason"], string> = { venta: "Venta", ingreso: "Ingreso", ajuste: "Ajuste", canje: "Canje" };

export function SalesPanel({ products, sales, moves, startOpen, usdRate }: { products: Product[]; sales: Sale[]; moves: StockMove[]; startOpen: boolean; usdRate: number }) {
  const [period, setPeriod] = useState<Period>("hoy");
  const [tab, setTab] = useState<"ventas" | "movimientos">("ventas");
  const [modal, setModal] = useState<"venta" | "ingreso" | null>(startOpen ? "venta" : null);
  const [pending, start] = useTransition();

  const filtered = useMemo(() => sales.filter((s) => inPeriod(s.date, period)), [sales, period]);
  const sum = summarize(filtered);

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Button variant="brand" className="h-16 text-lg" onClick={() => setModal("venta")}>
          <Receipt className="h-6 w-6" /> Nueva venta
        </Button>
        <Button variant="primary" className="h-16 text-lg" onClick={() => setModal("ingreso")}>
          <PackagePlus className="h-6 w-6" /> Entró mercadería
        </Button>
      </div>

      <div className="mb-4 flex rounded-full bg-black/[.06] p-1">
        {(["hoy", "semana", "mes", "todo"] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={clsx("h-10 flex-1 rounded-full text-[15px] font-semibold capitalize transition", period === p ? "bg-white shadow" : "text-text-mute")}>
            {p === "todo" ? "Todo" : p === "semana" ? "7 días" : p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total vendido" value={money(sum.total)} sub={`${sum.count} ventas`} />
        <Stat label="Ganancia" value={money(sum.profit)} />
        <Stat label="Unidades" value={String(sum.units)} />
        <Card>
          <p className="text-sm font-medium text-text-mute">Por medio de pago</p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {Object.entries(sum.byPayment).length === 0 && <li className="text-text-mute">—</li>}
            {Object.entries(sum.byPayment).map(([k, v]) => (
              <li key={k} className="flex justify-between capitalize"><span>{k}</span><b>{money(v)}</b></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-8 flex gap-6 border-b border-black/10">
        {(["ventas", "movimientos"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={clsx("-mb-px border-b-2 pb-3 text-[15px] font-semibold capitalize", tab === t ? "border-violet text-text-dark" : "border-transparent text-text-mute")}>
            {t === "movimientos" ? "Movimientos de stock" : "Ventas"}
          </button>
        ))}
      </div>

      {tab === "ventas" ? (
        <ul className="mt-4 space-y-2">
          {filtered.length === 0 && <p className="py-12 text-center text-text-mute">No hay ventas en este período.</p>}
          {filtered.map((s) => (
            <li key={s.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,.04)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {s.items.map((i) => (
                    <p key={i.productId} className="font-semibold">
                      {i.qty}× {i.name} <span className="font-normal text-text-mute">a {inCurrency(i.unitPrice, i.currency)}</span>
                    </p>
                  ))}
                  {s.tradeIn && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-violet">
                      <ArrowLeftRight className="h-4 w-4" /> Recibido en canje: {s.tradeIn.description} (−{money(s.tradeIn.value)})
                    </p>
                  )}
                  <p className="mt-1 text-sm text-text-mute">
                    {dateTime(s.date)} · <span className="capitalize">{s.payment}</span>
                    {s.note && ` · ${s.note}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className="font-display text-lg font-bold">{money(s.total)}</p>
                  <button
                    aria-label="Anular venta"
                    disabled={pending}
                    onClick={() => confirm("¿Anular esta venta? El stock vuelve a sumarse.") && start(() => deleteSale(s.id))}
                    className="grid h-9 w-9 place-items-center rounded-full text-text-mute hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 divide-y divide-black/5 rounded-2xl bg-white px-4">
          {moves.length === 0 && <p className="py-12 text-center text-text-mute">Sin movimientos todavía.</p>}
          {moves.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{m.productName}</p>
                <p className="text-sm text-text-mute">{dateTime(m.date)} · {REASON[m.reason]}{m.note && ` · ${m.note}`}</p>
              </div>
              <span className={clsx("shrink-0 rounded-full px-3 py-1 text-sm font-bold tabular-nums", m.delta > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")}>
                {m.delta > 0 ? "+" : ""}{m.delta}
              </span>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {modal && (
          <Sheet onClose={() => setModal(null)} title={modal === "venta" ? "Nueva venta" : "Entró mercadería"}>
            {modal === "venta" ? (
              <SaleForm products={products} rate={usdRate} onDone={() => setModal(null)} />
            ) : (
              <StockForm products={products} onDone={() => setModal(null)} />
            )}
          </Sheet>
        )}
      </AnimatePresence>
    </>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[28px] bg-[#f5f5f7] p-5 md:rounded-[28px] md:p-7"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="grid h-11 w-11 place-items-center rounded-full bg-black/5"><X /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

type Line = { productId: string; qty: number; unitPrice: number };

function SaleForm({ products, rate, onDone }: { products: Product[]; rate: number; onDone: () => void }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [pick, setPick] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("efectivo");
  const [trade, setTrade] = useState(false);
  const [tradeDesc, setTradeDesc] = useState("");
  const [tradeValue, setTradeValue] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const byId = (id: string) => products.find((p) => p.id === id)!;
  const available = products.filter((p) => p.stock > 0 && !lines.some((l) => l.productId === p.id));
  // todo en pesos con la cotización del día
  const curOf = (id: string) => byId(id).currency;
  const gross = Math.round(lines.reduce((s, l) => s + l.qty * l.unitPrice * (curOf(l.productId) === "USD" ? rate : 1), 0));
  const usdLines = lines.filter((l) => curOf(l.productId) === "USD").reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const total = Math.max(0, gross - (trade ? tradeValue : 0));
  const num = (v: string) => Number(v.replace(/\D/g, "")) || 0;

  function add(id: string) {
    const p = byId(id);
    if (p) setLines((l) => [...l, { productId: id, qty: 1, unitPrice: p.cashPrice || p.price }]);
    setPick("");
  }

  function submit() {
    setError(null);
    start(async () => {
      const r = await registerSale({
        items: lines,
        payment,
        tradeIn: trade && tradeValue ? { description: tradeDesc || "Equipo usado", value: tradeValue } : undefined,
        note,
      });
      if ("error" in r) setError(r.error ?? "Error");
      else onDone();
    });
  }

  return (
    <div className="space-y-4">
      <Field label="¿Qué vendiste?">
        <Select value={pick} onChange={(e) => add(e.target.value)}>
          <option value="">Elegí un producto…</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.storage ?? ""} {p.colorName ?? ""} — {p.priceOnRequest ? "a consultar" : inCurrency(p.cashPrice || p.price, p.currency)} (stock {p.stock})
            </option>
          ))}
        </Select>
      </Field>

      {lines.map((l, i) => {
        const p = byId(l.productId);
        return (
          <Card key={l.productId} className="!p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{p.name} <span className="font-normal text-text-mute">{p.storage}</span></p>
              <button aria-label="Quitar" onClick={() => setLines(lines.filter((_, j) => j !== i))} className="text-text-mute"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-3 grid grid-cols-[110px_1fr] gap-3">
              <Field label="Cantidad">
                <Input type="number" min={1} max={p.stock} value={l.qty} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, qty: Math.min(p.stock, Math.max(1, Number(e.target.value))) } : x)))} />
              </Field>
              <Field
                label={`Precio unitario (${p.currency === "USD" ? "U$S" : "$"})`}
                hint={[p.cashPrice && `Efectivo ${inCurrency(p.cashPrice, p.currency)}`, `Lista ${inCurrency(p.price, p.currency)}`].filter(Boolean).join(" · ")}
              >
                <Input inputMode="numeric" value={l.unitPrice.toLocaleString("es-AR")} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, unitPrice: num(e.target.value) } : x)))} />
              </Field>
            </div>
          </Card>
        );
      })}

      <Field label="Medio de pago">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {PAYMENTS.map(([k, label]) => (
            <button key={k} type="button" onClick={() => setPayment(k)} className={clsx("h-11 rounded-xl text-sm font-semibold transition", payment === k ? "bg-text-dark text-white" : "bg-white")}>
              {label}
            </button>
          ))}
        </div>
      </Field>

      <button type="button" onClick={() => setTrade(!trade)} className={clsx("flex w-full items-center gap-3 rounded-2xl p-4 text-left font-semibold ring-1", trade ? "bg-violet/10 ring-violet/30" : "bg-white ring-black/5")}>
        <ArrowLeftRight className="h-5 w-5 text-violet" /> Entregó un equipo en parte de pago (plan canje)
      </button>
      {trade && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Equipo recibido"><Input value={tradeDesc} onChange={(e) => setTradeDesc(e.target.value)} placeholder="iPhone 11 64 GB" /></Field>
          <Field label="Se lo tomamos en ($)"><Input inputMode="numeric" value={tradeValue ? tradeValue.toLocaleString("es-AR") : ""} onChange={(e) => setTradeValue(num(e.target.value))} /></Field>
        </div>
      )}

      <Field label="Nota (opcional)"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Cliente, número de serie, etc." /></Field>

      <div className="rounded-2xl bg-white p-4">
        {trade && tradeValue > 0 && (
          <p className="flex justify-between text-text-mute"><span>Subtotal</span><span>{money(gross)}</span></p>
        )}
        {trade && tradeValue > 0 && (
          <p className="flex justify-between text-violet"><span>Canje</span><span>−{money(tradeValue)}</span></p>
        )}
        <p className="font-display flex justify-between text-2xl font-bold"><span>Cobrás</span><span>{money(total)}</span></p>
        {usdLines > 0 && (
          <p className="mt-1 text-right text-sm text-text-mute">
            Equipos en dólares: {usd(usdLines)} (dólar a {money(rate)})
          </p>
        )}
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>}
      <Button variant="brand" className="h-14 w-full text-lg" disabled={!lines.length || pending} onClick={submit}>
        <Plus className="h-5 w-5" /> {pending ? "Guardando…" : "Registrar venta"}
      </Button>
    </div>
  );
}

function StockForm({ products, onDone }: { products: Product[]; onDone: () => void }) {
  const [id, setId] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="space-y-4">
      <Field label="Producto" hint="¿Es un producto nuevo? Cargalo desde Productos › Nuevo producto.">
        <Select value={id} onChange={(e) => setId(e.target.value)}>
          <option value="">Elegí un producto…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} {p.storage ?? ""} (hay {p.stock})</option>
          ))}
        </Select>
      </Field>
      <Field label="¿Cuántas unidades entraron?">
        <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} className="text-xl font-bold" />
      </Field>
      <Field label="Nota (opcional)"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Proveedor, factura…" /></Field>
      <Button variant="brand" className="h-14 w-full text-lg" disabled={!id || pending} onClick={() => start(async () => { await addStock(id, qty, note || undefined); onDone(); })}>
        <PackagePlus className="h-5 w-5" /> {pending ? "Guardando…" : "Sumar al stock"}
      </Button>
    </div>
  );
}
