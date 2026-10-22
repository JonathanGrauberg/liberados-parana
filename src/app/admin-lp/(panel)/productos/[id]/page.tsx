import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageTitle } from "@/components/admin/ui";
import { readDB } from "@/lib/db";

export default async function EditProduct({ params }: PageProps<"/admin-lp/productos/[id]">) {
  const { id } = await params;
  const product = (await readDB()).products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <>
      <PageTitle title={product.name} subtitle="Editar producto" />
      <ProductForm product={product} />
    </>
  );
}
