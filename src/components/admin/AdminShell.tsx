"use client";

import clsx from "clsx";
import { CalendarClock, Megaphone, ExternalLink, LayoutDashboard, LogOut, Package, Receipt, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions";
import { Logo } from "../site/Logo";

const nav = [
  { href: "/admin-lp", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin-lp/productos", label: "Productos", icon: Package },
  { href: "/admin-lp/ventas", label: "Ventas y stock", short: "Ventas", icon: Receipt },
  { href: "/admin-lp/ofertas", label: "Ofertas y cartel", short: "Ofertas", icon: Megaphone },
  { href: "/admin-lp/horarios", label: "Horarios", icon: CalendarClock },
  { href: "/admin-lp/ajustes", label: "Ajustes", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin-lp" ? path === href : path.startsWith(href));

  return (
    <div className="min-h-dvh bg-[#f5f5f7] font-normal text-text-dark">
      {/* Barra lateral (PC) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-ink p-5 text-white lg:flex">
        <Link href="/admin-lp" className="px-2 py-3">
          <Logo />
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition",
                active(href) ? "bg-white/12 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className={clsx("h-5 w-5", active(href) && "text-cyan")} /> {label}
            </Link>
          ))}
        </nav>
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-white/60 hover:text-white">
          <ExternalLink className="h-5 w-5" /> Ver la web
        </a>
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-white/60 hover:text-white">
            <LogOut className="h-5 w-5" /> Salir
          </button>
        </form>
      </aside>

      {/* Barra superior (celular) */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-ink px-4 text-white lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <a href="/" target="_blank" className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Ver la web">
            <ExternalLink className="h-5 w-5" />
          </a>
          <form action={logoutAction}>
            <button className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Salir">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      <main className="px-4 pb-32 pt-6 lg:ml-64 lg:px-10 lg:pb-16 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Pestañas inferiores (celular) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-black/10 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {nav.map(({ href, label, short, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx("flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold", active(href) ? "text-violet" : "text-text-mute")}
          >
            <Icon className="h-6 w-6" />
            {short ?? label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
