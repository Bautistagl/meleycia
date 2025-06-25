import { ProductForm } from "@/app/components/admin/product-form"
import styles from "./edit-product-page.module.css"
import { supabase } from "@/lib/supabase"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  // Await params before destructuring or accessing its properties
  const { id } = await params; 

  const { data: product, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id) // Use the awaited 'id'
    .single()

  if (error || !product) {
    return <div className={styles.container}>Error loading product</div>
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
          description: product.descripcion,
          marca: product.marca,
          precio_oferta:product.precio_oferta,
          imageUrl: product.imageUrl,
        }}
      />
    </div>
  )
}