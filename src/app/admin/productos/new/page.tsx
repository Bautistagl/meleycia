
import { ProductForm } from "@/app/components/admin/product-form"
import styles from "./new-product-page.module.css"

export default function NewProductPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add New Product</h1>
      <ProductForm />
    </div>
  )
}
