import { isAdmin } from "@/lib/auth";
import { uid } from "@/lib/db";
import { prisma } from "@/lib/prisma";

const EXT: Record<string, string> = {
  "image/webp": ".webp",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/avif": ".avif",
};

/** Recibe una foto ya optimizada en el navegador y la guarda en la base. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "No autorizado" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Falta el archivo" }, { status: 400 });
  const ext = EXT[file.type];
  if (!ext) return Response.json({ error: "Formato no soportado" }, { status: 400 });
  // Vercel acepta hasta ~4 MB por pedido; las fotos llegan ya achicadas a WebP (≈ 100–300 KB)
  if (file.size > 4 * 1024 * 1024) return Response.json({ error: "La imagen supera 4 MB" }, { status: 400 });
  const id = uid("img-") + ext;
  await prisma.media.create({ data: { id, mime: file.type, size: file.size, data: new Uint8Array(await file.arrayBuffer()) } });
  return Response.json({ url: `/media/${id}` });
}
