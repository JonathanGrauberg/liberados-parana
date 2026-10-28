"use client";

import clsx from "clsx";
import { Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import { Logo } from "./Logo";
import { useSite } from "./SiteContext";
import { SocialButtons } from "./SocialButtons";

const links = [
  { href: "#catalogo", label: "Equipos" },
  { href: "#canje", label: "Plan Canje" },
  { href: "#local", label: "El local" },
];

export function Nav() {
  const { search, startTradeIn, settings } = useSite();
  // "Plan Canje" abre el panel en vez de navegar
  const onLink = (e: React.MouseEvent, href: string) => {
    if (href !== "#canje") return;
    e.preventDefault();
    startTradeIn();
  };
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");

  // los elementos "pegados" debajo del navbar (buscador del catálogo) suben cuando el navbar se esconde
  useEffect(() => {
    document.documentElement.dataset.nav = hidden ? "hidden" : "shown";
  }, [hidden]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 30);
    setHidden(y > 600 && y > prev && !menu);
  });

  return (
    <>
      <DollarBar rate={settings.usdRate} updatedAt={settings.usdRateUpdatedAt} />
      <motion.header
        animate={{ y: hidden ? -122 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={clsx(
          "fixed inset-x-0 top-8 z-50 border-b transition-colors duration-500",
          scrolled || menu
            ? "glass border-line"
            : // arriba de todo va sobre la foto del local: siempre en blanco, aunque esté el modo claro
              "border-transparent [--fg:#ffffff] [--line:rgba(255,255,255,.18)] [--muted:rgba(255,255,255,.7)]",
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:h-[72px] md:px-8">
          <a href="#inicio" aria-label="Ir al inicio" className="shrink-0">
            <Logo />
          </a>
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => onLink(e, l.href)}
                  className="rounded-full px-4 py-2 text-[15px] font-medium text-fg/80 transition hover:bg-fg/10 hover:text-fg"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                search(q);
              }}
              className="relative hidden lg:block"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar productos"
                aria-label="Buscar productos"
                className="h-11 w-60 rounded-full bg-fg/[.07] pl-4 pr-11 text-[15px] text-fg outline-none ring-1 ring-line transition-all duration-500 placeholder:text-muted focus:w-72 focus:ring-cyan/50"
              />
              <button aria-label="Buscar" className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-fg/10 text-fg hover:bg-fg/20">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <div className="hidden items-center gap-2 sm:flex">
              <SocialButtons size="sm" />
            </div>
            <button
              onClick={() => setMenu((m) => !m)}
              className="grid h-11 w-11 place-items-center rounded-full text-fg hover:bg-fg/10 md:hidden"
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menu}
            >
              {menu ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass fixed inset-0 z-40 flex flex-col px-6 pt-32 md:hidden"
            onClick={() => setMenu(false)}
          >
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={(e) => onLink(e, l.href)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="title-lux border-b border-line py-5 text-3xl"
              >
                {l.label}
              </motion.a>
            ))}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex gap-3">
              <SocialButtons />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Franja fija arriba de todo con el dólar que carga el local en Panel › Ajustes (el mismo que usan los precios en pesos). */
function DollarBar({ rate, updatedAt }: { rate: number; updatedAt?: string }) {
  if (!rate) return null;
  const when = updatedAt
    ? new Date(updatedAt).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit", month: "2-digit" })
    : null;
  return (
    <div className="fixed inset-x-0 top-0 z-[51] flex h-8 items-center justify-center gap-2 border-b border-white/10 bg-[#120f3d]/95 px-4 text-[13px] text-white backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
      <span className="text-white/75">Dólar blue hoy</span>
      <b className="font-display tracking-tight">{money(rate)}</b>
      {when && <span className="hidden text-white/55 sm:inline">· actualizado {when}</span>}
    </div>
  );
}
