import styles from "../../../productos/[id]/edit/edit-product-page.module.css";
import { supabase } from "@/lib/supabase";
import CategoriaForm from "../../catForm";

// Define an interface for the expected props of this page
// params is now expected to be a Promise in Next.js 15 for Server Components
interface EditProductPageProps {
  params: Promise<{
    id: string; // The 'id' from your dynamic route [id]
  }>;
}

export default async function EditCategoriaPage({
  params,
}: EditProductPageProps) {
  // You MUST await params in Next.js 15 when using these async props
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return <div className={styles.container}>Error cargando categorias</div>;
  }

  return (
    <div className={styles.container}>
  

<CategoriaForm id={product.id} name={product.nombre} />
    </div>
  );
}
