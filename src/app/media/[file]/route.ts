import { prisma } from "@/lib/prisma";

/** Sirve las fotos que sube el local (guardadas en la base de datos). */
export async function GET(_req: Request, ctx: RouteContext<"/media/[file]">) {
  const { file } = await ctx.params;
  if (!/^[\w.-]+$/.test(file)) return new Response("No encontrado", { status: 404 });
  const media = await prisma.media.findUnique({ where: { id: file } });
  if (!media) return new Response("No encontrado", { status: 404 });
  return new Response(new Uint8Array(media.data), {
    headers: { "Content-Type": media.mime, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
