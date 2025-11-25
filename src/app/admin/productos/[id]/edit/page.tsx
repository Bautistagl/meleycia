// admin/productos/[id]/edit/page.tsx
import { ProductForm } from "@/app/components/admin/product-form";
import styles from "./edit-product-page.module.css";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}

export default async function EditProductPage(props: EditProductPageProps) {
  const { id } = await props.params;
  const query = await props.searchParams;
  const queryString = new URLSearchParams(query).toString();

  const { data: product, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return <div className={styles.container}>Error loading product</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Producto</h1>

      <Link
        className={styles.volverButton}
        href={`/admin/productos?${queryString}`}
      >
        Volver
      </Link>

      <ProductForm
        initialData={{
          id: product.id,
          name: product.nombre,
          category: product.categoria,
          price: product.precio,
          stock: product.stock ? 1 : 0,
          descripcion: product.descripcion,
          marca: product.marca,
          precio_oferta: product.precio_oferta,
          imageUrl: product.imageUrl,
          destacado: product.destacado,
          codigo: product.codigo,
        }}
      />
    </div>
  );
}
