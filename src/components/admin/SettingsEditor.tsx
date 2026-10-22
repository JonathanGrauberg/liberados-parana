"use client";

import { Check, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { saveSettings } from "@/lib/actions";
import type { Settings } from "@/lib/types";
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
      <Card className="space-y-4">
        <h2 className="font-display text-xl font-bold">Plan canje: cuánto tomamos cada equipo</h2>
        <p className="text-sm text-text-mute">Es el valor máximo (equipo impecable, batería 85 % o más). La web descuenta según el estado que elige el cliente. Si ponés 0, se cotiza por WhatsApp.</p>
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
