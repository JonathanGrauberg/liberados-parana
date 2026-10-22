import { Plus } from "lucide-react";
import Link from "next/link";
import { ProductList } from "@/components/admin/ProductList";
import { PageTitle } from "@/components/admin/ui";
import { readDB } from "@/lib/db";

export default async function Products() {
  const { products } = await readDB();
  return (
    <>
      <PageTitle
        title="Productos"
        subtitle={`${products.length} cargados · ${products.reduce((s, p) => s + p.stock, 0)} unidades en stock`}
        action={
          <Link href="/admin-lp/productos/nuevo" className="bg-brand inline-flex h-12 items-center gap-2 rounded-xl px-5 font-bold text-ink">
            <Plus className="h-5 w-5" /> Nuevo producto
          </Link>
        }
      />
      <ProductList products={products} />
    </>
  );
}
