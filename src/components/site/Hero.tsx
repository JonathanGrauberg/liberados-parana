"use client";

import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { WhatsAppIcon } from "./icons";
import { useSite } from "./SiteContext";
import { waLink } from "@/lib/format";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Encabezado corto: foto del local, propuesta en una línea y acceso directo a los equipos.
 * Va siempre sobre la foto, así que usa colores fijos (igual en modo claro u oscuro).
 */
export function Hero() {
  const { settings, startTradeIn } = useSite();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // parallax solo en la foto; el texto y los botones quedan quietos
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  const photo = settings.heroImage || "/local-cartel.jpg";

  return (
    <section id="inicio" ref={ref} className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-[#0b0b0e] text-[#ecebf0] md:min-h-[72svh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img src={photo} alt="Frente del local de Liberados Paraná" style={{ y, scale }} className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_35%]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,11,14,.55)_0%,rgba(11,11,14,.25)_35%,rgba(11,11,14,.92)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,11,14,.7),transparent_65%)]" />
      {/* en celular el texto va encima del cartel: un velo más para que se lea bien */}
      <div className="absolute inset-0 -z-10 bg-black/40 md:hidden" />
      {/* brillo suave con los colores del logo */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_85%_100%,rgba(240,107,181,.22),transparent_70%),radial-gradient(50%_45%_at_10%_100%,rgba(62,230,232,.16),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-brand" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-28 md:px-8 md:pb-16">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="font-display text-[11px] uppercase tracking-[0.32em] text-white/70">
          Liberados Paraná · 25 de Mayo 181
        </motion.p>
        <h1 className="title-lux mt-5 max-w-3xl text-[clamp(40px,6.4vw,88px)] !leading-[0.98]">
          <span className="block overflow-hidden pb-1">
            <motion.span initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.1, ease }} className="block">
              Tu próximo iPhone
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-1">
            <motion.span initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.22, ease }} className="text-gradient block w-fit pb-1 font-medium" style={{ backgroundImage: "var(--brand-gradient)" }}>
              está acá.
            </motion.span>
          </span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease }}
          className="mt-5 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl"
        >
          Nuevos y usados seleccionados. Tu iPhone lo tomamos como parte de pago.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <a href="#catalogo" className="font-display inline-flex min-h-12 items-center gap-2.5 bg-[#ecebf0] px-6 text-[12px] font-medium uppercase tracking-[0.2em] text-[#0b0b0e] transition hover:bg-white">
            Ver equipos <ArrowRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => startTradeIn()}
            className="font-display inline-flex min-h-12 items-center gap-2.5 border border-white/40 px-6 text-[12px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#0b0b0e]"
          >
            <ArrowLeftRight className="h-4 w-4" /> Entregar mi iPhone
          </button>
          <a
            href={waLink(settings.contact.whatsapp, "¡Hola Liberados! Quería hacer una consulta 🙂")}
            target="_blank"
            rel="noopener"
            aria-label="Consultar por WhatsApp"
            className="grid h-12 w-12 place-items-center border border-white/40 text-white transition hover:bg-white hover:text-[#0b0b0e]"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
