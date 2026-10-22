"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Aparece suave al entrar en pantalla. */
export function Reveal({ children, delay = 0, className, y = 40 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Texto que se "ilumina" palabra por palabra mientras scrolleás (estilo Apple). */
export function TextReveal({ text, highlight = [] }: { text: string; highlight?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <section className="relative border-t border-line bg-ink px-5 py-[20vh] md:px-8">
      <p
        ref={ref}
        className="title-lux mx-auto max-w-5xl text-[clamp(30px,4.6vw,60px)] !leading-[1.15]"
      >
        {words.map((w, i) => (
          <Word key={i} p={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} gradient={highlight.includes(w.replace(/[.,]/g, ""))}>
            {w}
          </Word>
        ))}
      </p>
    </section>
  );
}

function Word({ p, range, gradient, children }: { p: MotionValue<number>; range: [number, number]; gradient: boolean; children: string }) {
  const opacity = useTransform(p, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={"mr-[0.25em] inline-block " + (gradient ? "font-medium text-fg" : "")}>
      {children}
    </motion.span>
  );
}
