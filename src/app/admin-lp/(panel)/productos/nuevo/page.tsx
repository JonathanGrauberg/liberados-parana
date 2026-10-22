import { ProductForm } from "@/components/admin/ProductForm";
import { PageTitle } from "@/components/admin/ui";

export default function NewProduct() {
  return (
    <>
      <PageTitle title="Nuevo producto" subtitle="Sacale una foto, completá el precio y listo: aparece en la web al instante." />
      <ProductForm />
    </>
  );
}
