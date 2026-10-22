"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { categories } from "@/brand.config";
import { ProductVisual } from "./ProductVisual";
import { SectionHead } from "./SectionHead";
import { useSite } from "./SiteContext";

/** Grilla de categorías: celdas rectas unidas por líneas finas, con un producto real de cada una. */
export function Categories() {
  const { products, showCategory } = useSite();
  const cats = categories
    .map((c) => ({ ...c, items: products.filter((p) => p.category === c.id) }))
    .filter((c) => c.items.length);

  return (
    <section className="bg-ink px-5 pt-20 md:px-8 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <SectionHead n="02" label="Categorías" title={<>Comprá por <b>categoría.</b></>} link={{ href: "#catalogo", label: "Ver todo" }} />

        <div className="no-scrollbar -mx-5 mt-10 flex snap-x overflow-x-auto border-t border-line md:mx-0 md:grid md:grid-cols-4 md:border-l xl:grid-cols-7">
          {cats.map((c, i) => {
            const star = c.items.find((p) => p.images.length) ?? c.items[0];
            return (
              <motion.button
                key={c.id}
                onClick={() => showCategory(c.id)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.06 }}
                className="group relative w-[42vw] shrink-0 snap-start border-b border-r border-line bg-ink text-left transition-colors duration-500 hover:bg-ink-2 sm:w-[200px] md:w-auto"
              >
                <div className="relative aspect-square">
                  <div className="absolute inset-[22%] transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110">
                    <ProductVisual product={star} />
                  </div>
                  <span className="eyebrow absolute left-4 top-4 !text-[10px]">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex items-end justify-between gap-2 px-4 pb-4">
                  <div>
                    <p className="font-display text-[13px] uppercase tracking-[0.18em]">{c.label}</p>
                    <p className="mt-0.5 text-xs text-muted">{c.items.length} productos</p>
                  </div>
                  <ArrowRight className="h-4 w-4 -translate-x-2 text-accent opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <span className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-700 group-hover:w-full" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
