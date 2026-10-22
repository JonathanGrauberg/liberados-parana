"use client";

/**
 * Procesamiento de fotos en el navegador del local (no consume servidor):
 *  - Quita el fondo con IA (modelo de segmentación ONNX que corre en el dispositivo).
 *  - Recorta al objeto, achica a un tamaño web y convierte a WebP.
 *  - Detecta el color dominante del equipo para el "brillo" de la web.
 */

const MAX = 1400;

export type Processed = { blob: Blob; color: string };

export async function removeBg(file: Blob, onProgress?: (pct: number) => void): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(file, {
    model: "isnet_fp16",
    output: { format: "image/png" },
    progress: (key, current, total) => {
      if (key.startsWith("fetch") && total) onProgress?.(Math.round((current / total) * 100));
    },
  });
}

export async function processImage(file: Blob, { trim }: { trim: boolean }): Promise<Processed> {
  const bmp = await createImageBitmap(file);
  let sx = 0,
    sy = 0,
    sw = bmp.width,
    sh = bmp.height;

  // Lienzo de análisis
  const probe = new OffscreenCanvas(bmp.width, bmp.height);
  const pctx = probe.getContext("2d", { willReadFrequently: true })!;
  pctx.drawImage(bmp, 0, 0);
  const data = pctx.getImageData(0, 0, bmp.width, bmp.height).data;

  if (trim) {
    let minX = bmp.width,
      minY = bmp.height,
      maxX = 0,
      maxY = 0;
    for (let y = 0; y < bmp.height; y += 2) {
      for (let x = 0; x < bmp.width; x += 2) {
        if (data[(y * bmp.width + x) * 4 + 3] > 16) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX > minX && maxY > minY) {
      const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.04);
      sx = Math.max(0, minX - pad);
      sy = Math.max(0, minY - pad);
      sw = Math.min(bmp.width - sx, maxX - minX + pad * 2);
      sh = Math.min(bmp.height - sy, maxY - minY + pad * 2);
    }
  }

  const scale = Math.min(1, MAX / Math.max(sw, sh));
  const out = new OffscreenCanvas(Math.round(sw * scale), Math.round(sh * scale));
  const octx = out.getContext("2d")!;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(bmp, sx, sy, sw, sh, 0, 0, out.width, out.height);
  const blob = await out.convertToBlob({ type: "image/webp", quality: 0.86 });

  return { blob, color: dominantColor(data, bmp.width, bmp.height) };
}

/** Promedio de los píxeles con color (ignora transparentes, blancos, negros y grises). */
function dominantColor(data: Uint8ClampedArray, w: number, h: number) {
  let r = 0,
    g = 0,
    b = 0,
    n = 0,
    gr = 0,
    gg = 0,
    gb = 0,
    gn = 0;
  const step = Math.max(1, Math.floor((w * h) / 40000));
  for (let i = 0; i < w * h; i += step) {
    const o = i * 4;
    if (data[o + 3] < 200) continue;
    const R = data[o],
      G = data[o + 1],
      B = data[o + 2];
    const max = Math.max(R, G, B),
      min = Math.min(R, G, B);
    gr += R;
    gg += G;
    gb += B;
    gn++;
    if (max - min < 28 || max < 40 || min > 235) continue;
    r += R;
    g += G;
    b += B;
    n++;
  }
  const hex = (x: number) => Math.round(x).toString(16).padStart(2, "0");
  if (n > gn * 0.08) return `#${hex(r / n)}${hex(g / n)}${hex(b / n)}`;
  if (gn) return `#${hex(gr / gn)}${hex(gg / gn)}${hex(gb / gn)}`;
  return "#7b7fdc";
}

export async function uploadBlob(blob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append("file", new File([blob], "foto.webp", { type: blob.type || "image/webp" }));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "No se pudo subir la foto");
  return json.url as string;
}
