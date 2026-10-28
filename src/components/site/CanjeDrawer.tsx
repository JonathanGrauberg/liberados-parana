"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowLeftRight, ArrowRight, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { waLink } from "@/lib/format";
import { WhatsAppIcon } from "./icons";
import { ProductVisual } from "./ProductVisual";
import { useSite } from "./SiteContext";

const ease = [0.16, 1, 0.3, 1] as const;
const CAPACITIES = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];
const LOOKS = [
  { id: "Impecable", hint: "Como nuevo, sin marcas" },
  { id: "Bueno, marcas leves", hint: "Detalles mínimos de uso" },
  { id: "Marcas visibles", hint: "Rayones o golpes a la vista" },
  { id: "Dañado o roto", hint: "Pantalla, tapa o cámara rota" },
];
const STEPS = ["Tu iPhone", "Estado", "Tu próximo iPhone"];

/** Botón flotante del Plan Canje: pestaña a la derecha en PC, botón abajo en celular. */
export function CanjeTrigger() {
  const { startTradeIn, canjeOpen } = useSite();
  if (canjeOpen) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => startTradeIn()}
        className="group fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 border border-r-0 border-line-strong bg-ink/90 px-3 py-5 text-fg backdrop-blur transition-colors hover:bg-fg hover:text-ink md:flex"
        aria-label="Abrir Plan Canje"
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-brand" />
        <ArrowLeftRight className="h-4 w-4" />
        <span className="font-display text-[11px] uppercase tracking-[0.24em] [writing-mode:vertical-rl] rotate-180">Plan canje · Cotizá tu usado</span>
      </button>
      <button
        type="button"
        onClick={() => startTradeIn()}
        className="font-display fixed bottom-5 left-5 z-40 flex h-14 items-center gap-2.5 border border-line-strong bg-ink/90 px-5 text-[11px] uppercase tracking-[0.18em] text-fg shadow-[0_12px_30px_rgba(0,0,0,.35)] backdrop-blur md:hidden"
      >
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-brand" />
        <ArrowLeftRight className="h-4 w-4" /> Entregar mi iPhone
      </button>
    </>
  );
}

