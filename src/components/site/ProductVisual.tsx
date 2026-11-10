"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

/**
 * Fotos del producto en un carrusel: se desliza con el dedo o el trackpad, y en PC con flechas.
 * `index`/`onIndex` opcionales para manejarlo desde afuera (miniaturas de la ficha).
 */
export function PhotoSlider({
  product,
  index,
  onIndex,
  onOpen,
  dim,
  className,
}: {
  product: PublicProduct;
  index?: number;
  onIndex?: (i: number) => void;
  onOpen?: () => void;
  dim?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(0);
  const count = Math.max(1, product.images.length);
  const go = (i: number, smooth = true) => {
    const el = ref.current;
    if (!el) return;
    const n = (i + count) % count;
    el.scrollTo({ left: n * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  };
  // desde afuera (miniaturas)
  useEffect(() => {
    if (index != null && index !== cur) go(index);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== cur) {
      setCur(i);
      onIndex?.(i);
    }
  };

  // en PC también se puede arrastrar con el mouse
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || count < 2 || !ref.current) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onMoveDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5 && !d.moved) {
      d.moved = true;
      el.style.scrollSnapType = "none";
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const onUpDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = ref.current;
    drag.current = null;
    if (!d || !el || !d.moved) return;
    const dx = e.clientX - d.x;
    const base = Math.round(d.left / el.clientWidth);
    const target = Math.abs(dx) > el.clientWidth * 0.15 ? base + (dx < 0 ? 1 : -1) : base;
    el.style.scrollSnapType = "";
    go(Math.max(0, Math.min(count - 1, target)));
    // que el arrastre no cuente como click para abrir la ficha
    const stop = (ev: Event) => ev.stopPropagation();
    el.addEventListener("click", stop, { capture: true, once: true });
    setTimeout(() => el.removeEventListener("click", stop, { capture: true }), 50);
  };

  return (
    <div className={clsx("group/slider absolute inset-0", className)}>
      <div
        ref={ref}
        onScroll={onScroll}
        onClick={onOpen}
        onPointerDown={onDown}
        onPointerMove={onMoveDrag}
        onPointerUp={onUpDrag}
        onPointerCancel={onUpDrag}
        className={clsx("no-scrollbar absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain", onOpen && "cursor-pointer", dim && "opacity-40 grayscale")}
      >
        {(product.images.length ? product.images : [""]).map((src, i) => (
          <div key={src + i} className="relative h-full w-full shrink-0 snap-center snap-always">
            <ProductPhotoFill product={product} index={i} />
          </div>
        ))}
      </div>
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => { e.stopPropagation(); go(cur - 1); }}
            className="absolute left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition hover:bg-black/65 group-hover/slider:opacity-100 md:grid"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Foto siguiente"
            onClick={(e) => { e.stopPropagation(); go(cur + 1); }}
            className="absolute right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition hover:bg-black/65 group-hover/slider:opacity-100 md:grid"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-10 flex justify-center gap-1.5">
            {product.images.map((_, i) => (
              <span key={i} className={clsx("h-1.5 rounded-full shadow-[0_0_6px_rgba(0,0,0,.5)] transition-all", i === cur ? "w-5 bg-white" : "w-1.5 bg-white/55")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
