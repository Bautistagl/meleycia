
import { ProductForm } from "@/app/components/admin/product-form"
import styles from "./new-product-page.module.css"

export default function NewProductPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Agregar nuevo producto</h1>
      <ProductForm />
    </div>
  );
}
