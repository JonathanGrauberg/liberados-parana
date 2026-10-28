"use client";

import clsx from "clsx";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { PublicProduct } from "@/lib/types";
import { categoryIcon } from "./icons";

/** ¿La foto tiene el fondo recortado (esquina transparente)? */
function isCutout(img: HTMLImageElement) {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 8;
    const ctx = c.getContext("2d");
    if (!ctx) return true;
    ctx.drawImage(img, 0, 0, 8, 8);
    return ctx.getImageData(0, 0, 1, 1).data[3] < 20;
  } catch {
    return true;
  }
}

/**
 * Foto que llena todo el recuadro (tarjetas del catálogo). Si la foto tiene el fondo recortado,
 * se muestra entera con margen para no cortar el equipo; si tiene fondo propio, ocupa todo.
 */
export function ProductPhotoFill({ product, index = 0, className }: { product: PublicProduct; index?: number; className?: string }) {
  const [cut, setCut] = useState<boolean | null>(null);
  const ref = useRef<HTMLImageElement>(null);
  const img = product.images[index];
  const onLoad = () => ref.current && setCut(isCutout(ref.current));
  // si la foto ya estaba en caché, puede cargar antes de que React escuche el evento
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) onLoad();
  }, [img]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!img) {
    return (
      <div className="absolute inset-[13%]">
        <ProductVisual product={product} className={className} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img}
      alt={product.name}
      loading="lazy"
      ref={ref}
      draggable={false}
      onLoad={onLoad}
      className={clsx(
        "absolute h-full w-full transition-opacity duration-300",
        cut === false ? "inset-0 object-cover" : "inset-0 object-contain p-[10%] drop-shadow-[0_30px_40px_rgba(0,0,0,.25)]",
        cut === null && "opacity-0",
        className,
      )}
    />
  );
}

/**
 * Muestra la foto del producto. Si todavía no tiene foto, genera
 * una ilustración con el color del equipo, así el catálogo nunca se ve vacío.
 */
export function ProductVisual({ product, className, index = 0 }: { product: PublicProduct; className?: string; index?: number }) {
  const img = product.images[index];
  if (img) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img}
        alt={product.name}
        loading="lazy"
        draggable={false}
        className={clsx("h-full w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,.25)]", className)}
      />
    );
  }
  if (product.category === "celulares") return <PhoneArt color={product.color} className={className} />;
  const Icon = categoryIcon[product.category];
  return (
    <div className={clsx("relative grid h-full w-full place-items-center", className)}>
      <Icon className="h-[46%] w-[46%] text-fg/55" strokeWidth={0.9} />
    </div>
  );
}

/** Dorso de celular dibujado, con el color del equipo. */
function PhoneArt({ color, className }: { color: string; className?: string }) {
  return (
    <div className={clsx("relative grid h-full w-full place-items-center", className)}>
      <div
        className="relative aspect-[1/2.05] h-[86%] rounded-[16%/8%] shadow-[0_40px_60px_rgba(0,0,0,.28),inset_0_0_0_2px_rgba(255,255,255,.35)]"
        style={{
          background: `radial-gradient(120% 70% at 25% 10%, color-mix(in oklab, ${color}, white 25%), ${color} 50%, color-mix(in oklab, ${color}, black 25%))`,
        }}
      >
        <div
          className="absolute left-[7%] top-[4%] aspect-square w-[44%] rounded-[30%] shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_6px_14px_rgba(0,0,0,.2)]"
          style={{ background: `color-mix(in oklab, ${color}, white 14%)` }}
        >
          {[
            "left-[8%] top-[8%]",
            "left-[52%] top-[52%]",
          ].map((pos) => (
            <div
              key={pos}
              className={clsx("absolute aspect-square w-[40%] rounded-full shadow-[0_0_0_3px_#25262f,0_0_0_4px_rgba(255,255,255,.3)]", pos)}
              style={{ background: "radial-gradient(circle at 35% 35%, #4a5170, #0b0d18 50%, #000 72%)" }}
            />
          ))}
        </div>
        <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(120deg,rgba(255,255,255,.35),transparent_40%)]" />
      </div>
    </div>
  );
}

/** Envoltorio que inclina el contenido en 3D siguiendo el cursor, con brillo especular. */
export function Tilt({ children, className, max = 10 }: { children: React.ReactNode; className?: string; max?: number }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });
  const shine = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.35), transparent 55%)`;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    ry.set((x - 0.5) * max * 2);
    rx.set((0.5 - y) * max * 2);
    gx.set(x * 100);
    gy.set(y * 100);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }
  return (
    <div style={{ perspective: 900 }} className={className} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }} className="relative h-full w-full">
        {children}
        <motion.div style={{ background: shine }} className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </motion.div>
    </div>
  );
}
