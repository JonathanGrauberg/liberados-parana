import { OffersEditor } from "@/components/admin/OffersEditor";
import { PageTitle } from "@/components/admin/ui";
import { readDB } from "@/lib/db";

export default async function Offers() {
  const { settings, products } = await readDB();
  return (
    <>
      <PageTitle title="Ofertas" subtitle="El cartel con ofertas que aparece cuando alguien entra a la web." />
      <OffersEditor settings={settings} products={products} />
    </>
  );
}
