"use client";

import clsx from "clsx";
import { Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useSite } from "./SiteContext";
import { SocialButtons } from "./SocialButtons";

const links = [
  { href: "#catalogo", label: "Catálogo" },
  { href: "#canje", label: "Plan Canje" },
  { href: "#local", label: "El local" },
];

export function Nav() {
  const { search } = useSite();
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
      <motion.header
        animate={{ y: hidden ? -90 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={clsx(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-700",
          scrolled || menu ? "border-line bg-ink/85 backdrop-blur-md" : "border-transparent",
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:h-[72px] md:px-8">
          <a href="#inicio" aria-label="Ir al inicio" className="shrink-0">
            <Logo />
          </a>
          <ul className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="group font-display relative text-[11px] uppercase tracking-[0.22em] text-fg/70 transition-colors hover:text-fg">
                  {l.label}
                  <span className="absolute -bottom-2 left-0 h-px w-0 bg-accent transition-all duration-500 group-hover:w-full" />
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
                className="h-10 w-56 border border-line bg-transparent pl-3.5 pr-10 text-[14px] text-fg outline-none transition-all duration-500 placeholder:text-muted focus:w-72 focus:border-line-strong"
              />
              <button aria-label="Buscar" className="absolute right-0 top-0 grid h-10 w-10 place-items-center text-muted hover:text-fg">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <div className="hidden items-center gap-2 sm:flex">
              <SocialButtons size="sm" />
            </div>
            <button
              onClick={() => setMenu((m) => !m)}
              className="grid h-11 w-11 place-items-center text-fg md:hidden"
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
            className="fixed inset-0 z-40 flex flex-col bg-ink/95 px-6 pt-24 backdrop-blur-md md:hidden"
            onClick={() => setMenu(false)}
          >
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="title-lux flex items-baseline gap-4 border-b border-line py-5 text-3xl"
              >
                <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
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
