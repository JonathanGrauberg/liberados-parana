import { ProductForm } from "@/components/admin/ProductForm";
import { PageTitle } from "@/components/admin/ui";
import { readDB } from "@/lib/db";
import { suppliersOf } from "@/lib/stats";

export default async function NewProduct() {
  const db = await readDB();
  return (
    <>
      <PageTitle title="Nuevo producto" subtitle="Sacale una foto, completá el precio y listo: aparece en la web al instante." />
      <ProductForm usdRate={db.settings.usdRate} suppliers={suppliersOf(db.products)} />
    </>
  );
}
