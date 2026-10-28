"use client";

import clsx from "clsx";
import { ExternalLink, Star } from "lucide-react";
import type { GoogleReviews } from "@/lib/reviews";
import { Reveal } from "./Reveal";
import { useSite } from "./SiteContext";

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={clsx("inline-flex gap-0.5", className)} aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={clsx("h-4 w-4", i <= Math.round(value) ? "fill-[#fbbc04] text-[#fbbc04]" : "text-fg/25")} />
      ))}
    </span>
  );
}

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Reseñas reales de Google en un carrusel. Vienen de la API de Google o de las que el local copia en Ajustes. */
export function Reviews({ data }: { data: GoogleReviews | null }) {
  const { settings } = useSite();
  // reseñas de Google (si hay clave) o las que copió el local en Ajustes; las mejores primero
  const list = (data?.reviews.length ? data.reviews : (settings.reviews ?? []).map((r) => ({ ...r, photo: undefined as string | undefined })))
    .filter((r) => r.rating >= 4 && r.text.trim())
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 12);
  const summary = data ? { rating: data.rating, total: data.total } : settings.reviewsSummary?.rating ? settings.reviewsSummary : null;
  const loop = list.length >= 3; // carrusel infinito cuando hay varias
  const mapsUrl = data?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.contact.mapsQuery)}`;

  return (
    <section id="resenas" className="scroll-mt-24 px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Reseñas</p>
            <h2 className="title-lux mt-3 text-[clamp(34px,5vw,64px)]">
              Lo que dicen <b>nuestros clientes.</b>
            </h2>
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener" className="flex items-center gap-4 rounded-[22px] bg-ink-2 px-5 py-4 ring-1 ring-line transition hover:bg-fg/[.08]">
            <GoogleG className="h-9 w-9" />
            {summary ? (
              <span>
                <span className="flex items-center gap-2">
                  <b className="font-display text-3xl font-extrabold">{summary.rating.toFixed(1).replace(".", ",")}</b>
                  <Stars value={summary.rating} />
                </span>
                <span className="block text-sm text-muted">{summary.total} reseñas en Google</span>
              </span>
            ) : (
              <span>
                <b className="block font-display text-lg font-bold">Mirá nuestras reseñas</b>
                <span className="block text-sm text-muted">en Google Maps</span>
              </span>
            )}
            <ExternalLink className="h-4 w-4 text-muted" />
          </a>
        </Reveal>

        {list.length > 0 && (
          <div className="group relative -mx-5 mt-10 overflow-hidden pl-5 md:-mx-8 md:pl-8 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
            <div className={clsx("flex w-max py-2", loop && "marquee")} style={{ ["--dur" as string]: `${list.length * 7}s` }}>
              {(loop ? [...list, ...list] : list).map((r, i) => (
                <figure key={i} aria-hidden={i >= list.length || undefined} className="mr-4 flex w-[300px] shrink-0 flex-col rounded-[24px] bg-ink-2 p-6 ring-1 ring-line md:w-[360px]">
                  <Stars value={r.rating} className="[&_svg]:h-5 [&_svg]:w-5" />
                  <blockquote className="mt-4 line-clamp-6 flex-1 text-[16px] leading-relaxed text-fg/90">“{r.text}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    {r.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photo} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full" />
                    ) : (
                      <span className="bg-brand grid h-10 w-10 place-items-center rounded-full font-bold text-[#07071a]">{r.author[0]?.toUpperCase()}</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{r.author}</span>
                      {r.when && <span className="block text-xs text-muted">{r.when}</span>}
                    </span>
                    <GoogleG className="h-5 w-5 shrink-0" />
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={mapsUrl} target="_blank" rel="noopener" className="btn-solid">
            <Star className="h-4 w-4" /> Dejanos tu reseña
          </a>
        </div>
      </div>
    </section>
  );
}
