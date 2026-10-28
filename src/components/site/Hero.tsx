"use client";

import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { waLink } from "@/lib/format";
import { WhatsAppIcon } from "./icons";
import { useSite } from "./SiteContext";

const ease = [0.22, 1, 0.36, 1] as const;

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
    <section id="inicio" ref={ref} className="noise relative isolate flex min-h-[80svh] items-end overflow-hidden text-white md:min-h-[74svh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img src={photo} alt="Frente del local de Liberados Paraná" style={{ y, scale }} className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_35%]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(14,12,60,.6)_0%,rgba(14,12,60,.2)_35%,rgba(14,12,60,.55)_75%,transparent_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(14,12,60,.7),transparent_65%)]" />
      {/* en celular el texto va encima del cartel: un velo más para que se lea bien */}
      <div className="absolute inset-0 -z-10 bg-black/40 md:hidden" />
      {/* brillos con los colores del logo */}
      <div className="pointer-events-none absolute -bottom-40 -right-20 -z-10 h-[520px] w-[520px] rounded-full bg-pink/30 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 -z-10 h-[480px] w-[480px] rounded-full bg-cyan/20 blur-[140px]" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-28 md:px-8 md:pb-16">
        <h1 className="font-display max-w-4xl text-[clamp(44px,7vw,100px)] font-extrabold leading-[0.95] tracking-[-0.04em]">
          {["Tu próximo iPhone", "está acá."].map((w, n) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, y: 40, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, delay: 0.1 + n * 0.16, ease }}
              className={n === 1 ? "text-gradient text-gradient-anim block w-fit pb-2" : "block"}
              style={n === 1 ? { backgroundImage: "var(--brand-gradient)" } : undefined}
            >
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease }}
          className="mt-4 max-w-xl text-lg text-white/80 md:text-xl"
        >
          Nuevos y usados seleccionados. Tu iPhone lo tomamos como parte de pago.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <a href="#catalogo" className="btn-solid">
            Ver equipos <ArrowRight className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={() => startTradeIn()}
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-white/10 px-6 text-[16px] font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeftRight className="h-5 w-5" /> Entregar mi iPhone
          </button>
          <a
            href={waLink(settings.contact.whatsapp, "¡Hola Liberados! Quería hacer una consulta 🙂")}
            target="_blank"
            rel="noopener"
            aria-label="Consultar por WhatsApp"
            className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[#1fae55] text-white transition hover:scale-105"
          >
            <WhatsAppIcon className="h-6 w-6" />
          </a>
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-brand" />
    </section>
  );
}
