"use client";

import clsx from "clsx";
import { Check, ExternalLink, ImagePlus, Loader2, Moon, Sun, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { saveWelcome } from "@/lib/actions";
import { processImage, uploadBlob } from "@/lib/image-client";
import type { Product, Settings, WelcomeAction, WelcomePopup } from "@/lib/types";
import { WELCOME_ACTIONS, WELCOME_LIMITS, defaultWelcome } from "@/lib/welcome";
import { WelcomeCard } from "../site/WelcomeCard";
import { Button, Card, Field, Input, Select, Textarea, Toggle } from "./ui";

export function OffersEditor({ settings, products }: { settings: Settings; products: Product[] }) {
  return (
    <div className="space-y-6">
      <WelcomeEditor initial={settings.welcome ?? defaultWelcome} products={products} />
    </div>
  );
}

/* ───────────── Cartel de bienvenida ───────────── */

function WelcomeEditor({ initial, products }: { initial: WelcomePopup; products: Product[] }) {
  const [w, setW] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const set = <K extends keyof WelcomePopup>(k: K, v: WelcomePopup[K]) => {
    setSaved(false);
    setW((x) => ({ ...x, [k]: v }));
  };
  const product = products.find((p) => p.id === w.productId);
  const visible = products.filter((p) => p.visible);

  async function upload(f?: File) {
    if (!f) return;
    setUploading(true);
    try {
      const { blob } = await processImage(f, { trim: false });
      set("image", await uploadBlob(blob));
    } finally {
      setUploading(false);
      if (file.current) file.current.value = "";
    }
  }

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 p-5 md:p-6">
        <div>
          <h2 className="font-display text-xl font-bold">Cartel de bienvenida</h2>
          <p className="text-sm text-text-mute">Aparece una sola vez a cada persona que entra a la web. Si lo cambiás, se vuelve a mostrar una vez.</p>
        </div>
        <Toggle checked={w.enabled} onChange={(v) => set("enabled", v)} label={w.enabled ? "Se muestra" : "No se muestra"} />
      </div>

      <div className="grid xl:grid-cols-[1fr_1.1fr]">
        {/* Formulario */}
        <div className={clsx("space-y-4 p-5 md:p-6", !w.enabled && "opacity-50")}>
          <Field label="Estilo">
            <div className="grid grid-cols-2 gap-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("theme", t)}
                  className={clsx(
                    "flex h-12 items-center justify-center gap-2 rounded-xl border text-[15px] font-semibold transition",
                    w.theme === t ? "border-text-dark bg-text-dark text-white" : "border-black/10 bg-white",
                  )}
                >
                  {t === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} {t === "dark" ? "Oscuro" : "Claro"}
                </button>
              ))}
            </div>
          </Field>
          <Limited label="Texto chico de arriba" value={w.eyebrow} max={WELCOME_LIMITS.eyebrow} onChange={(v) => set("eyebrow", v)} placeholder="Solo esta semana" />
          <Limited label="Título" value={w.title} max={WELCOME_LIMITS.title} onChange={(v) => set("title", v)} placeholder="iPhone 15 −8%" />
          <Limited label="Texto" value={w.text} max={WELCOME_LIMITS.text} onChange={(v) => set("text", v)} placeholder="Una o dos frases cortas." area />
          <div className="grid gap-4 sm:grid-cols-2">
            <Limited label="Texto del botón" value={w.cta} max={WELCOME_LIMITS.cta} onChange={(v) => set("cta", v)} placeholder="Ver oferta" />
            <Field label="Al tocar el botón">
              <Select value={w.action} onChange={(e) => set("action", e.target.value as WelcomeAction)}>
                {Object.entries(WELCOME_ACTIONS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Producto de la imagen" hint={w.action === "producto" ? "El botón abre este producto." : undefined}>
            <Select value={w.productId ?? ""} onChange={(e) => set("productId", e.target.value || undefined)}>
              <option value="">Sin producto (logo)</option>
              {visible.map((p) => (
                <option key={p.id} value={p.id}>{p.name} {p.storage ?? ""}</option>
              ))}
            </Select>
          </Field>
          <Field label="Imagen propia (opcional)" hint="Reemplaza la foto del producto. Ideal: una foto o flyer vertical.">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" disabled={uploading} onClick={() => file.current?.click()}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} {w.image ? "Cambiar imagen" : "Subir imagen"}
              </Button>
              {w.image && (
                <Button type="button" variant="danger" onClick={() => set("image", undefined)}>
                  <Trash2 className="h-4 w-4" /> Quitar
                </Button>
              )}
            </div>
            <input ref={file} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
          </Field>
        </div>

        {/* Vista previa */}
        <div className="flex flex-col gap-3 bg-[#1a1a1f] p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Vista previa</p>
          <div className="flex flex-1 items-center justify-center">
            <div className="pointer-events-none w-full">
              <WelcomeCard w={w} product={product} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/5 p-5 md:p-6">
        <Button variant="brand" className="h-12" disabled={pending} onClick={() => start(async () => { await saveWelcome(w); setSaved(true); })}>
          {saved ? <><Check className="h-5 w-5" /> Guardado</> : pending ? "Guardando…" : "Guardar cartel"}
        </Button>
        <a href="/?cartel=1" target="_blank" className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-[15px] font-semibold text-violet hover:bg-violet/5">
          <ExternalLink className="h-4 w-4" /> Ver en la web
        </a>
      </div>
    </Card>
  );
}

function Limited({ label, value, max, onChange, placeholder, area }: { label: string; value: string; max: number; onChange: (v: string) => void; placeholder?: string; area?: boolean }) {
  const left = max - value.length;
  return (
    <Field label={label}>
      <div className="relative">
        {area ? (
          <Textarea value={value} maxLength={max} rows={3} onChange={(e) => onChange(e.target.value.slice(0, max))} placeholder={placeholder} className="!min-h-24 pr-14" />
        ) : (
          <Input value={value} maxLength={max} onChange={(e) => onChange(e.target.value.slice(0, max))} placeholder={placeholder} className="pr-14" />
        )}
        <span className={clsx("pointer-events-none absolute bottom-3 right-3 text-xs tabular-nums", left <= 3 ? "font-bold text-amber-600" : "text-text-mute")}>
          {value.length}/{max}
        </span>
      </div>
    </Field>
  );
}
