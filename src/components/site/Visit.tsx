"use client";

import clsx from "clsx";
import { Navigation, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { DAY_NAMES, openStatus, rangesText, todayInArgentina, type OpenStatus } from "@/lib/schedule";
import { MapaParana } from "./MapaParana";
import { Reveal } from "./Reveal";
import { useSite } from "./SiteContext";
import { SocialButtons } from "./SocialButtons";

export function Visit() {
  const { settings } = useSite();
  const { contact, hours, hoursNote } = settings;

  // "abierto/cerrado" se calcula en el navegador para que siempre sea el actual
  const [status, setStatus] = useState<OpenStatus | null>(null);
  const [today, setToday] = useState(-1);
  useEffect(() => {
    const tick = () => {
      setStatus(openStatus(hours));
      setToday(todayInArgentina());
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [hours]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapsQuery)}`;
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <section id="local" className="scroll-mt-16 border-t border-line bg-ink px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">07 — El local</p>
            <h2 className="title-lux mt-4 text-[clamp(32px,4.4vw,58px)]">
              Vení a conocernos. <b>Probalo antes de llevarlo.</b>
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid border border-line lg:grid-cols-[1fr_1.15fr]">
          <Reveal className="flex flex-col p-6 md:p-10">
            {status && (
              <span
                className={clsx(
                  "inline-flex w-fit items-center gap-2.5 font-display text-[11px] uppercase tracking-[0.22em]",
                  status.open ? "text-emerald-300" : "text-muted",
                )}
              >
                <span className="relative flex h-2.5 w-2.5">
                  {status.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                  <span className={clsx("relative inline-flex h-2.5 w-2.5 rounded-full", status.open ? "bg-emerald-400" : "bg-muted")} />
                </span>
                {status.label} {status.detail && <span className="normal-case tracking-normal text-muted">· {status.detail}</span>}
              </span>
            )}
            <p className="title-lux mt-6 text-[clamp(28px,3.2vw,42px)] !font-medium">{contact.address}</p>
            <p className="mt-1 text-lg text-muted">{contact.city}</p>

            <ul className="mt-8 border-t border-line">
              {order.map((d) => (
                <li key={d} className={clsx("flex items-center justify-between border-b border-line py-3 text-[16px]", d === today ? "font-normal text-fg" : "text-muted")}>
                  <span className="flex items-center gap-2">
                    {d === today && <span className="h-[2px] w-4 bg-brand" />}
                    {DAY_NAMES[d]}
                    {d === today && <span className="text-gradient font-display text-[10px] font-medium uppercase tracking-[0.3em]">hoy</span>}
                  </span>
                  <span className="text-right tabular-nums">{rangesText(hours[d])}</span>
                </li>
              ))}
            </ul>
            {hoursNote && <p className="border-brand mt-4 border-l pl-4 text-fg/80">{hoursNote}</p>}

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
              <a href={mapsUrl} target="_blank" rel="noopener" className="btn-solid">
                <Navigation className="h-4 w-4" /> Cómo llegar
              </a>
              <a
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                aria-label="Llamar al local"
                className="grid h-12 w-12 place-items-center border border-line text-fg/80 transition duration-300 hover:border-fg hover:bg-fg hover:text-ink"
              >
                <Phone className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <SocialButtons />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative h-[440px] overflow-hidden border-t border-line bg-ink-2 md:h-[600px] lg:border-l lg:border-t-0">
            <MapaParana label={`${contact.address} · Paraná`} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
