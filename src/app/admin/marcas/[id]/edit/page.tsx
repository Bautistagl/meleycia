import styles from "../../brand.module.css";
import { supabase } from "@/lib/supabase";

import BrandUploadForm from "../../brandForm";

// Define an interface for the expected props of this page
// params is now expected to be a Promise in Next.js 15 for Server Components
interface EditProductPageProps {
  params: Promise<{
    id: string; // The 'id' from your dynamic route [id]
  }>;
}

export default async function EditMarcaPage({
  params,
}: EditProductPageProps) {
  // You MUST await params in Next.js 15 when using these async props
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("marcas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return <div className={styles.container}>Error cargando categorias</div>;
  }

  return (
    <div className={styles.container}>


<BrandUploadForm id={product.id} name={product.marca} />
    </div>
  );
}
