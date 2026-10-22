"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { conditions } from "@/brand.config";
import type { PublicProduct } from "@/lib/types";
import { ProductVisual, Tilt } from "./ProductVisual";
import { Price } from "./Price";
import { useSite } from "./SiteContext";

/** Galería horizontal "fijada": scrolleás hacia abajo y los equipos pasan de costado. */
export function Featured() {
  const { products, openProduct } = useSite();
  const items = products.filter((p) => p.featured);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const calc = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [items.length]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);
  const bar = useTransform(smooth, [0, 1], ["0%", "100%"]);

  if (!items.length) return null;

  return (
    <section ref={section} className="relative bg-ink" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 w-full max-w-7xl px-5 md:mb-14 md:px-8">
          <p className="eyebrow">05 — Destacados</p>
          <h2 className="title-lux mt-4 text-[clamp(32px,4.4vw,58px)]">
            Lo más pedido <b>esta semana.</b>
          </h2>
        </div>
        <motion.div ref={track} style={{ x }} className="flex w-max gap-0 px-5 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {items.map((p) => (
            <FeaturedCard key={p.id} product={p} onOpen={() => openProduct(p)} />
          ))}
        </motion.div>
        <div className="mx-auto mt-12 h-px w-48 overflow-hidden bg-line">
          <motion.div style={{ width: bar }} className="h-full bg-accent" />
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ product, onOpen }: { product: PublicProduct; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group relative -ml-px flex h-[min(54vh,460px)] min-h-[360px] w-[66vw] shrink-0 flex-col border border-line bg-ink text-left transition-colors duration-500 first:ml-0 hover:bg-ink-2 sm:w-[300px]"
    >
      <div className="relative z-10 p-6 pb-0">
        <p className="eyebrow !text-[10px]">{conditions[product.condition].label}</p>
        <h3 className="mt-2 text-xl font-normal">{product.name}</h3>
        <p className="text-sm text-muted">{[product.storage, product.colorName].filter(Boolean).join(" · ")}</p>
      </div>
      <Tilt className="relative mx-8 my-5 min-h-0 flex-1" max={6}>
        <ProductVisual product={product} />
      </Tilt>
      <div className="relative z-10 flex items-end justify-between border-t border-line p-6">
        <div>
          <Price p={product} />
        </div>
        <span className="font-display text-[11px] uppercase tracking-[0.2em] text-muted transition-colors group-hover:text-fg">Ver →</span>
      </div>
      <span className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-700 group-hover:w-full" />
    </button>
  );
}
