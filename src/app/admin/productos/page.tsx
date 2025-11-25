"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import styles from "./products-page.module.css";
import { ProductsTable } from "@/app/components/admin/products-table";

export default function ProductsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Productos</h1>
        <Link href="/admin/productos/new" className={styles.addButton}>
          <Plus className={styles.plusIcon} /> Agregar productos
        </Link>
      </div>

      <Suspense>
        <ProductsTable />
      </Suspense>
    </div>
  );
}
