import { AlertTriangle, CalendarClock, Megaphone, ImagePlus, Receipt } from "lucide-react";
import Link from "next/link";
import { Card, PageTitle, Stat } from "@/components/admin/ui";
import { readDB } from "@/lib/db";
import { dateTime, money } from "@/lib/format";
import { openStatus } from "@/lib/schedule";
import { inPeriod, summarize } from "@/lib/stats";

export default async function Dashboard() {
  const db = await readDB();
  const today = summarize(db.sales.filter((s) => inPeriod(s.date, "hoy")));
  const month = summarize(db.sales.filter((s) => inPeriod(s.date, "mes")));
  const low = db.products.filter((p) => p.stock <= 1).sort((a, b) => a.stock - b.stock);
  const noPhoto = db.products.filter((p) => p.visible && p.images.length === 0).length;
  const status = openStatus(db.settings.hours);
  const stockValue = db.products.reduce((s, p) => s + p.stock * (p.cost ?? 0), 0);

  return (
    <>
      <PageTitle title="¡Hola! 👋" subtitle={`${status.label}${status.detail ? " · " + status.detail : ""}`} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction href="/admin-lp/ventas?nueva=1" icon={<Receipt />} title="Registrar venta" tone="bg-brand text-ink" />
        <QuickAction href="/admin-lp/productos/nuevo" icon={<ImagePlus />} title="Cargar producto" tone="bg-text-dark text-white" />
        <QuickAction href="/admin-lp/ofertas" icon={<Megaphone />} title="Ofertas y cartel" tone="bg-white" />
        <QuickAction href="/admin-lp/horarios" icon={<CalendarClock />} title="Cambiar horarios" tone="bg-white" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Vendido hoy" value={money(today.total)} sub={`${today.count} ventas`} />
        <Stat label="Vendido este mes" value={money(month.total)} sub={`${month.units} unidades`} />
        <Stat label="Ganancia del mes" value={money(month.profit)} sub="Según costos cargados" />
        <Stat label="Mercadería en stock" value={money(stockValue)} sub="A precio de costo" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Últimas ventas</h2>
            <Link href="/admin-lp/ventas" className="text-sm font-semibold text-violet">Ver todas</Link>
          </div>
          {db.sales.length === 0 ? (
            <p className="mt-6 text-text-mute">Todavía no registraste ventas. Cuando vendas algo, tocá “Registrar venta” y el stock se descuenta solo.</p>
          ) : (
            <ul className="mt-3 divide-y divide-black/5">
              {db.sales.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
                    <p className="text-sm text-text-mute">{dateTime(s.date)} · {s.payment}</p>
                  </div>
                  <p className="shrink-0 font-semibold">{money(s.total)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-display flex items-center gap-2 text-xl font-bold">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Para reponer
          </h2>
          {low.length === 0 ? (
            <p className="mt-6 text-text-mute">Todo con stock. 🎉</p>
          ) : (
            <ul className="mt-3 divide-y divide-black/5">
              {low.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <Link href={`/admin-lp/productos/${p.id}`} className="flex items-center justify-between py-3 hover:text-violet">
                    <span className="font-medium">{p.name} {p.storage && <span className="text-text-mute">{p.storage}</span>}</span>
                    <span className={p.stock === 0 ? "rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-600" : "rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700"}>
                      {p.stock === 0 ? "Sin stock" : `Queda ${p.stock}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {noPhoto > 0 && (
            <p className="mt-4 rounded-2xl bg-violet/10 p-4 text-[15px] text-[#3b3fa8]">
              📸 {noPhoto} productos todavía no tienen foto. Con foto se venden mucho más: entrá a Productos y sumales una.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}

function QuickAction({ href, icon, title, tone }: { href: string; icon: React.ReactNode; title: string; tone: string }) {
  return (
    <Link href={href} className={`flex h-20 items-center gap-4 rounded-3xl px-6 text-lg font-bold shadow-[0_1px_12px_rgba(0,0,0,.05)] transition hover:-translate-y-0.5 ${tone}`}>
      <span className="[&>svg]:h-7 [&>svg]:w-7">{icon}</span> {title}
    </Link>
  );
}
