"use client";

import clsx from "clsx";
import { waLink } from "@/lib/format";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import { useSite } from "./SiteContext";

/** WhatsApp e Instagram solo con ícono (sin número ni texto a la vista). */
export function SocialButtons({ size = "md" }: { size?: "sm" | "md" }) {
  const { settings } = useSite();
  const cls = clsx(
    "grid place-items-center border border-line text-fg/80 transition duration-300 hover:border-fg hover:bg-fg hover:text-ink",
    size === "sm" ? "h-10 w-10" : "h-12 w-12",
  );
  const icon = size === "sm" ? "h-[18px] w-[18px]" : "h-5 w-5";
  return (
    <>
      <a
        href={waLink(settings.contact.whatsapp, "¡Hola Liberados! Quería hacer una consulta 🙂")}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        title="WhatsApp"
        className={cls}
      >
        <WhatsAppIcon className={icon} />
      </a>
      <a href={`https://instagram.com/${settings.contact.instagram}`} target="_blank" rel="noopener" aria-label="Instagram" title="Instagram" className={cls}>
        <InstagramIcon className={icon} />
      </a>
    </>
  );
}
