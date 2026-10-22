"use client";

import { Check, Copy, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { saveSettings } from "@/lib/actions";
import { DAY_NAMES } from "@/lib/schedule";
import type { DayHours } from "@/lib/types";
import { Button, Card, Field, Input, Toggle } from "./ui";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function HoursEditor({ hours: initial, note: initialNote }: { hours: DayHours[]; note: string }) {
  const [hours, setHours] = useState(initial);
  const [note, setNote] = useState(initialNote);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const update = (d: number, h: DayHours) => {
    setSaved(false);
    setHours(hours.map((x, i) => (i === d ? h : x)));
  };

  return (
    <div className="space-y-4">
      {ORDER.map((d) => {
        const h = hours[d];
        return (
          <Card key={d} className="!p-4 md:!p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display w-28 text-lg font-bold">{DAY_NAMES[d]}</p>
              <Toggle checked={h.open} onChange={(open) => update(d, { open, ranges: open && !h.ranges.length ? [{ from: "09:00", to: "13:00" }] : h.ranges })} label={h.open ? "Abierto" : "Cerrado"} />
              {d === 1 && (
                <button
                  type="button"
                  onClick={() => setHours(hours.map((x, i) => (i >= 2 && i <= 5 ? structuredClone(hours[1]) : x)))}
                  className="flex items-center gap-1.5 text-sm font-semibold text-violet"
                >
                  <Copy className="h-4 w-4" /> Copiar a martes–viernes
                </button>
              )}
            </div>
            {h.open && (
              <div className="mt-3 space-y-2">
                {h.ranges.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input type="time" value={r.from} onChange={(e) => update(d, { ...h, ranges: h.ranges.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)) })} className="max-w-36" />
                    <span className="text-text-mute">a</span>
                    <Input type="time" value={r.to} onChange={(e) => update(d, { ...h, ranges: h.ranges.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)) })} className="max-w-36" />
                    <button type="button" aria-label="Quitar horario" onClick={() => update(d, { ...h, ranges: h.ranges.filter((_, j) => j !== i) })} className="grid h-11 w-11 place-items-center rounded-full text-text-mute hover:bg-black/5">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                {h.ranges.length < 3 && (
                  <button type="button" onClick={() => update(d, { ...h, ranges: [...h.ranges, { from: "17:00", to: "21:00" }] })} className="flex items-center gap-1.5 text-sm font-semibold text-violet">
                    <Plus className="h-4 w-4" /> Agregar turno (ej. tarde)
                  </button>
                )}
              </div>
            )}
          </Card>
        );
      })}

      <Card>
        <Field label="Aviso especial (opcional)" hint="Ej.: “Este lunes feriado abrimos de 10 a 13”. Se muestra resaltado en la web.">
          <Input value={note} onChange={(e) => { setSaved(false); setNote(e.target.value); }} />
        </Field>
      </Card>

      <Button
        variant="brand"
        className="h-14 w-full text-lg md:w-auto md:px-10"
        disabled={pending}
        onClick={() => start(async () => { await saveSettings({ hours, hoursNote: note.trim() }); setSaved(true); })}
      >
        {saved ? <><Check className="h-5 w-5" /> Guardado</> : pending ? "Guardando…" : "Guardar horarios"}
      </Button>
    </div>
  );
}
