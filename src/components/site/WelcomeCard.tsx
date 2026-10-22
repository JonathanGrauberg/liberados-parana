"use client";

import clsx from "clsx";
import { ArrowRight, X } from "lucide-react";
import type { PublicProduct, WelcomePopup } from "@/lib/types";
import { LogoMark } from "./Logo";
import { ProductVisual } from "./ProductVisual";

/**
 * Diseño del cartel de bienvenida. Se usa en la web y como vista previa
 * en el panel, así lo que ve el local es exactamente lo que sale publicado.
 */
export function WelcomeCard({
  w,
  product,
  onCta,
  onClose,
}: {
  w: WelcomePopup;
  product?: PublicProduct;
  onCta?: () => void;
  onClose?: () => void;
}) {
  const light = w.theme === "light";
  return (
    <div className="@container w-full max-w-[680px]">
    <div
      className={clsx(
        "relative grid w-full overflow-hidden border font-normal @[520px]:grid-cols-[1fr_1.15fr]",
        light ? "border-black/10 bg-[#f4f3ef] text-[#141417]" : "border-line bg-ink text-fg",
      )}
    >
      {/* imagen */}
      <div className={clsx("relative h-48 @[520px]:h-auto @[520px]:min-h-[340px]", light ? "bg-[#e7e5df]" : "bg-ink-2")}>
        {w.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={w.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : product ? (
          <div className="absolute inset-[14%] drop-shadow-[0_24px_30px_rgba(0,0,0,.35)]">
            <ProductVisual product={product} />
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <LogoMark className="w-24" />
          </div>
        )}
      </div>

      {/* texto */}
      <div className="flex flex-col justify-center p-7 @[520px]:p-9">
        {w.eyebrow && (
          <p className={clsx("font-display text-[11px] uppercase tracking-[0.3em]", light ? "text-[#6b6a72]" : "text-muted")}>{w.eyebrow}</p>
        )}
        <h2 className="title-lux mt-3 break-words text-[32px] !font-medium !leading-[1] @[520px]:text-[42px]">{w.title}</h2>
        {w.text && <p className={clsx("mt-4 text-[15px] leading-relaxed", light ? "text-[#45444b]" : "text-fg/65")}>{w.text}</p>}
        {w.cta && (
          <button
            type="button"
            onClick={onCta}
            className={clsx(
              "font-display mt-7 inline-flex min-h-12 w-fit items-center gap-3 px-6 text-[12px] font-medium uppercase tracking-[0.2em] transition",
              light ? "bg-[#141417] text-white hover:bg-black" : "bg-fg text-ink hover:bg-white",
            )}
          >
            {w.cta} <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className={clsx(
          "absolute right-3 top-3 grid h-10 w-10 place-items-center border backdrop-blur transition",
          light ? "border-black/10 bg-white/60 hover:bg-white" : "border-line bg-ink/60 hover:bg-ink",
        )}
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
    </div>
  );
}
