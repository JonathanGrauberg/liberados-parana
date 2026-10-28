"use client";

import { Check, ImagePlus, Loader2, Plus, RotateCcw, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { saveSettings } from "@/lib/actions";
import type { Settings, TradeInPricing } from "@/lib/types";
import { DEFAULT_PRICING, LOOKS, estimateTradeIn } from "@/lib/tradein";
import { processImage, uploadBlob } from "@/lib/image-client";
import { Button, Card, Field, Input } from "./ui";

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
      <HeroPhotoCard initial={settings.heroImage} />

      <Card className="space-y-4">
        <h2 className="font-display text-xl font-bold">Plan canje: modelos y valores</h2>
        <p className="text-sm text-text-mute">Valor máximo (en dólares) que toman cada modelo impecable y con buena batería. <b>El cliente nunca ve este valor</b>: la web solo le muestra cuánto paga de diferencia por el equipo que elige. En 0 = “te lo cotizamos por WhatsApp”.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {s.tradeIn.models.map((m, i) => (
            <div key={m.id} className="flex gap-2">
              <Input value={m.name} maxLength={28} onChange={(e) => edit({ tradeIn: { ...s.tradeIn, models: s.tradeIn.models.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) } })} />
              <div className="relative w-32 shrink-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-mute">U$S</span>
                <Input inputMode="numeric" className="pl-12" value={m.value || ""} placeholder="0" onChange={(e) => edit({ tradeIn: { ...s.tradeIn, models: s.tradeIn.models.map((x, j) => (j === i ? { ...x, value: num(e.target.value) } : x)) } })} />
              </div>
              <button type="button" aria-label="Quitar modelo" onClick={() => edit({ tradeIn: { ...s.tradeIn, models: s.tradeIn.models.filter((_, j) => j !== i) } })} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-text-mute hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={() => edit({ tradeIn: { ...s.tradeIn, models: [...s.tradeIn.models, { id: crypto.randomUUID(), name: "", value: 0 }] } })}>
          <Plus className="h-4 w-4" /> Agregar modelo
        </Button>
        <Field label="Aclaración que se muestra al cliente (al final del formulario)">
          <Input value={s.tradeIn.note} maxLength={120} onChange={(e) => edit({ tradeIn: { ...s.tradeIn, note: e.target.value } })} />
        </Field>
      </Card>

      <PricingCard pricing={s.tradeIn.pricing ?? DEFAULT_PRICING} example={s.tradeIn.models.find((m) => m.value > 0)} onChange={(pricing) => edit({ tradeIn: { ...s.tradeIn, pricing } })} />

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
          Se muestra fijo arriba de toda la web como “Dólar blue hoy”. Con este mismo valor la web pasa a pesos los precios en dólares y el panel convierte las ventas.
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

/** Foto de portada: la que encabeza la web. */
function HeroPhotoCard({ initial }: { initial?: string }) {
  const [img, setImg] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  async function upload(f?: File) {
    if (!f) return;
    setBusy(true);
    try {
      const { blob } = await processImage(f, { trim: false });
      const url = await uploadBlob(blob);
      setImg(url);
      start(async () => {
        await saveSettings({ heroImage: url });
        setSaved(true);
      });
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Foto de portada</h2>
        <p className="text-sm text-text-mute">La foto grande que encabeza la web. Ideal: el frente del local o el mostrador, horizontal y bien iluminada.</p>
      </div>
      <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img || "/local-cartel.jpg"} alt="Portada actual" className="h-full w-full object-cover opacity-90" />
        {(busy || pending) && (
          <div className="absolute inset-0 grid place-items-center bg-black/50 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="primary" disabled={busy || pending} onClick={() => file.current?.click()}>
          <ImagePlus className="h-4 w-4" /> Cambiar foto
        </Button>
        {img && (
          <Button
            type="button"
            variant="ghost"
            disabled={busy || pending}
            onClick={() =>
              start(async () => {
                await saveSettings({ heroImage: "" });
                setImg(undefined);
                setSaved(true);
              })
            }
          >
            <RotateCcw className="h-4 w-4" /> Volver a la del cartel
          </Button>
        )}
        {saved && !pending && <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
      <input ref={file} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
    </Card>
  );
}

/** Porcentajes del valor máximo según lo que responde el cliente. */
function PricingCard({ pricing, example, onChange }: { pricing: TradeInPricing; example?: { name: string; value: number }; onChange: (p: TradeInPricing) => void }) {
  const pct = (v: string) => Math.min(100, Number(v.replace(/\D/g, "")) || 0);
  const row = (label: string, value: number, set: (n: number) => void) => (
    <label key={label} className="flex items-center justify-between gap-3 rounded-xl bg-black/[.03] px-3 py-2">
      <span className="text-sm">{label}</span>
      <span className="relative w-24 shrink-0">
        <Input inputMode="numeric" className="pr-8 text-right" value={value} onChange={(e) => set(pct(e.target.value))} />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-mute">%</span>
      </span>
    </label>
  );
  const ex = example ? estimateTradeIn(example.value, { look: "Bueno, marcas leves", battery: "82", works: true, parts: "No" }, pricing) : 0;

  return (
    <Card className="space-y-4">
      <h2 className="font-display text-xl font-bold">Plan canje: cómo se calcula</h2>
      <p className="text-sm text-text-mute">Cada respuesta toma un % del valor máximo y se multiplican entre sí. 100 % = no descuenta nada.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Estado</p>
          {LOOKS.map((l) => row(l.id, pricing.looks[l.id] ?? 100, (n) => onChange({ ...pricing, looks: { ...pricing.looks, [l.id]: n } })))}
          <p className="pt-2 text-sm font-semibold">Falla y piezas</p>
          {row("Tiene alguna falla", pricing.fault, (n) => onChange({ ...pricing, fault: n }))}
          {row("Piezas cambiadas: sí", pricing.partsYes, (n) => onChange({ ...pricing, partsYes: n }))}
          {row("Piezas cambiadas: no sabe", pricing.partsUnknown, (n) => onChange({ ...pricing, partsUnknown: n }))}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Batería</p>
          {row("85 % o más", pricing.battery.high, (n) => onChange({ ...pricing, battery: { ...pricing.battery, high: n } }))}
          {row("80 a 84 %", pricing.battery.mid, (n) => onChange({ ...pricing, battery: { ...pricing.battery, mid: n } }))}
          {row("Menos de 80 %", pricing.battery.low, (n) => onChange({ ...pricing, battery: { ...pricing.battery, low: n } }))}
          {row("No sabe", pricing.battery.unknown, (n) => onChange({ ...pricing, battery: { ...pricing.battery, unknown: n } }))}
          {example && (
            <p className="mt-3 rounded-xl bg-black/[.04] p-3 text-sm">
              Ejemplo: {example.name} (máx. U$S {example.value}), marcas leves, batería 82 %, funciona bien → lo toman en <b>U$S {ex}</b>.
            </p>
          )}
          <Button type="button" variant="ghost" onClick={() => onChange(DEFAULT_PRICING)}>
            <RotateCcw className="h-4 w-4" /> Volver a los valores de fábrica
          </Button>
        </div>
      </div>
    </Card>
  );
}
