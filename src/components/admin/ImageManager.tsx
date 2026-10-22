"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight, Camera, Loader2, Trash2, WandSparkles } from "lucide-react";
import { useRef, useState } from "react";
import { processImage, removeBg, uploadBlob } from "@/lib/image-client";

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

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const added: string[] = [];
    try {
      for (const [i, file] of Array.from(files).entries()) {
        const label = files.length > 1 ? ` (${i + 1}/${files.length})` : "";
        let source: Blob = file;
        if (ai) {
          setBusy(`Quitando el fondo con IA${label}…`);
          source = await removeBg(file, (pct) => pct < 100 && setBusy(`Preparando la IA (solo la primera vez) ${pct}%`));
        }
        setBusy(`Optimizando${label}…`);
        const { blob, color } = await processImage(source, { trim: ai });
        setBusy(`Subiendo${label}…`);
        added.push(await uploadBlob(blob));
        if (images.length === 0 && i === 0) onColor?.(color);
      }
      onChange([...images, ...added]);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Algo salió mal con la foto");
      if (added.length) onChange([...images, ...added]);
    } finally {
      setBusy(null);
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
            La inteligencia artificial detecta el equipo, borra el fondo y lo deja “flotando” como en las páginas de Apple. Funciona en el mismo celular, sin subir nada extra.
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
