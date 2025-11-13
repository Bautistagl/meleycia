
import Link from "next/link"
import { Plus } from "lucide-react"
import styles from "../productos/products-page.module.css"
import { CombosTable } from "@/app/components/admin/combos-table"

export default function CombosPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Combos</h1>
        <Link href="/admin/combos" className={styles.addButton}>
          <Plus className={styles.plusIcon} /> Agregar combos
        </Link>
      </div>
      <CombosTable />
    </div>
  );
}
