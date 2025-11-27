import styles from "../../brand.module.css";
import { supabase } from "@/lib/supabase";

import BrandUploadForm from "../../brandForm";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMarcaPage({ params }: EditProductPageProps) {
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
      <BrandUploadForm
        id={product.id}
        name={product.marca}
        oldName={product.marca}
      />
    </div>
  );
}