function useIsDesktop() {
  const [d, setD] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setD(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return d;
}

/** Formulario del Plan Canje. No muestra valores: arma el mensaje y lo manda por WhatsApp. */
export function CanjeDrawer() {
  const { canjeOpen, closeTradeIn, tradeTarget, setTradeTarget, products, settings } = useSite();
  const desktop = useIsDesktop();
  const models = settings.tradeIn.models.map((m) => m.name).filter(Boolean);
  const phones = useMemo(() => products.filter((p) => p.category === "celulares"), [products]);

  const [step, setStep] = useState(0);
  const [model, setModel] = useState("");
  const [capacity, setCapacity] = useState("");
  const [battery, setBattery] = useState("");
  const [look, setLook] = useState("");
  const [works, setWorks] = useState<"si" | "no" | "">("");
  const [fault, setFault] = useState("");
  const [parts, setParts] = useState<"No" | "Sí" | "No sé" | "">("");
  const [tab, setTab] = useState<"usados" | "nuevos">("usados");
  const [name, setName] = useState("");

  // al abrir desde una tarjeta, posiciona la pestaña del equipo elegido
  useEffect(() => {
    const t = phones.find((p) => p.id === tradeTarget);
    if (t) setTab(t.condition === "usado" || t.condition === "reacondicionado" ? "usados" : "nuevos");
  }, [tradeTarget, phones]);

  useEffect(() => {
    if (!canjeOpen) return;
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeTradeIn();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [canjeOpen, closeTradeIn]);

  const ok = [!!model && !!capacity, !!look && !!works && !!parts && (works === "si" || fault.trim().length > 2), true];
  const target = phones.find((p) => p.id === tradeTarget);

  const message = [
    `¡Hola Liberados! Quiero cotizar mi iPhone con el Plan Canje${name.trim() ? ` (soy ${name.trim()})` : ""}:`,
    `• Mi equipo: ${model} ${capacity}`,
    battery ? `• Batería: ${battery} %` : "• Batería: no sé",
    `• Estado: ${look}`,
    works === "si" ? "• Funciona todo correctamente" : `• Tiene una falla: ${fault.trim()}`,
    `• Piezas cambiadas: ${parts}`,
    target ? `• Me interesa: ${target.name}${target.storage ? " " + target.storage : ""}${target.colorName ? " " + target.colorName : ""}` : "• Todavía no elegí el nuevo",
  ].join("\n");

  function send() {
    window.open(waLink(settings.contact.whatsapp, message), "_blank");
  }

  const panel = desktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" }, className: "inset-y-0 right-0 w-[min(480px,100vw)] border-l" }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, className: "inset-x-0 bottom-0 max-h-[92dvh] border-t" };

  return (
    <AnimatePresence>
      {canjeOpen && (
        <motion.div className="fixed inset-0 z-[65]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Cerrar Plan Canje" onClick={closeTradeIn} className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Plan Canje"
            data-lenis-prevent
            initial={panel.initial}
            animate={panel.animate}
            exit={panel.exit}
            transition={{ duration: 0.6, ease }}
            className={clsx("absolute flex flex-col border-line bg-ink text-fg", panel.className)}
          >
            <div aria-hidden className="h-[2px] shrink-0 bg-brand" />
            {/* encabezado */}
            <div className="border-b border-line px-6 pb-4 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Plan Canje</p>
                  <h2 className="title-lux mt-2 text-2xl !font-medium">Entregá tu iPhone</h2>
                  <p className="mt-1 text-sm text-muted">Contanos cómo está y te pasamos la cotización por WhatsApp.</p>
                </div>
                <button type="button" onClick={closeTradeIn} aria-label="Cerrar" className="grid h-10 w-10 shrink-0 place-items-center border border-line transition hover:border-fg hover:bg-fg hover:text-ink">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Pasos">
                {STEPS.map((s, i) => (
                  <li key={s}>
                    <span className={clsx("block h-px transition-colors duration-500", i <= step ? "bg-brand" : "bg-line-strong")} />
                    <span className={clsx("font-display mt-2 block text-[10px] uppercase tracking-[0.16em]", i === step ? "text-fg" : "text-muted")}>
                      {i + 1}. {s}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* contenido */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease }} className="space-y-7">
                  {step === 0 && (
                    <>
                      <Q title="¿Qué iPhone tenés?">
                        <select
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          className="h-12 w-full border border-line bg-transparent px-3 text-[16px] text-fg outline-none focus:border-line-strong [&>option]:text-text-dark"
                        >
                          <option value="">Elegí el modelo</option>
                          {models.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </Q>
                      <Q title="Capacidad">
                        <Chips options={CAPACITIES} value={capacity} onChange={setCapacity} />
                      </Q>
                      <Q title="Salud de batería" hint="En el iPhone: Ajustes › Batería › Estado. Si no sabés, dejalo vacío.">
                        <div className="relative w-40">
                          <input
                            inputMode="numeric"
                            value={battery}
                            onChange={(e) => setBattery(e.target.value.replace(/\D/g, "").slice(0, 3))}
                            placeholder="Ej.: 87"
                            className="h-12 w-full border border-line bg-transparent px-3 pr-9 text-[16px] text-fg outline-none placeholder:text-muted focus:border-line-strong"
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">%</span>
                        </div>
                      </Q>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <Q title="¿Cómo está por fuera?">
                        <div className="grid gap-2">
                          {LOOKS.map((l) => (
                            <Option key={l.id} active={look === l.id} onClick={() => setLook(l.id)}>
                              <span className="block">{l.id}</span>
                              <span className="block text-xs opacity-60">{l.hint}</span>
                            </Option>
                          ))}
                        </div>
                      </Q>
                      <Q title="¿Funciona todo bien?">
                        <div className="grid grid-cols-2 gap-2">
                          <Option active={works === "si"} onClick={() => setWorks("si")}>Sí, todo funciona</Option>
                          <Option active={works === "no"} onClick={() => setWorks("no")}>Tiene alguna falla</Option>
                        </div>
                        {works === "no" && (
                          <textarea
                            value={fault}
                            onChange={(e) => setFault(e.target.value.slice(0, 140))}
                            rows={2}
                            placeholder="¿Qué falla? (Face ID, cámara, parlante…)"
                            className="mt-2 w-full border border-line bg-transparent p-3 text-[15px] text-fg outline-none placeholder:text-muted focus:border-line-strong"
                          />
                        )}
                      </Q>
                      <Q title="¿Le cambiaron alguna pieza?" hint="Pantalla, batería, cámara…">
                        <div className="grid grid-cols-3 gap-2">
                          {(["No", "Sí", "No sé"] as const).map((v) => (
                            <Option key={v} active={parts === v} onClick={() => setParts(v)}>{v}</Option>
                          ))}
                        </div>
                      </Q>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Q title="¿Por cuál lo querés cambiar?" hint="Opcional: si todavía no sabés, te asesoramos.">
                        <div className="mb-3 flex gap-6 border-b border-line">
                          {(["usados", "nuevos"] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTab(t)}
                              className={clsx("font-display relative pb-3 text-[11px] uppercase tracking-[0.2em]", tab === t ? "text-fg" : "text-muted")}
                            >
                              {t === "usados" ? "Usados seleccionados" : "Nuevos en caja"}
                              {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-brand" />}
                            </button>
                          ))}
                        </div>
                        <div className="grid gap-2">
                          {phones
                            .filter((p) => (tab === "usados" ? p.condition === "usado" || p.condition === "reacondicionado" : p.condition !== "usado" && p.condition !== "reacondicionado"))
                            .map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setTradeTarget(tradeTarget === p.id ? null : p.id)}
                                className={clsx("flex items-center gap-3 border p-2 pr-3 text-left transition-colors", tradeTarget === p.id ? "border-fg bg-fg/[.06]" : "border-line hover:border-line-strong")}
                              >
                                <span className="h-12 w-12 shrink-0">
                                  <ProductVisual product={p} />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[15px]">{p.name} <span className="text-muted">{p.storage}</span></span>
                                  <span className="block text-xs text-muted">{[p.colorName, p.battery ? `Batería ${p.battery}%` : null].filter(Boolean).join(" · ")}</span>
                                </span>
                                {tradeTarget === p.id && <Check className="h-4 w-4 shrink-0 text-accent" />}
                              </button>
                            ))}
                        </div>
                      </Q>
                      <Q title="Tu nombre" hint="Opcional, para saber con quién hablamos.">
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value.slice(0, 40))}
                          className="h-12 w-full border border-line bg-transparent px-3 text-[16px] text-fg outline-none focus:border-line-strong"
                        />
                      </Q>
                      <p className="border-brand border-l pl-3 text-sm text-muted">{settings.tradeIn.note}</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* pie */}
            <div className="flex gap-2 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {step > 0 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="btn-outline">
                  <ArrowLeft className="h-4 w-4" /> Atrás
                </button>
              ) : (
                <button type="button" onClick={closeTradeIn} className="btn-outline">
                  Cerrar
                </button>
              )}
              {step < 2 ? (
                <button type="button" disabled={!ok[step]} onClick={() => setStep(step + 1)} className="btn-solid flex-1 disabled:pointer-events-none disabled:opacity-30">
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={send} className="btn-solid flex-1">
                  <WhatsAppIcon className="h-4 w-4" /> Enviar por WhatsApp
                </button>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Q({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="title-lux text-xl !font-medium">{title}</h3>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx("min-h-12 border px-4 py-3 text-left text-[15px] transition-colors", active ? "border-fg bg-fg text-ink" : "border-line text-fg hover:border-line-strong")}
    >
      {children}
    </button>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Option key={o} active={value === o} onClick={() => onChange(o)}>
          {o}
        </Option>
      ))}
    </div>
  );
}
