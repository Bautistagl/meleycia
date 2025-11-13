
import Link from "next/link"
import { Plus } from "lucide-react"
import styles from "../productos/products-page.module.css"
import { CategoriasTable } from "@/app/components/admin/categorias-table";

export default function CombosPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categorias</h1>
        <Link href="/admin/categorias" className={styles.addButton}>
          <Plus className={styles.plusIcon} /> Agregar categorias
        </Link>
      </div>
      <CategoriasTable/>
    </div>
  );
}
