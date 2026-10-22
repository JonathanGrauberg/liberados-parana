"use client";

import { Check, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { saveSettings } from "@/lib/actions";
import { DEFAULT_BATTERY, DEFAULT_STATES, estimateTradeIn } from "@/lib/tradein";
import type { Settings } from "@/lib/types";
import { usd } from "@/lib/format";
import { Button, Card, Field, Input, Select } from "./ui";

export function SettingsEditor({ settings }: { settings: Settings }) {
  const [s, setS] = useState(settings);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const edit = (patch: Partial<Settings>) => {
    setSaved(false);
    setS({ ...s, ...patch });
  };
  const contact = (k: keyof Settings["contact"], v: string) => edit({ contact: { ...s.contact, [k]: v } });
  const num = (v: string) => Number(v.replace(/\D/g, "")) || 0;

  return (
    <div className="space-y-6">
      <DollarCard initial={settings.usdRate} updatedAt={settings.usdRateUpdatedAt} />
      <Card className="space-y-4">
        <h2 className="font-display text-xl font-bold">Plan canje: cuánto tomamos cada equipo (U$S)</h2>
        <p className="text-sm text-text-mute">Es el valor máximo en dólares (equipo impecable, batería 85 % o más). La web descuenta según el estado que elige el cliente. Si ponés 0, se cotiza por WhatsApp.</p>
        <div className="space-y-2">
          {s.tradeIn.models.map((m, i) => (
            <div key={m.id} className="flex gap-2">
              <Input value={m.name} onChange={(e) => edit({ tradeIn: { ...s.tradeIn, models: s.tradeIn.models.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) } })} />
              <Input inputMode="numeric" className="max-w-40" value={m.value ? m.value.toLocaleString("es-AR") : "0"} onChange={(e) => edit({ tradeIn: { ...s.tradeIn, models: s.tradeIn.models.map((x, j) => (j === i ? { ...x, value: num(e.target.value) } : x)) } })} />
              <button type="button" aria-label="Quitar modelo" onClick={() => edit({ tradeIn: { ...s.tradeIn, models: s.tradeIn.models.filter((_, j) => j !== i) } })} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-text-mute hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={() => edit({ tradeIn: { ...s.tradeIn, models: [...s.tradeIn.models, { id: crypto.randomUUID(), name: "", value: 0 }] } })}>
          <Plus className="h-4 w-4" /> Agregar modelo
        </Button>
        <Field label="Aclaración que se muestra al cliente">
          <Input value={s.tradeIn.note} onChange={(e) => edit({ tradeIn: { ...s.tradeIn, note: e.target.value } })} />
        </Field>
      </Card>

      <DiscountsCard tradeIn={s.tradeIn} onChange={(tradeIn) => edit({ tradeIn })} />

      <Card className="space-y-4">
        <h2 className="font-display text-xl font-bold">Contacto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono (como se muestra)"><Input value={s.contact.phone} onChange={(e) => contact("phone", e.target.value)} /></Field>
          <Field label="WhatsApp" hint="Solo números, con 54 adelante. Ej.: 543434386383"><Input inputMode="numeric" value={s.contact.whatsapp} onChange={(e) => contact("whatsapp", e.target.value.replace(/\D/g, ""))} /></Field>
          <Field label="Dirección"><Input value={s.contact.address} onChange={(e) => contact("address", e.target.value)} /></Field>
          <Field label="Ciudad"><Input value={s.contact.city} onChange={(e) => contact("city", e.target.value)} /></Field>
          <Field label="Instagram (sin @)"><Input value={s.contact.instagram} onChange={(e) => contact("instagram", e.target.value.replace("@", ""))} /></Field>
          <Field label="Búsqueda para el mapa"><Input value={s.contact.mapsQuery} onChange={(e) => contact("mapsQuery", e.target.value)} /></Field>
        </div>
      </Card>

      <div className="sticky bottom-20 z-20 lg:bottom-6">
        <Button variant="brand" className="h-14 w-full text-lg shadow-xl md:w-auto md:px-10" disabled={pending} onClick={() => start(async () => { await saveSettings({ contact: s.contact, tradeIn: s.tradeIn }); setSaved(true); })}>
          {saved ? <><Check className="h-5 w-5" /> Guardado</> : pending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}

/** Cotización del dólar: la web la usa para mostrar el precio en pesos de los equipos en dólares. */
function DollarCard({ initial, updatedAt }: { initial: number; updatedAt?: string }) {
  const [rate, setRate] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Cotización del dólar</h2>
        <p className="text-sm text-text-mute">
          Con este valor la web muestra el precio en pesos de los equipos cargados en dólares, y el panel pasa las ventas a pesos.
          {updatedAt && ` Última actualización: ${new Date(updatedAt).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}.`}
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="1 U$S =" className="w-48">
          <Input
            inputMode="numeric"
            value={rate ? rate.toLocaleString("es-AR") : ""}
            onChange={(e) => {
              setSaved(false);
              setRate(Number(e.target.value.replace(/\D/g, "")) || 0);
            }}
            className="font-display text-xl font-bold"
          />
        </Field>
        <Button variant="brand" className="h-12" disabled={pending || rate <= 0} onClick={() => start(async () => { await saveSettings({ usdRate: rate, usdRateUpdatedAt: new Date().toISOString() }); setSaved(true); })}>
          {saved ? <><Check className="h-5 w-5" /> Guardado</> : pending ? "Guardando…" : "Actualizar"}
        </Button>
      </div>
    </Card>
  );
}

/** Cuánto se descuenta por estado y por batería, con un ejemplo que se recalcula en vivo. */
function DiscountsCard({ tradeIn, onChange }: { tradeIn: Settings["tradeIn"]; onChange: (t: Settings["tradeIn"]) => void }) {
  const states = tradeIn.states ?? DEFAULT_STATES;
  const battery = tradeIn.battery ?? DEFAULT_BATTERY;
  const pct = (v: string) => Math.min(100, Math.max(0, Number(v.replace(/\D/g, "")) || 0));
  const priced = tradeIn.models.filter((m) => m.value > 0);
  const [ex, setEx] = useState({ model: priced[0]?.id ?? "", state: states[1]?.id ?? states[0].id, battery: battery[1]?.id ?? battery[0].id });
  const m = priced.find((x) => x.id === ex.model) ?? priced[0];
  const st = states.find((x) => x.id === ex.state) ?? states[0];
  const bt = battery.find((x) => x.id === ex.battery) ?? battery[0];

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Plan canje: cuánto se descuenta</h2>
        <p className="text-sm text-text-mute">
          La web calcula: <b>valor del modelo × % por estado × % por batería</b> (redondeado de a U$S 5). 100 % es el valor completo.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Según el estado</h3>
        <div className="overflow-hidden rounded-2xl border border-black/10">
          <div className="hidden grid-cols-[1fr_1.6fr_110px] gap-2 bg-black/[.03] px-3 py-2 text-xs font-semibold text-text-mute sm:grid">
            <span>Estado</span>
            <span>Descripción para el cliente</span>
            <span className="text-right">Toman</span>
          </div>
          {states.map((x, i) => (
            <div key={x.id} className="grid grid-cols-[1fr_110px] gap-2 border-t border-black/5 p-2 first:border-t-0 sm:grid-cols-[1fr_1.6fr_110px]">
              <Input value={x.label} maxLength={24} onChange={(e) => onChange({ ...tradeIn, states: states.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)) })} />
              <Input value={x.hint} maxLength={48} className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto" onChange={(e) => onChange({ ...tradeIn, states: states.map((y, j) => (j === i ? { ...y, hint: e.target.value } : y)) })} />
              <PctInput value={x.pct} onChange={(v) => onChange({ ...tradeIn, states: states.map((y, j) => (j === i ? { ...y, pct: pct(v) } : y)) })} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Según la salud de batería</h3>
        <div className="overflow-hidden rounded-2xl border border-black/10">
          {battery.map((x, i) => (
            <div key={x.id} className="grid grid-cols-[1fr_110px] gap-2 border-t border-black/5 p-2 first:border-t-0">
              <Input value={x.label} maxLength={20} onChange={(e) => onChange({ ...tradeIn, battery: battery.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)) })} />
              <PctInput value={x.pct} onChange={(v) => onChange({ ...tradeIn, battery: battery.map((y, j) => (j === i ? { ...y, pct: pct(v) } : y)) })} />
            </div>
          ))}
        </div>
      </div>

      {m && (
        <div className="rounded-2xl bg-violet/[.07] p-4">
          <p className="text-sm font-semibold">Probá un ejemplo</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Select value={m.id} onChange={(e) => setEx({ ...ex, model: e.target.value })}>
              {priced.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </Select>
            <Select value={st.id} onChange={(e) => setEx({ ...ex, state: e.target.value })}>
              {states.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </Select>
            <Select value={bt.id} onChange={(e) => setEx({ ...ex, battery: e.target.value })}>
              {battery.map((x) => <option key={x.id} value={x.id}>Batería {x.label}</option>)}
            </Select>
          </div>
          <p className="mt-3 text-[15px]">
            {usd(m.value)} × {st.pct} % × {bt.pct} % = <b className="font-display text-lg">{usd(estimateTradeIn(m.value, st.pct, bt.pct))}</b>
          </p>
        </div>
      )}
    </Card>
  );
}

function PctInput({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Input inputMode="numeric" value={String(value)} onChange={(e) => onChange(e.target.value)} className="pr-8 text-right font-semibold" aria-label="Porcentaje" />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-mute">%</span>
    </div>
  );
}
