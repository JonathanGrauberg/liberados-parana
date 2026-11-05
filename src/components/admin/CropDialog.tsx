"use client";

import clsx from "clsx";
import { Check, Maximize, Minimize, Minus, Move, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from "react";

/** Mismo formato que el recuadro de las tarjetas del catálogo (4 : 3,4). */
export const CARD_ASPECT = 4 / 3.4;
const OUT_W = 1400;
const OUT_H = Math.round(OUT_W / CARD_ASPECT);
const MIN_Z = 0.3;
const MAX_Z = 5;

/** start: cómo arranca el encuadre. fill = llena el recuadro · fit = entra entera · pad = entera con aire (fotos sin fondo) */
export type CropRequest = { src: Blob; label: string; start: "fill" | "fit" | "pad"; resolve: (b: Blob | null) => void };

/**
 * Ajustar la foto "tipo foto de perfil": se arrastra para moverla, se hace zoom
 * (rueda, dos dedos o la barra) y lo que queda fuera del recuadro punteado se ve translúcido.
 */
export function CropDialog({ req }: { req: CropRequest }) {
  const url = useMemo(() => URL.createObjectURL(req.src), [req.src]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 }); // tamaño del recuadro en pantalla
  // z = 1 → la foto "llena" el recuadro (cover). x, y = corrimiento del centro, en px de pantalla
  const [z, setZ] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // escala para que la foto cubra el recuadro, y para que entre entera
  const cover = nat && box.w ? Math.max(box.w / nat.w, box.h / nat.h) : 1;
  const contain = nat && box.w ? Math.min(box.w / nat.w, box.h / nat.h) : 1;
  const fitZ = contain / cover;

  // al cargar: sin fondo → entera con un poco de aire; con fondo → que llene el recuadro; al reajustar → entera
  useEffect(() => {
    if (!nat || !box.w) return;
    setZ(req.start === "fill" ? 1 : req.start === "fit" ? fitZ : fitZ * 0.88);
    setPos({ x: 0, y: 0 });
  }, [nat, box.w > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const clampZ = (v: number) => Math.min(MAX_Z, Math.max(Math.min(MIN_Z, fitZ * 0.6), v));

  // arrastre y pellizco (dos dedos)
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const onDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), z };
    }
  };
  const onMove = (e: PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      setZ(clampZ((pinch.current.z * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.d));
      return;
    }
    setPos((p) => ({ x: p.x + e.clientX - prev.x, y: p.y + e.clientY - prev.y }));
  };
  const onUp = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };
  const onWheel = (e: WheelEvent) => setZ((v) => clampZ(v * (e.deltaY < 0 ? 1.08 : 1 / 1.08)));

  // la rueda dentro del recuadro no tiene que mover la página
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const stop = (e: globalThis.WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", stop, { passive: false });
    return () => el.removeEventListener("wheel", stop);
  }, []);

  const scale = cover * z; // px de pantalla por px de la foto
  const shown = nat ? { w: nat.w * scale, h: nat.h * scale } : { w: 0, h: 0 };

  async function save() {
    if (!nat || !box.w) return;
    setSaving(true);
    try {
      const bmp = await createImageBitmap(req.src);
      const k = OUT_W / box.w; // de px de pantalla a px de salida
      const c = new OffscreenCanvas(OUT_W, OUT_H);
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      const w = shown.w * k,
        h = shown.h * k;
      ctx.drawImage(bmp, OUT_W / 2 + pos.x * k - w / 2, OUT_H / 2 + pos.y * k - h / 2, w, h);
      req.resolve(await c.convertToBlob({ type: "image/png" }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Ajustar la foto">
      <div className="max-h-[96dvh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-white p-5 md:rounded-[28px] md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Ajustá la foto{req.label}</h2>
            <p className="flex items-center gap-1.5 text-sm text-text-mute">
              <Move className="h-4 w-4" /> Arrastrá para moverla y hacé zoom. Lo de adentro del recuadro es lo que se ve en la web.
            </p>
          </div>
          <button type="button" onClick={() => req.resolve(null)} aria-label="Descartar esta foto" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/5 hover:bg-black/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* escenario: la foto se ve completa y el recuadro marca lo que queda */}
        <div
          ref={stage}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onWheel={onWheel}
          className={clsx("checker relative mt-5 grid touch-none select-none place-items-center overflow-hidden rounded-2xl", "cursor-grab active:cursor-grabbing")}
          style={{ aspectRatio: "1 / 1" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            draggable={false}
            onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
            style={{ width: shown.w || undefined, height: shown.h || undefined, transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`, opacity: nat ? 1 : 0 }}
          />
          {/* recuadro: afuera queda oscurecido (translúcido), adentro la línea punteada */}
          <div
            ref={frame}
            className="pointer-events-none relative w-[86%] rounded-[18px] outline-2 outline-offset-0 outline-white outline-dashed shadow-[0_0_0_9999px_rgba(15,12,40,.62)]"
            style={{ aspectRatio: `${CARD_ASPECT}` }}
          >
            <span className="absolute inset-x-1/3 inset-y-0 border-x border-white/25" />
            <span className="absolute inset-x-0 inset-y-1/3 border-y border-white/25" />
          </div>
        </div>

        {/* zoom */}
        <div className="mt-4 flex items-center gap-3">
          <button type="button" aria-label="Alejar" onClick={() => setZ((v) => clampZ(v / 1.15))} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/5 hover:bg-black/10">
            <Minus className="h-5 w-5" />
          </button>
          <input
            type="range"
            aria-label="Zoom"
            min={Math.log(clampZ(0))}
            max={Math.log(MAX_Z)}
            step={0.01}
            value={Math.log(z)}
            onChange={(e) => setZ(clampZ(Math.exp(Number(e.target.value))))}
            className="h-2 flex-1 cursor-pointer accent-violet"
          />
          <button type="button" aria-label="Acercar" onClick={() => setZ((v) => clampZ(v * 1.15))} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/5 hover:bg-black/10">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => { setZ(fitZ); setPos({ x: 0, y: 0 }); }} className="flex items-center gap-1.5 rounded-full bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10">
            <Minimize className="h-4 w-4" /> Que entre entera
          </button>
          <button type="button" onClick={() => { setZ(1); setPos({ x: 0, y: 0 }); }} className="flex items-center gap-1.5 rounded-full bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10">
            <Maximize className="h-4 w-4" /> Llenar el recuadro
          </button>
        </div>

        <button
          type="button"
          disabled={!nat || saving}
          onClick={save}
          className="bg-brand mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-bold text-ink hover:brightness-105 disabled:opacity-50"
        >
          <Check className="h-5 w-5" /> {saving ? "Guardando…" : "Listo, usar así"}
        </button>
      </div>
    </div>
  );
}
