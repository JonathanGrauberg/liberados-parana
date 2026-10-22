"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { waLink } from "@/lib/format";
import { defaultWelcome } from "@/lib/welcome";
import { useSite } from "./SiteContext";
import { scrollToId } from "./SmoothScroll";
import { WelcomeCard } from "./WelcomeCard";

const KEY = "lp-welcome-visto";

/** Cartel de ofertas que aparece una sola vez por visitante (y otra vez cuando el local lo cambia). */
export function WelcomePopup() {
  const { settings, products, openProduct, open: productOpen } = useSite();
  const w = settings.welcome ?? defaultWelcome;
  const product = products.find((p) => p.id === w.productId);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // ?cartel=1 lo fuerza (para ver cómo queda desde el panel)
    const forced = new URLSearchParams(location.search).has("cartel");
    if (!w.enabled && !forced) return;
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(KEY);
    } catch {}
    if (seen === String(w.version) && !forced) return;
    const t = setTimeout(() => setShow(true), 1400);
    return () => clearTimeout(t);
  }, [w.enabled, w.version]);

  const close = useCallback(() => {
    setShow(false);
    try {
      localStorage.setItem(KEY, String(w.version));
    } catch {}
  }, [w.version]);

  useEffect(() => {
    if (!show) return;
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [show, close]);

  function cta() {
    close();
    if (w.action === "producto" && product) setTimeout(() => openProduct(product), 300);
    else if (w.action === "canje") scrollToId("canje");
    else if (w.action === "whatsapp") window.open(waLink(settings.contact.whatsapp, `¡Hola Liberados! Vi en la web: ${w.title}`), "_blank");
    else scrollToId("catalogo");
  }

  return (
    <AnimatePresence>
      {show && !productOpen && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={w.title}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[680px]"
          >
            <WelcomeCard w={w} product={product} onCta={cta} onClose={close} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
