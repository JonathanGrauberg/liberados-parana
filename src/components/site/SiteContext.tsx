"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { PublicProduct, Settings } from "@/lib/types";
import { scrollToId } from "./SmoothScroll";

type Ctx = {
  products: PublicProduct[];
  settings: Settings;
  open: PublicProduct | null;
  openProduct: (p: PublicProduct | null) => void;
  query: string;
  setQuery: (q: string) => void;
  search: (q: string) => void;
  /** Panel del Plan Canje */
  canjeOpen: boolean;
  /** Equipo que el cliente quiere llevarse (si abrió el canje desde una tarjeta) */
  tradeTarget: string | null;
  setTradeTarget: (id: string | null) => void;
  startTradeIn: (productId?: string) => void;
  closeTradeIn: () => void;
};

const SiteCtx = createContext<Ctx | null>(null);

export function SiteProvider({ products, settings, children }: { products: PublicProduct[]; settings: Settings; children: ReactNode }) {
  const [open, setOpen] = useState<PublicProduct | null>(null);
  const [query, setQuery] = useState("");
  const [canjeOpen, setCanjeOpen] = useState(false);
  const [tradeTarget, setTradeTarget] = useState<string | null>(null);

  const search = useCallback((q: string) => {
    setQuery(q);
    scrollToId("catalogo");
  }, []);

  const startTradeIn = useCallback((id?: string) => {
    setOpen(null);
    if (id) setTradeTarget(id);
    setCanjeOpen(true);
  }, []);

  const closeTradeIn = useCallback(() => setCanjeOpen(false), []);

  const value = useMemo(
    () => ({ products, settings, open, openProduct: setOpen, query, setQuery, search, canjeOpen, tradeTarget, setTradeTarget, startTradeIn, closeTradeIn }),
    [products, settings, open, query, search, canjeOpen, tradeTarget, startTradeIn, closeTradeIn],
  );
  return <SiteCtx value={value}>{children}</SiteCtx>;
}

export function useSite() {
  const v = useContext(SiteCtx);
  if (!v) throw new Error("useSite fuera de SiteProvider");
  return v;
}
