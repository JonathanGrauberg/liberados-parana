"use client";

import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { WhatsAppIcon } from "./icons";
import { Reveal } from "./Reveal";
import { autoAdvance, DeviceQuestions, LiveResult, NameField, PhonePicker, Q, StateQuestions, useTradeInForm } from "./tradein-form";

/** Sección del Plan Canje: todas las preguntas a la vista y el "pagás" en vivo al costado. */
export function PlanCanje() {
  const [targetId, setTargetId] = useState<string | null>(null);
  const f = useTradeInForm(targetId, setTargetId);
  // autoscroll: al responder, la pregunta siguiente queda centrada en la pantalla (aunque ya se vea)
  const scrollTo = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const top = 110; // barra del dólar + menú
    const bottom = window.innerWidth >= 1024 ? 24 : 190; // en celular abajo está pegado el resultado
    const room = window.innerHeight - top - bottom;
    // si la pregunta es más alta que el espacio, se alinea arriba; si no, al centro
    const y = window.scrollY + r.top - top - (r.height < room ? (room - r.height) / 2 : 0);
    const lenis = (window as unknown as { __lenis?: { scrollTo(t: number): void } }).__lenis;
    if (lenis) lenis.scrollTo(y);
    else window.scrollTo({ top: y, behavior: "smooth" });
  };
  const goStep2 = () =>
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>("#canje-paso-2 [data-q]");
      if (el) scrollTo(el);
    }, 250);

  const result = (
    <div className="ring-brand relative overflow-hidden rounded-[28px] bg-[#0b0d2b]/90 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,.6)] backdrop-blur-xl md:p-7">
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-cyan/25 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-pink/30 blur-[70px]" />
      <LiveResult f={f} big />
      <button
        type="button"
        onClick={f.send}
        disabled={!f.deviceOk || !f.stateOk}
        className="relative mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#1fae55] text-[17px] font-bold text-white transition hover:brightness-110 disabled:opacity-40"
      >
        <WhatsAppIcon className="h-5 w-5" /> Enviar cotización por WhatsApp
      </button>
      <p className="relative mt-3 text-xs text-muted">{f.settings.tradeIn.note}</p>
    </div>
  );

  return (
    <section id="plan-canje" className="relative scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        {/* izquierda: título + resultado (fijo al bajar en PC) */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="eyebrow flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" /> Plan canje
            </p>
            <h2 className="title-lux mt-3 text-[clamp(38px,5.4vw,72px)] leading-[0.98]">
              Tu iPhone vale. <b>Pagá solo la diferencia.</b>
            </h2>
            <p className="mt-4 max-w-md text-lg text-muted">Elegí cuál te querés llevar, contanos cómo está el tuyo y mirá al instante cuánto pagás.</p>
          </Reveal>
          <div className="mt-8 hidden lg:block">{result}</div>
        </div>

        {/* derecha: preguntas */}
        <div className="space-y-9" onClick={autoAdvance(scrollTo)}>
          <Q n={1} title="¿Cuál te querés llevar?">
            <PhonePicker f={f} grid onPicked={goStep2} />
          </Q>
          <div id="canje-paso-2" className="scroll-mt-36 space-y-9">
            <DeviceQuestions f={f} grid numbered={2} />
          </div>
          <StateQuestions f={f} grid numbered={5} />
          <NameField f={f} n={8} />
          {/* en celular el resultado queda pegado abajo mientras se completa */}
          <div className="sticky bottom-24 z-10 lg:hidden">
            <div className="ring-brand relative flex items-end gap-3 overflow-hidden rounded-3xl bg-[#0b0d2b]/90 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,.7)] backdrop-blur-xl">
              <div className="min-w-0 flex-1">
                <LiveResult f={f} />
              </div>
              <button
                type="button"
                onClick={f.send}
                disabled={!f.deviceOk || !f.stateOk}
                aria-label="Enviar cotización por WhatsApp"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#1fae55] text-white transition disabled:opacity-40"
              >
                <WhatsAppIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted lg:hidden">{f.settings.tradeIn.note}</p>
        </div>
      </div>
    </section>
  );
}
