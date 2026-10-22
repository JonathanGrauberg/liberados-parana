"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight, Camera, Check, Image as ImageIcon, Loader2, Trash2, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { processImage, removeBg, uploadBlob } from "@/lib/image-client";

type Choice = "cutout" | "original" | "skip";
type Review = { original: Blob; cutout: Blob; label: string; resolve: (c: Choice) => void };

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  onColor?: (hex: string) => void;
};

/**
 * Subida de fotos pensada para el celular del local:
 * sacás la foto, opcionalmente la IA le quita el fondo, y queda lista para la web.
 */
export function ImageManager({ images, onChange, onColor }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [ai, setAi] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Revisión antes/después: la foto queda en espera hasta que el usuario elige
  const [review, setReview] = useState<Review | null>(null);
  const ask = (original: Blob, cutout: Blob, label: string) =>
    new Promise<Choice>((resolve) => setReview({ original, cutout, label, resolve }));

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const added: string[] = [];
    let colorDone = images.length > 0;
    try {
      for (const [i, file] of Array.from(files).entries()) {
        const label = files.length > 1 ? ` (${i + 1}/${files.length})` : "";
        let source: Blob = file;
        let trim = false;
        if (ai) {
          setBusy(`Quitando el fondo con IA${label}…`);
          const cutout = await removeBg(file, (pct) => pct < 100 && setBusy(`Preparando la IA (solo la primera vez) ${pct}%`));
          setBusy(`Elegí cómo queda${label}`);
          const choice = await ask(file, cutout, label);
          setReview(null);
          if (choice === "skip") continue;
          if (choice === "cutout") {
            source = cutout;
            trim = true;
          }
        }
        setBusy(`Optimizando${label}…`);
        const { blob, color } = await processImage(source, { trim });
        setBusy(`Subiendo${label}…`);
        added.push(await uploadBlob(blob));
        if (!colorDone) {
          onColor?.(color);
          colorDone = true;
        }
      }
      onChange([...images, ...added]);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Algo salió mal con la foto");
      if (added.length) onChange([...images, ...added]);
    } finally {
      setBusy(null);
      setReview(null);
      if (input.current) input.current.value = "";
    }
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...images];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((src, i) => (
          <div key={src} className="checker group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-contain p-2" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-text-dark px-2.5 py-1 text-xs font-bold text-white">Principal</span>}
            <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1">
              <div className="flex gap-1">
                {i > 0 && <IconBtn label="Mover a la izquierda" onClick={() => move(i, -1)}><ArrowLeft /></IconBtn>}
                {i < images.length - 1 && <IconBtn label="Mover a la derecha" onClick={() => move(i, 1)}><ArrowRight /></IconBtn>}
              </div>
              <IconBtn label="Quitar foto" danger onClick={() => onChange(images.filter((x) => x !== src))}><Trash2 /></IconBtn>
            </div>
          </div>
        ))}

        <button
          type="button"
          disabled={!!busy}
          onClick={() => input.current?.click()}
          className={clsx(
            "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3 text-center transition",
            busy ? "border-violet bg-violet/5" : "border-black/15 hover:border-violet hover:bg-violet/5",
          )}
        >
          {busy ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-violet" />
              <span className="text-sm font-medium text-violet">{busy}</span>
            </>
          ) : (
            <>
              <Camera className="h-8 w-8 text-violet" />
              <span className="font-semibold">Agregar fotos</span>
              <span className="text-xs text-text-mute">Cámara o galería</span>
            </>
          )}
        </button>
      </div>

      {review && <ReviewDialog review={review} />}

      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />

      <button
        type="button"
        onClick={() => setAi((v) => !v)}
        className={clsx(
          "mt-4 flex w-full items-start gap-3 rounded-2xl p-4 text-left ring-1 transition",
          ai ? "bg-[linear-gradient(120deg,rgba(62,230,232,.12),rgba(240,107,181,.12))] ring-violet/30" : "bg-black/[.03] ring-black/10",
        )}
        aria-pressed={ai}
      >
        <WandSparkles className={clsx("mt-0.5 h-6 w-6 shrink-0", ai ? "text-violet" : "text-text-mute")} />
        <span>
          <span className="block font-semibold">Quitar el fondo con IA {ai ? "· activado" : "· desactivado"}</span>
          <span className="block text-sm text-text-mute">
            La IA detecta el equipo y borra el fondo para que quede “flotando” como en las páginas de Apple. Antes de subirla te muestra el antes y después para que elijas. Funciona en el mismo celular.
          </span>
        </span>
      </button>
      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function IconBtn({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={clsx("grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow [&>svg]:h-4 [&>svg]:w-4", danger ? "text-red-600" : "text-text-dark")}
    >
      {children}
    </button>
  );
}

/** Fondos para probar cómo queda el recorte (como se verá en la web oscura o clara). */
const BACKS = [
  { id: "dark", label: "Web oscura", cls: "bg-[#0b0b0e]" },
  { id: "light", label: "Web clara", cls: "bg-[#f4f3ef]" },
  { id: "checker", label: "Transparente", cls: "checker" },
] as const;

/** Antes / después: el local elige si sube la foto sin fondo o la original. */
function ReviewDialog({ review }: { review: Review }) {
  const [back, setBack] = useState<(typeof BACKS)[number]["id"]>("dark");
  const urls = useMemo(() => ({ original: URL.createObjectURL(review.original), cutout: URL.createObjectURL(review.cutout) }), [review]);
  useEffect(
    () => () => {
      URL.revokeObjectURL(urls.original);
      URL.revokeObjectURL(urls.cutout);
    },
    [urls],
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Elegí cómo queda la foto">
      <div className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-white p-5 md:rounded-[28px] md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">¿Cómo queda mejor{review.label}?</h2>
            <p className="text-sm text-text-mute">La IA ya le sacó el fondo. Elegí con cuál te quedás.</p>
          </div>
          <button type="button" onClick={() => review.resolve("skip")} aria-label="Descartar esta foto" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/5 hover:bg-black/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <figure>
            <div className="aspect-square overflow-hidden rounded-2xl bg-[#f1f1f3] ring-1 ring-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urls.original} alt="Foto original" className="h-full w-full object-contain" />
            </div>
            <figcaption className="mt-2 text-center text-sm font-semibold text-text-mute">Original</figcaption>
          </figure>
          <figure>
            <div className={clsx("aspect-square overflow-hidden rounded-2xl ring-2 ring-violet transition-colors", BACKS.find((b) => b.id === back)!.cls)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urls.cutout} alt="Foto sin fondo" className="h-full w-full object-contain p-3 drop-shadow-[0_20px_24px_rgba(0,0,0,.35)]" />
            </div>
            <figcaption className="mt-2 text-center text-sm font-semibold text-violet">Sin fondo</figcaption>
          </figure>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-text-mute">Probar sobre:</span>
          {BACKS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBack(b.id)}
              className={clsx("rounded-full px-3 py-1.5 text-xs font-semibold transition", back === b.id ? "bg-text-dark text-white" : "bg-black/5 hover:bg-black/10")}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => review.resolve("original")} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-black/5 text-[16px] font-semibold hover:bg-black/10">
            <ImageIcon className="h-5 w-5" /> Usar la original
          </button>
          <button type="button" onClick={() => review.resolve("cutout")} className="bg-brand flex h-14 items-center justify-center gap-2 rounded-2xl text-[16px] font-bold text-ink hover:brightness-105">
            <Check className="h-5 w-5" /> Usar sin fondo
          </button>
        </div>
      </div>
    </div>
  );
}
