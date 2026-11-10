"use client";

import clsx from "clsx";
import { waLink } from "@/lib/format";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import { useSite } from "./SiteContext";

/** WhatsApp e Instagram solo con ícono (sin número ni texto a la vista). Los íconos van escalados para que se vean del mismo tamaño. */
export function SocialButtons({ size = "md" }: { size?: "sm" | "md" }) {
  const { settings } = useSite();
  const cls = clsx("grid place-items-center rounded-full text-white transition hover:scale-110", size === "sm" ? "h-10 w-10" : "h-12 w-12");
  const icon = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  return (
    <>
      <a
        href={waLink(settings.contact.whatsapp, "¡Hola Liberados! Quería hacer una consulta 🙂")}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        title="WhatsApp"
        className={clsx(cls, "bg-[#1fae55]")}
      >
        <WhatsAppIcon className={clsx(icon, "scale-[.92]")} />
      </a>
      <a
        href={`https://instagram.com/${settings.contact.instagram}`}
        target="_blank"
        rel="noopener"
        aria-label="Instagram"
        title="Instagram"
        className={clsx(cls, "bg-[linear-gradient(135deg,#7b3fe4,#e1306c,#f7a34b)]")}
      >
        <InstagramIcon className={clsx(icon, "scale-[1.12]")} />
      </a>
    </>
  );
}
