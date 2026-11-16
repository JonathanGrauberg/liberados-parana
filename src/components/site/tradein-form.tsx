"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { inCurrency, money, toArs, usd, waLink } from "@/lib/format";
import { DEFAULT_PRICING, LOOKS, estimateTradeIn } from "@/lib/tradein";
import { WhatsAppIcon } from "./icons";
import { CountUp } from "./Price";
import { ProductVisual } from "./ProductVisual";
import { useSite } from "./SiteContext";

/**
 * Lógica y piezas del Plan Canje, compartidas por el panel flotante y la sección de la página.
 * Regla de negocio: el cliente NUNCA ve cuánto se le toma el equipo; solo cuánto paga de diferencia.
 */

const CAPACITIES = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];
const isUsed = (c: string) => c === "usado" || c === "reacondicionado";

export function useTradeInForm(targetId: string | null, setTargetId: (id: string | null) => void) {
  const { products, settings } = useSite();
  const models = settings.tradeIn.models.map((m) => m.name).filter(Boolean);
  const phones = useMemo(() => products.filter((p) => p.category === "celulares"), [products]);

  const [model, setModel] = useState("");
  const [capacity, setCapacity] = useState("");
  const [battery, setBattery] = useState("");
  const [look, setLook] = useState("");
  const [works, setWorks] = useState<"si" | "no" | "">("");
  const [fault, setFault] = useState("");
  const [parts, setParts] = useState<"No" | "Sí" | "No sé" | "">("");
  const [tab, setTab] = useState<"usados" | "nuevos">("usados");
  const [name, setName] = useState("");

  // al venir desde una tarjeta, posiciona la pestaña del equipo elegido
  useEffect(() => {
    const t = phones.find((p) => p.id === targetId);
    if (t) setTab(isUsed(t.condition) ? "usados" : "nuevos");
  }, [targetId, phones]);

  const target = phones.find((p) => p.id === targetId);
  const deviceOk = !!model && !!capacity;
  const stateOk = !!look && !!works && !!parts && (works === "si" || fault.trim().length > 2);

  // en vivo: mientras no responde algo, se calcula como si estuviera impecable; cada respuesta ajusta el número
  const maxValue = settings.tradeIn.models.find((m) => m.name === model)?.value ?? 0;
  const estimate = model
    ? estimateTradeIn(maxValue, { look: look || LOOKS[0].id, battery, works: works !== "no", parts: parts || "No" }, settings.tradeIn.pricing ?? DEFAULT_PRICING)
    : 0;
  const rate = settings.usdRate;
  const targetPrice = target && !target.priceOnRequest ? target.cashPrice || target.price : 0;
  const quoteByChat = !!model && !maxValue; // modelo sin valor cargado
  const diffCur = target?.currency ?? "USD";
  const diff = !targetPrice || quoteByChat ? null : diffCur === "USD" ? Math.max(0, targetPrice - estimate) : Math.max(0, targetPrice - toArs(estimate, "USD", rate));

  const message = [
    `¡Hola Liberados! Quiero cotizar mi iPhone con el Plan Canje${name.trim() ? ` (soy ${name.trim()})` : ""}:`,
    `• Mi equipo: ${model} ${capacity}`,
    battery ? `• Batería: ${battery} %` : "• Batería: no sé",
    `• Estado: ${look}`,
    works === "si" ? "• Funciona todo correctamente" : `• Tiene una falla: ${fault.trim()}`,
    `• Piezas cambiadas: ${parts}`,
    target ? `• Me interesa: ${target.name}${target.storage ? " " + target.storage : ""}${target.colorName ? " " + target.colorName : ""}` : "• Todavía no elegí el nuevo",
    diff !== null && stateOk ? `• Diferencia estimada en la web: ${inCurrency(diff, diffCur)} en efectivo` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const send = () => window.open(waLink(settings.contact.whatsapp, message), "_blank");

  return {
    settings, models, phones, target, targetId, setTargetId,
    model, setModel, capacity, setCapacity, battery, setBattery,
    look, setLook, works, setWorks, fault, setFault, parts, setParts,
    tab, setTab, name, setName,
    deviceOk, stateOk, diff, diffCur, rate, send,
  };
}

export type TradeInForm = ReturnType<typeof useTradeInForm>;

/**
 * Autoscroll: al tocar una opción, se pasa sola a la pregunta siguiente.
 * Se pone como onClick del contenedor de las preguntas; `scrollTo` decide cómo bajar (página o panel).
 * Las opciones con `stay` (ej.: "Tiene alguna falla", que abre un texto) no avanzan.
 */
export function autoAdvance(scrollTo: (el: HTMLElement) => void) {
  return (e: MouseEvent<HTMLElement>) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("button[aria-pressed], button[data-next]");
    if (!btn || btn.dataset.stay != null) return;
    const qs = [...e.currentTarget.querySelectorAll<HTMLElement>("[data-q]")];
    const next = qs[qs.indexOf(btn.closest<HTMLElement>("[data-q]")!) + 1];
    if (next) setTimeout(() => scrollTo(next), 280);
  };
}

