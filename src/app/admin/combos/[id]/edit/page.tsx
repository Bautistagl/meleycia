import { ProductForm } from "@/app/components/admin/product-form";
import styles from "../../../productos/[id]/edit/edit-product-page.module.css";
import { supabase } from "@/lib/supabase";
import { ComboEditForm } from "@/app/components/admin/combo-edit-form";

// Define an interface for the expected props of this page
// params is now expected to be a Promise in Next.js 15 for Server Components
interface EditProductPageProps {
  params: Promise<{
    id: string; // The 'id' from your dynamic route [id]
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  // You MUST await params in Next.js 15 when using these async props
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("combos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return <div className={styles.container}>Error loading product</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Productos</h1>

      <ComboEditForm
        initialData={{
          id: product.id,
          name: product.nombre,
          price: product.precio,
          stock: product.stock,
          descripcion: product.descripcion,
          precio_oferta: product.precio_oferta,
          imageUrl: product.imageUrl,
          codigo: product.codigo,
        }}
      />
    </div>
  );
}
