"use client";

import clsx from "clsx";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/** Botón de modo claro / oscuro. Se recuerda en el navegador del visitante. */
export function ThemeToggle({ className }: { className?: string }) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.dataset.theme === "light");
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    if (next) document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("lp-theme", next ? "light" : "dark");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Pasar a modo oscuro" : "Pasar a modo claro"}
      title={light ? "Modo oscuro" : "Modo claro"}
      className={clsx(
        "grid h-10 w-10 place-items-center border border-line text-fg/80 transition duration-300 hover:border-fg hover:bg-fg hover:text-ink",
        className,
      )}
    >
      {light ? <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} />}
    </button>
  );
}
