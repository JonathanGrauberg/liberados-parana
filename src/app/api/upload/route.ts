import { promises as fs } from "node:fs";
import path from "node:path";
import { isAdmin } from "@/lib/auth";
import { UPLOAD_DIR, uid } from "@/lib/db";

const EXT: Record<string, string> = {
  "image/webp": ".webp",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/avif": ".avif",
};

/** Recibe una foto ya optimizada en el navegador y la guarda en data/uploads. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "No autorizado" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Falta el archivo" }, { status: 400 });
  const ext = EXT[file.type];
  if (!ext) return Response.json({ error: "Formato no soportado" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return Response.json({ error: "La imagen supera 10 MB" }, { status: 400 });
  const name = uid("img-") + ext;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/media/${name}` });
}
