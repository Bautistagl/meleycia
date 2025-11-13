
import Link from "next/link"
import { Plus } from "lucide-react"
import styles from "../productos/products-page.module.css"
import { MarcasTable } from "@/app/components/admin/marcas-table";

export default function CombosPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Marcas</h1>
        <Link href="/admin/marcas" className={styles.addButton}>
          <Plus className={styles.plusIcon} /> Agregar marcas
        </Link>
      </div>
      <MarcasTable />
    </div>
  );
}
