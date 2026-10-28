"use client";

import { BellRing, MapPin, Phone } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { brand } from "@/brand.config";
import { waLink } from "@/lib/format";
import { WhatsAppIcon } from "./icons";
import { Logo } from "./Logo";
import { useSite } from "./SiteContext";
import { SocialButtons } from "./SocialButtons";

export function Footer() {
  const { settings, startTradeIn } = useSite();
  const { contact } = settings;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapsQuery)}`;

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink px-5 pb-10 pt-16 md:px-8 md:pt-20">
      <div className="mx-auto max-w-7xl">
        {/* Lista de ofertas por WhatsApp */}
        <div className="ring-brand relative p-7 md:p-10">
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="eyebrow flex items-center gap-2">
                <BellRing className="h-3.5 w-3.5" strokeWidth={1.5} /> Ofertas primero
              </p>
              <p className="title-lux mt-4 max-w-xl text-[clamp(26px,3.2vw,40px)]">
                Enterate antes que nadie de los ingresos y las promos.
              </p>
            </div>
            <a
              href={waLink(contact.whatsapp, "¡Hola Liberados! Quiero sumarme a la lista de difusión de ofertas 🙌")}
              target="_blank"
              rel="noopener"
              className="btn-outline shrink-0"
            >
              <WhatsAppIcon className="h-4 w-4" /> Sumarme a la lista
            </a>
          </div>
        </div>

        {/* Columnas */}
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{brand.description}</p>
          </div>
          <FooterCol title="Equipos">
            <li><a href="#catalogo" className="transition-colors hover:text-fg">Usados seleccionados</a></li>
            <li><a href="#catalogo" className="transition-colors hover:text-fg">Nuevos en caja</a></li>
            <li><button type="button" onClick={() => startTradeIn()} className="transition-colors hover:text-fg">Plan Canje</button></li>
          </FooterCol>
          <FooterCol title="Ayuda">
            <li><a href="#local" className="transition-colors hover:text-fg">Horarios</a></li>
            <li><a href={mapsUrl} target="_blank" rel="noopener" className="transition-colors hover:text-fg">Cómo llegar</a></li>
          </FooterCol>
          <FooterCol title="Contacto">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {contact.address}, {contact.city}
            </li>
            <li className="flex items-center gap-2 pt-2">
              <SocialButtons size="sm" />
              <a
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                aria-label="Llamar al local"
                className="grid h-10 w-10 place-items-center border border-line text-fg/80 transition duration-300 hover:border-fg hover:bg-fg hover:text-ink"
              >
                <Phone className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </li>
          </FooterCol>
        </div>


        <div className="mt-16 flex flex-col justify-between gap-2 border-t border-line pt-6 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} {brand.name}</p>
          <p>Precios sujetos a cambio sin previo aviso.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-5 space-y-3 text-[15px] text-fg/65">{children}</ul>
    </div>
  );
}

export function WhatsAppFab() {
  const { settings } = useSite();
  const { scrollY } = useScroll();
  const show = useTransform(scrollY, [500, 700], [0, 1]);
  const scale = useTransform(show, [0, 1], [0.6, 1]);
  return (
    <motion.a
      style={{ opacity: show, scale }}
      href={waLink(settings.contact.whatsapp, "¡Hola Liberados! Quería hacer una consulta 🙂")}
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-13 w-13 place-items-center border border-line-strong bg-ink/80 p-3.5 text-fg backdrop-blur transition duration-300 hover:border-fg hover:bg-fg hover:text-ink"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </motion.a>
  );
}
