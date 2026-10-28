"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowLeftRight, ArrowRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { WhatsAppIcon } from "./icons";
import { useSite } from "./SiteContext";
import { DeviceQuestions, LiveResult, NameField, PhonePicker, Q, StateQuestions, useTradeInForm } from "./tradein-form";

const ease = [0.16, 1, 0.3, 1] as const;
const STEPS = ["Tu próximo iPhone", "Tu iPhone", "Estado"];

/** Botón flotante del Plan Canje: pestaña a la derecha en PC, botón abajo en celular. */
export function CanjeTrigger() {
  const { startTradeIn, canjeOpen } = useSite();
  if (canjeOpen) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => startTradeIn()}
        className="group fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-l-2xl bg-brand px-3 py-5 font-bold text-[#07071a] shadow-[0_12px_40px_-10px_rgba(123,127,220,.8)] transition hover:pr-4 md:flex"
        aria-label="Abrir Plan Canje"
      >
        <ArrowLeftRight className="h-4 w-4" />
        <span className="rotate-180 text-[13px] font-bold [writing-mode:vertical-rl]">Plan canje · Cotizá tu usado</span>
      </button>
      <button
        type="button"
        onClick={() => startTradeIn()}
        className="fixed bottom-5 left-5 z-40 flex h-14 items-center gap-2 rounded-full bg-brand px-5 text-[15px] font-bold text-[#07071a] shadow-[0_12px_40px_-8px_rgba(123,127,220,.8)] md:hidden"
      >
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

/** Panel flotante del Plan Canje (derecha en PC, abajo en celular). */
export function CanjeDrawer() {
  const { canjeOpen, closeTradeIn, tradeTarget, setTradeTarget } = useSite();
  const desktop = useIsDesktop();
  const f = useTradeInForm(tradeTarget, setTradeTarget);
  const [step, setStep] = useState(0);

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

  const ok = [true, f.deviceOk, f.stateOk];

  const panel = desktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" }, className: "inset-y-0 right-0 w-[min(480px,100vw)] border-l" }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, className: "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[28px] border-t" };

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
            className={clsx("absolute flex flex-col overflow-hidden border-line bg-ink text-fg", panel.className)}
          >
            <div aria-hidden className="h-1 shrink-0 bg-brand" />
            {/* encabezado */}
            <div className="border-b border-line px-6 pb-4 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Plan Canje</p>
                  <h2 className="title-lux mt-2 text-3xl">Entregá tu <b>iPhone</b></h2>
                  <p className="mt-1 text-sm text-muted">Elegí el que te querés llevar y mirá en vivo cuánto pagás.</p>
                </div>
                <button type="button" onClick={closeTradeIn} aria-label="Cerrar" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fg/[.07] ring-1 ring-line transition hover:bg-fg/15">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Pasos">
                {STEPS.map((s, i) => (
                  <li key={s}>
                    <span className={clsx("block h-1 rounded-full transition-colors duration-500", i <= step ? "bg-brand" : "bg-fg/10")} />
                    <span className={clsx("mt-2 block text-xs font-semibold", i === step ? "text-fg" : "text-muted")}>
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
                    <Q title="¿Cuál te querés llevar?" hint="Elegilo y mirá en vivo cuánto pagás. Si todavía no sabés, seguí igual.">
                      <PhonePicker f={f} />
                    </Q>
                  )}
                  {step === 1 && <DeviceQuestions f={f} />}
                  {step === 2 && (
                    <>
                      <StateQuestions f={f} />
                      <NameField f={f} />
                      <p className="rounded-2xl bg-fg/[.05] p-3 text-sm text-muted">{f.settings.tradeIn.note}</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* resultado en vivo: solo la diferencia a pagar */}
            <div className="relative overflow-hidden border-t border-line bg-fg/[.04] px-6 py-4">
              <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-cyan/20 blur-[60px]" />
              <div className="pointer-events-none absolute -bottom-16 right-0 h-40 w-40 rounded-full bg-pink/25 blur-[60px]" />
              <LiveResult f={f} />
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
                <button type="button" onClick={f.send} disabled={!f.stateOk} className="flex min-h-[52px] flex-1 disabled:pointer-events-none disabled:opacity-30 items-center justify-center gap-2 rounded-full bg-[#1fae55] text-[16px] font-bold text-white transition hover:brightness-110">
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