export function Q({ n, title, hint, children }: { n?: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <div data-q>
      <h3 className="flex items-center gap-2.5 font-display text-[23px] font-bold tracking-tight md:text-2xl">
        {n != null && <span className="bg-brand grid h-8 w-8 shrink-0 place-items-center rounded-full text-[15px] font-extrabold text-white">{n}</span>}
        {title}
      </h3>
      {hint && <p className="mt-1 text-[15px] text-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function Option({ active, onClick, children, className, stay }: { active: boolean; onClick: () => void; children: ReactNode; className?: string; stay?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-stay={stay || undefined}
      className={clsx(
        "min-h-12 rounded-2xl px-4 py-3 text-left text-[17px] font-medium transition active:scale-[.98]",
        active ? "bg-fg text-ink shadow-[0_10px_30px_-8px_rgba(62,230,232,.45)]" : "bg-fg/[.06] text-fg ring-1 ring-line hover:bg-fg/[.1]",
        className,
      )}
    >
      {children}
    </button>
  );
}

const inputCls = "h-12 w-full rounded-2xl bg-fg/[.06] px-4 text-[17px] text-fg outline-none ring-1 ring-line placeholder:text-muted focus:ring-2 focus:ring-cyan/60";

/** Elegir el equipo que se quiere llevar (usados / nuevos). */
/** `onPicked`: se llama al elegir un equipo (para pasar solo al paso 2). */
export function PhonePicker({ f, grid, onPicked }: { f: TradeInForm; grid?: boolean; onPicked?: () => void }) {
  return (
    <>
      <div className="mb-3 flex gap-6 border-b border-line">
        {(["usados", "nuevos"] as const).map((t) => (
          <button key={t} type="button" onClick={() => f.setTab(t)} className={clsx("relative pb-3 text-[17px] font-semibold", f.tab === t ? "text-fg" : "text-muted")}>
            {t === "usados" ? "Usados seleccionados" : "Nuevos en caja"}
            {f.tab === t && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-brand-line" />}
          </button>
        ))}
      </div>
      <div className={clsx("grid gap-2", grid && "sm:grid-cols-2")}>
        {f.phones
          .filter((p) => (f.tab === "usados" ? isUsed(p.condition) : !isUsed(p.condition)))
          .map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                const pick = f.targetId !== p.id;
                f.setTargetId(pick ? p.id : null);
                if (pick) onPicked?.();
              }}
              className={clsx("flex items-center gap-3 rounded-2xl p-2 pr-3 text-left ring-1 transition", f.targetId === p.id ? "bg-fg/[.1] ring-cyan/70" : "bg-fg/[.03] ring-line hover:bg-fg/[.06]")}
            >
              <span className="h-14 w-14 shrink-0">
                <ProductVisual product={p} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-medium">{p.name} <span className="text-muted">{p.storage}</span></span>
                <span className="block text-[14px] text-muted">{[p.colorName, p.battery ? `Batería ${p.battery}%` : null].filter(Boolean).join(" · ")}</span>
              </span>
              {f.targetId === p.id && <Check className="h-4 w-4 shrink-0 text-accent" />}
            </button>
          ))}
      </div>
      {/* el equipo que busca no está en la web: lo mandamos a WhatsApp */}
      <a
        href={waLink(f.settings.contact.whatsapp, "¡Hola Liberados! Quiero hacer el Plan Canje pero no encuentro en la web el modelo que quiero. ¿Me ayudan?")}
        target="_blank"
        rel="noopener"
        className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-line-strong px-4 py-3 transition hover:bg-fg/[.05]"
      >
        <span className="text-[16px] font-medium text-fg/85">No encuentro el modelo que quiero</span>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#1fae55] px-4 py-2 text-[15px] font-semibold text-white">
          <WhatsAppIcon className="h-4 w-4" /> Consultar
        </span>
      </a>
    </>
  );
}

/** Modelo, capacidad y batería. `grid`: modelos como botones (sección); si no, un desplegable (panel). */
export function DeviceQuestions({ f, grid, numbered }: { f: TradeInForm; grid?: boolean; numbered?: number }) {
  const n = (i: number) => (numbered != null ? numbered + i : undefined);
  return (
    <>
      <Q n={n(0)} title="¿Qué iPhone tenés?">
        {grid ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {f.models.map((m) => (
              <Option key={m} active={f.model === m} onClick={() => f.setModel(m)} className="!min-h-11 !py-2.5 !text-[16px]">
                {m}
              </Option>
            ))}
          </div>
        ) : (
          <select value={f.model} onChange={(e) => f.setModel(e.target.value)} className={clsx(inputCls, "[&>option]:text-text-dark")}>
            <option value="">Elegí el modelo</option>
            {f.models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
      </Q>
      <Q n={n(1)} title="Capacidad">
        <div className="flex flex-wrap gap-2">
          {CAPACITIES.map((o) => (
            <Option key={o} active={f.capacity === o} onClick={() => f.setCapacity(o)}>{o}</Option>
          ))}
        </div>
      </Q>
      <Q n={n(2)} title="Salud de batería" hint="En el iPhone: Ajustes › Batería › Estado. Si no sabés, dejalo vacío.">
        <div className="flex items-center gap-2">
          <div className="relative w-40">
            <input
              inputMode="numeric"
              enterKeyHint="done"
              value={f.battery}
              onChange={(e) => f.setBattery(e.target.value.replace(/\D/g, "").slice(0, 3))}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                e.currentTarget.parentElement?.parentElement?.querySelector<HTMLButtonElement>("[data-next]")?.click();
              }}
              placeholder="Ej.: 87"
              className={clsx(inputCls, "pr-9")}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">%</span>
          </div>
          {/* cierra el teclado y pasa a la pregunta siguiente */}
          <button
            type="button"
            data-next
            onClick={() => (document.activeElement as HTMLElement | null)?.blur()}
            className="bg-brand flex h-12 items-center gap-1.5 rounded-2xl px-5 text-[17px] font-bold text-white transition hover:brightness-125"
          >
            <Check className="h-5 w-5" /> {f.battery ? "Listo" : "No sé"}
          </button>
        </div>
      </Q>
    </>
  );
}

