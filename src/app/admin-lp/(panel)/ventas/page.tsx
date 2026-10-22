import { SalesPanel } from "@/components/admin/SalesPanel";
import { PageTitle } from "@/components/admin/ui";
import { readDB } from "@/lib/db";

export default async function Sales({ searchParams }: PageProps<"/admin-lp/ventas">) {
  const db = await readDB();
  const { nueva } = await searchParams;
  return (
    <>
      <PageTitle title="Ventas y stock" subtitle="Lo que salió, a cuánto salió y lo que entró." />
      <SalesPanel products={db.products} sales={db.sales} moves={db.moves.slice(0, 200)} startOpen={nueva === "1"} usdRate={db.settings.usdRate} />
    </>
  );
}
