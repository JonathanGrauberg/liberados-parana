"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { CategoryId } from "@/brand.config";
import type { PublicProduct, Settings } from "@/lib/types";
import { scrollToId } from "./SmoothScroll";

type Ctx = {
  products: PublicProduct[];
  settings: Settings;
  open: PublicProduct | null;
  openProduct: (p: PublicProduct | null) => void;
  category: CategoryId | "todos";
  showCategory: (c: CategoryId | "todos") => void;
  setCategory: (c: CategoryId | "todos") => void;
  query: string;
  setQuery: (q: string) => void;
  search: (q: string) => void;
  tradeTarget: string | null;
  startTradeIn: (productId: string) => void;
};

const SiteCtx = createContext<Ctx | null>(null);

export function SiteProvider({ products, settings, children }: { products: PublicProduct[]; settings: Settings; children: ReactNode }) {
  const [open, setOpen] = useState<PublicProduct | null>(null);
  const [category, setCategory] = useState<CategoryId | "todos">("todos");
  const [query, setQuery] = useState("");
  const [tradeTarget, setTradeTarget] = useState<string | null>(null);

  const showCategory = useCallback((c: CategoryId | "todos") => {
    setCategory(c);
    scrollToId("catalogo");
  }, []);

  const search = useCallback((q: string) => {
    setQuery(q);
    setCategory("todos");
    scrollToId("catalogo");
  }, []);

  const startTradeIn = useCallback((id: string) => {
    setOpen(null);
    setTradeTarget(id);
    setTimeout(() => scrollToId("canje"), 250);
  }, []);

  const value = useMemo(
    () => ({ products, settings, open, openProduct: setOpen, category, setCategory, showCategory, query, setQuery, search, tradeTarget, startTradeIn }),
    [products, settings, open, category, showCategory, query, search, tradeTarget, startTradeIn],
  );
  return <SiteCtx value={value}>{children}</SiteCtx>;
}

export function useSite() {
  const v = useContext(SiteCtx);
  if (!v) throw new Error("useSite fuera de SiteProvider");
  return v;
}
