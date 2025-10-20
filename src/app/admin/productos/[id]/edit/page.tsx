import { ProductForm } from "@/app/components/admin/product-form";
import styles from "./edit-product-page.module.css";
import { supabase } from "@/lib/supabase";

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
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return <div className={styles.container}>Error loading product</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Productos</h1>

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
