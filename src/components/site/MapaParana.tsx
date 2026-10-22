"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MAPA, proyectar, provinciasMapa } from "@/lib/mapaArgentina";
import { LogoMark } from "./Logo";

// Inclinación isométrica del plano (el pin la compensa para quedar de frente)
const ROT_X = 55;
const ROT_Z = -20;
const CAPAS = 10;
const ZOOM = 3.2;
const PARANA = { lat: -31.7319, lng: -60.5238 };
const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Argentina en 3D isométrico (provincias del IGN). Al entrar en pantalla,
 * la cámara "vuela" desde todo el país hasta el local en Paraná.
 */
export function MapaParana({ label }: { label: string }) {
  const uid = useId().replace(/:/g, "");
  const raiz = useRef<HTMLDivElement>(null);
  const visible = useInView(raiz, { once: true, margin: "-20% 0px" });
  const [zoom, setZoom] = useState(false);
  const [k, setK] = useState(1);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const medir = () => setK(Math.min(1, el.clientHeight / 640, el.clientWidth / 520));
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setZoom(true), 700);
    return () => clearTimeout(t);
  }, [visible]);

  const H = 820 * k;
  const W = (MAPA.ancho / MAPA.alto) * H;
  const pin = useMemo(() => {
    const p = proyectar(PARANA.lat, PARANA.lng);
    return { x: (p.x / MAPA.ancho) * W, y: (p.y / MAPA.alto) * H };
  }, [W, H]);

  const escala = zoom ? ZOOM : 1;
  const escalaPin = Math.pow(escala, -0.6);
  const camara = zoom ? { x: W / 2 - pin.x * ZOOM, y: H / 2 - pin.y * ZOOM, scale: ZOOM } : { x: 0, y: 0, scale: 1 };

  return (
    <div ref={raiz} className="absolute inset-0 overflow-hidden" style={{ perspective: "2400px" }}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <g id={`arg-${uid}`}>
            {provinciasMapa.map((p) => (
              <path key={p.nombre} d={p.d} />
            ))}
          </g>
          <linearGradient id={`er-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--cyan)" />
            <stop offset="0.5" stopColor="var(--violet)" />
            <stop offset="1" stopColor="var(--pink)" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: W,
          height: H,
          transformStyle: "preserve-3d",
          transform: `translate(-50%, -50%) rotateX(${ROT_X}deg) rotateZ(${ROT_Z}deg)`,
        }}
      >
        <motion.div
          className="absolute inset-0 origin-top-left"
          style={{ transformStyle: "preserve-3d" }}
          initial={false}
          animate={camara}
          transition={{ duration: 2, ease }}
        >
          {/* grosor del bloque */}
          {Array.from({ length: CAPAS }, (_, i) => (
            <svg
              key={i}
              viewBox={`0 0 ${MAPA.ancho} ${MAPA.alto}`}
              className="absolute inset-0 h-full w-full"
              style={{ transform: `translateZ(${-(i + 1) * 1.6}px)` }}
              aria-hidden
            >
              <use href={`#arg-${uid}`} fill={i === CAPAS - 1 ? "rgba(0,0,0,.6)" : "#1c1c22"} />
            </svg>
          ))}

          {/* superficie */}
          <svg viewBox={`0 0 ${MAPA.ancho} ${MAPA.alto}`} className="absolute inset-0 h-full w-full" role="img" aria-label="Mapa de Argentina con la ubicación del local en Paraná">
            {provinciasMapa.map((p) => {
              const er = p.nombre === "Entre Ríos";
              return (
                <path
                  key={p.nombre}
                  d={p.d}
                  fill={er ? "#16282b" : "#131317"}
                  fillOpacity={1}
                  stroke={er ? "var(--accent)" : "rgba(255,255,255,.14)"}
                  strokeWidth={er ? 1.2 : 0.6}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* pin del local */}
          <div className="absolute" style={{ left: pin.x, top: pin.y, transformStyle: "preserve-3d", zIndex: 5 }}>
            <span className="absolute -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-cyan/50" style={{ width: 16 / escala, height: 16 / escala }} />
            <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan" style={{ width: 6 / escala, height: 6 / escala }} />
            <div
              className="absolute bottom-0 left-0 block"
              style={{ transform: `rotateZ(${-ROT_Z}deg) rotateX(${-ROT_X}deg) scale(${escalaPin})`, transformOrigin: "0 0", transition: "transform 2s cubic-bezier(.16,1,.3,1)" }}
            >
              <span className="absolute bottom-0 left-0 block -translate-x-1/2" style={{ width: 56, height: 76 }}>
                <span
                  className="absolute inset-x-0 top-0 grid place-items-center border border-white/80 bg-ink shadow-[0_10px_24px_rgba(0,0,0,.6)]"
                  style={{ width: 56, height: 56, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)" }}
                >
                  <span style={{ transform: "rotate(45deg)" }} className="block w-7">
                    <LogoMark className="w-full" />
                  </span>
                </span>
              </span>
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: zoom ? 1 : 0, y: zoom ? 0 : 6 }}
                transition={{ delay: zoom ? 1.6 : 0, duration: 0.6 }}
                className="font-display absolute bottom-[88px] left-0 -translate-x-1/2 whitespace-nowrap border border-line-strong bg-ink/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-fg backdrop-blur"
              >
                {label}
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={() => setZoom((z) => !z)}
        className="link-line absolute bottom-5 right-5 bg-transparent"
      >
        {zoom ? "Ver Argentina" : "Ver Paraná"}
      </button>
    </div>
  );
}
