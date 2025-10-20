

import styles from "../productos/new/new-product-page.module.css"
import { ComboForm } from "@/app/components/admin/combo-form";

export default function NewComboPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Agregar nuevo combo</h1>
      <ComboForm />
    </div>
  );
}
