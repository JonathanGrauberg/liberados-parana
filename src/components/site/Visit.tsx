"use client";

import clsx from "clsx";
import { Navigation, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { DAY_NAMES, openStatus, rangesText, todayInArgentina, type OpenStatus } from "@/lib/schedule";
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
    <section id="local" className="scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">El local</p>
            <h2 className="title-lux mt-3 text-[clamp(34px,5vw,68px)]">
              Vení a conocernos. <b>Probalo antes de llevarlo.</b>
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <Reveal className="flex flex-col rounded-[28px] bg-ink-2 p-6 ring-1 ring-line md:p-8">
            {status && (
              <span
                className={clsx(
                  "inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold",
                  status.open ? "bg-emerald-400/15 text-emerald-500" : "bg-fg/10 text-fg/75",
                )}
              >
                <span className="relative flex h-2.5 w-2.5">
                  {status.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                  <span className={clsx("relative inline-flex h-2.5 w-2.5 rounded-full", status.open ? "bg-emerald-400" : "bg-muted")} />
                </span>
                {status.label} {status.detail && <span className="font-normal opacity-80">· {status.detail}</span>}
              </span>
            )}
            <p className="title-lux mt-5 text-[clamp(28px,3.4vw,44px)]">{contact.address}</p>
            <p className="mt-1 text-lg text-muted">{contact.city}</p>

            <ul className="mt-6 divide-y divide-line">
              {order.map((d) => (
                <li key={d} className={clsx("flex items-center justify-between py-3 text-[16px]", d === today ? "font-semibold text-fg" : "text-muted")}>
                  <span className="flex items-center gap-2">
                    {d === today && <span className="bg-brand h-2 w-2 rounded-full" />}
                    {DAY_NAMES[d]}
                    {d === today && <span className="text-sm font-normal text-accent">hoy</span>}
                  </span>
                  <span className="text-right tabular-nums">{rangesText(hours[d])}</span>
                </li>
              ))}
            </ul>
            {hoursNote && <p className="mt-4 rounded-2xl bg-pink/15 p-4 text-pink">{hoursNote}</p>}

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
              <a href={mapsUrl} target="_blank" rel="noopener" className="btn-solid">
                <Navigation className="h-4 w-4" /> Cómo llegar
              </a>
              <a
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                aria-label="Llamar al local"
                className="grid h-12 w-12 place-items-center rounded-full bg-fg/[.08] text-fg ring-1 ring-line transition hover:bg-fg/15"
              >
                <Phone className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <SocialButtons />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative h-[420px] overflow-hidden rounded-[28px] bg-ink-2 ring-1 ring-line md:h-full md:min-h-[520px]">
            <iframe
              title={`Mapa: ${contact.address}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(contact.mapsQuery)}&output=embed`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
