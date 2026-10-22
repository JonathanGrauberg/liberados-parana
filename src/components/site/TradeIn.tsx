"use client";

import clsx from "clsx";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { money, waLink } from "@/lib/format";
import { WhatsAppIcon } from "./icons";
import { Reveal } from "./Reveal";
import { useSite } from "./SiteContext";

const STATES = [
  { id: "impecable", label: "Impecable", hint: "Como nuevo, sin marcas", factor: 1 },
  { id: "muybueno", label: "Muy bueno", hint: "Marcas mínimas de uso", factor: 0.88 },
  { id: "bueno", label: "Bueno", hint: "Rayones visibles", factor: 0.74 },
  { id: "detalles", label: "Con detalles", hint: "Pantalla, cámara o botón a revisar", factor: 0.5 },
];
const BATTERY = [
  { id: "alta", label: "85 % o más", factor: 1 },
  { id: "media", label: "80 – 84 %", factor: 0.95 },
  { id: "baja", label: "Menos de 80 %", factor: 0.88 },
];

export function TradeIn() {
  const { settings, products, tradeTarget } = useSite();
  const models = settings.tradeIn.models;
  const phones = products.filter((p) => p.category === "celulares" && p.stock > 0);

  const [model, setModel] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [battery, setBattery] = useState<string>("");
  const [target, setTarget] = useState<string>("");

  useEffect(() => {
    if (tradeTarget) setTarget(tradeTarget);
  }, [tradeTarget]);

  const m = models.find((x) => x.id === model);
  const s = STATES.find((x) => x.id === state);
  const b = BATTERY.find((x) => x.id === battery);
  const t = phones.find((x) => x.id === target);
  const estimate = useMemo(() => (m && s && b ? Math.round((m.value * s.factor * b.factor) / 1000) * 1000 : 0), [m, s, b]);
  const unknownModel = m && m.value === 0;
  const diff = t ? Math.max(0, t.price - estimate) : 0;

  const message = [
    "¡Hola Liberados! Quiero cotizar mi usado con el Plan Canje:",
    m && `• Mi equipo: ${m.name}`,
    s && `• Estado: ${s.label}`,
    b && `• Batería: ${b.label}`,
    estimate ? `• Estimado web: ${money(estimate)}` : null,
    t && `• Me interesa: ${t.name}${t.storage ? " " + t.storage : ""} (${money(t.price)})`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <section id="canje" className="relative scroll-mt-16 border-t border-line bg-ink px-5 py-24 md:px-8 md:py-32">

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p className="eyebrow">06 — Plan Canje</p>
            <h2 className="title-lux mt-5 text-[clamp(38px,5vw,72px)]">
              Tu usado vale más <br />
              <b>de lo que creés.</b>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-fg/65">
              Respondé tres preguntas y te decimos al instante cuánto te tomamos tu equipo. Pagás solo la diferencia.
            </p>
          </Reveal>

          <ResultCard estimate={estimate} unknownModel={!!unknownModel} target={t} diff={diff} ready={!!(m && s && b)} />

          <a
            href={waLink(settings.contact.whatsapp, message)}
            target="_blank"
            rel="noopener"
            className={clsx(
              "btn-solid mt-5 w-full !min-h-[56px]",
              !m && "pointer-events-none opacity-30",
            )}
            aria-disabled={!m}
          >
            <WhatsAppIcon className="h-5 w-5" /> Enviar cotización por WhatsApp
          </a>
          <p className="mt-3 text-sm text-muted">{settings.tradeIn.note}</p>
        </div>

        <div className="space-y-10">
          <Step n={1} title="¿Qué equipo tenés?">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {models.map((x) => (
                <Option key={x.id} active={model === x.id} onClick={() => setModel(x.id)}>
                  {x.name}
                </Option>
              ))}
            </div>
          </Step>
          <Step n={2} title="¿En qué estado está?" disabled={!model}>
            <div className="grid gap-2 sm:grid-cols-2">
              {STATES.map((x) => (
                <Option key={x.id} active={state === x.id} onClick={() => setState(x.id)} big>
                  <span className="block text-[17px] font-normal">{x.label}</span>
                  <span className="block text-sm opacity-60">{x.hint}</span>
                </Option>
              ))}
            </div>
          </Step>
          <Step n={3} title="¿Cuánta batería tiene?" disabled={!state}>
            <p className="-mt-2 mb-3 text-sm text-muted">En iPhone: Ajustes › Batería › Estado de la batería.</p>
            <div className="grid grid-cols-3 gap-2">
              {BATTERY.map((x) => (
                <Option key={x.id} active={battery === x.id} onClick={() => setBattery(x.id)}>
                  {x.label}
                </Option>
              ))}
            </div>
          </Step>
          <Step n={4} title="¿Cuál te querés llevar?" optional disabled={!battery}>
            <div className="grid gap-2 sm:grid-cols-2">
              {phones.map((x) => (
                <Option key={x.id} active={target === x.id} onClick={() => setTarget(target === x.id ? "" : x.id)} big>
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block font-normal">{x.name}</span>
                      <span className="block text-sm opacity-60">{[x.storage, x.colorName].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="font-display shrink-0 font-light">{money(x.price)}</span>
                  </span>
                </Option>
              ))}
            </div>
          </Step>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ estimate, unknownModel, target, diff, ready }: { estimate: number; unknownModel: boolean; target?: { name: string }; diff: number; ready: boolean }) {
  return (
    <div className="mt-10 border border-line p-7">
      {unknownModel ? (
        <p className="text-lg text-fg/80">Ese modelo lo cotizamos personalmente. Mandanos la consulta por WhatsApp y te respondemos enseguida.</p>
      ) : (
        <>
          <p className="text-muted">{ready ? "Te tomamos tu equipo en hasta" : "Completá los pasos para ver el valor"}</p>
          <Counter value={estimate} className="font-display mt-1 text-[clamp(44px,5.5vw,64px)] font-light leading-none tracking-tight" />
          {target && ready && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 border-t border-line pt-5">
              <p className="text-muted">Para llevarte el {target.name} pagás</p>
              <Counter value={diff} className="font-display mt-1 text-4xl font-normal text-accent" />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

function Counter({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => money(v));
  useEffect(() => {
    const c = animate(mv, value, { duration: 1, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [mv, value]);
  return <motion.p className={className}>{text}</motion.p>;
}

function Step({ n, title, children, disabled, optional }: { n: number; title: string; children: React.ReactNode; disabled?: boolean; optional?: boolean }) {
  return (
    <motion.div
      animate={{ opacity: disabled ? 0.35 : 1 }}
      className={clsx(disabled && "pointer-events-none")}
      aria-disabled={disabled}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="eyebrow tabular-nums">{String(n).padStart(2, "0")}</span>
        <h3 className="title-lux text-2xl">{title}</h3>
        {optional && <span className="text-sm text-muted">(opcional)</span>}
      </div>
      {children}
    </motion.div>
  );
}

function Option({ active, onClick, children, big }: { active: boolean; onClick: () => void; children: React.ReactNode; big?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "relative border px-4 text-left text-[15px] transition-colors duration-300",
        big ? "py-4" : "min-h-14 py-3",
        active ? "border-fg bg-fg text-ink" : "border-line text-fg hover:border-line-strong",
      )}
    >
      {children}
    </button>
  );
}
