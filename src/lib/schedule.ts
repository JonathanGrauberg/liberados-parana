import type { DayHours } from "./types";

export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/** Hora actual en Argentina, sin depender de la zona del servidor o del visitante. */
function nowInArgentina(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export const todayInArgentina = () => nowInArgentina().day;

const toMin =(hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

export type OpenStatus = { open: boolean; label: string; detail: string };

export function openStatus(hours: DayHours[], date = new Date()): OpenStatus {
  const { day, minutes } = nowInArgentina(date);
  const today = hours[day];
  if (today?.open) {
    for (const r of today.ranges) {
      if (minutes >= toMin(r.from) && minutes < toMin(r.to)) {
        const left = toMin(r.to) - minutes;
        return {
          open: true,
          label: "Abierto ahora",
          detail: left <= 60 ? `Cierra en ${left} min` : `Hasta las ${r.to}`,
        };
      }
    }
    const later = today.ranges.find((r) => toMin(r.from) > minutes);
    if (later) return { open: false, label: "Cerrado ahora", detail: `Abre hoy a las ${later.from}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const h = hours[d];
    if (h?.open && h.ranges.length) {
      const when = i === 1 ? "mañana" : `el ${DAY_NAMES[d].toLowerCase()}`;
      return { open: false, label: "Cerrado ahora", detail: `Abre ${when} a las ${h.ranges[0].from}` };
    }
  }
  return { open: false, label: "Cerrado", detail: "" };
}

export function rangesText(h: DayHours) {
  if (!h.open || !h.ranges.length) return "Cerrado";
  return h.ranges.map((r) => `${r.from} a ${r.to}`).join(" · ");
}