/** Estado, fallas y piezas. */
export function StateQuestions({ f, grid, numbered }: { f: TradeInForm; grid?: boolean; numbered?: number }) {
  const n = (i: number) => (numbered != null ? numbered + i : undefined);
  return (
    <>
      <Q n={n(0)} title="¿Cómo está por fuera?">
        <div className={clsx("grid gap-2", grid && "sm:grid-cols-2")}>
          {LOOKS.map((l) => (
            <Option key={l.id} active={f.look === l.id} onClick={() => f.setLook(l.id)}>
              <span className="block">{l.id}</span>
              <span className="block text-[14px] opacity-65">{l.hint}</span>
            </Option>
          ))}
        </div>
      </Q>
      <Q n={n(1)} title="¿Funciona todo bien?">
        <div className="grid grid-cols-2 gap-2">
          <Option active={f.works === "si"} onClick={() => f.setWorks("si")}>Sí, todo funciona</Option>
          <Option active={f.works === "no"} onClick={() => f.setWorks("no")} stay>Tiene alguna falla</Option>
        </div>
        {f.works === "no" && (
          <textarea
            value={f.fault}
            onChange={(e) => f.setFault(e.target.value.slice(0, 140))}
            rows={2}
            placeholder="¿Qué falla? (Face ID, cámara, parlante…)"
            className="mt-2 w-full rounded-2xl bg-fg/[.06] p-3 text-[17px] text-fg outline-none ring-1 ring-line placeholder:text-muted focus:ring-2 focus:ring-cyan/60"
          />
        )}
      </Q>
      <Q n={n(2)} title="¿Le cambiaron alguna pieza?" hint="Pantalla, batería, cámara…">
        <div className="grid grid-cols-3 gap-2">
          {(["No", "Sí", "No sé"] as const).map((v) => (
            <Option key={v} active={f.parts === v} onClick={() => f.setParts(v)}>{v}</Option>
          ))}
        </div>
      </Q>
    </>
  );
}

export function NameField({ f, n }: { f: TradeInForm; n?: number }) {
  return (
    <Q n={n} title="Tu nombre" hint="Opcional, para saber con quién hablamos.">
      <input value={f.name} onChange={(e) => f.setName(e.target.value.slice(0, 40))} className={inputCls} />
    </Q>
  );
}

/** "Para llevarte el X pagás: U$S …" con el número contando. Nunca muestra el valor del usado. */
export function LiveResult({ f, big }: { f: TradeInForm; big?: boolean }) {
  const { target, diff, diffCur, rate, model } = f;
  if (!target)
    return (
      <p className={clsx("relative text-fg/80", big ? "text-xl" : "text-[16px]")}>
        Elegí el iPhone que te querés llevar y mirá en vivo cuánto pagás con tu usado.
      </p>
    );
  return (
    <div className="relative">
      <p className={clsx("text-fg/85", big ? "text-xl" : "text-[16px]")}>
        Para llevarte el <b className="text-fg">{target.name}{target.storage ? " " + target.storage : ""}</b> pagás:
      </p>
      {diff !== null ? (
        <div className="flex flex-wrap items-baseline gap-x-3">
          <CountUp
            value={diff}
            format={diffCur === "USD" ? usd : money}
            duration={1.1}
            className={clsx("font-display text-white font-extrabold leading-tight tracking-tight", big ? "text-[clamp(48px,6vw,76px)]" : "text-[34px] md:text-[42px]")}
          />
          {diffCur === "USD" && rate > 0 && (
            <span className={clsx("text-white", big ? "text-lg" : "text-[15px]")}>
              ≈ <CountUp value={toArs(diff, "USD", rate)} format={money} duration={1.1} /> efectivo
            </span>
          )}
        </div>
      ) : (
        <p className="mt-1 font-display text-xl font-bold">{target.priceOnRequest ? "Consultá el precio por WhatsApp" : "Te lo cotizamos por WhatsApp"}</p>
      )}
      <p className="text-[13px] text-white/85">{model ? "Estimado. Lo confirmamos al ver tu equipo." : "Elegí tu iPhone y mirá cómo baja."}</p>
    </div>
  );
}
