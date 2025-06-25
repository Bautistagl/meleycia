'use client'
import styles from "./recent-items.module.css"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function RecentItems() {
  const [recentProducts, setRecentProducts] = useState<any[]>([])

  useEffect(() => {
    async function fetchRecentProducts() {
      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, categoria, precio, stock, created_at")
        .order("created_at", { ascending: false })
        .limit(6)

      if (!error && data) {
        const products = data.map((p) => ({
          id: p.id,
          name: p.nombre,
          category: p.categoria,
          price: p.precio,
          stock: p.stock ? 1 : 0,
          added: new Date(p.created_at).toISOString().split("T")[0],
        }))
        setRecentProducts(products)
      }
    }

    fetchRecentProducts()
  }, [])

  return (
    <div className={styles.recentItems}>
      <div className={styles.header}>
        <h2 className={styles.title}>Productos Recientes</h2>
        <Link href="/admin/productos" className={styles.viewAll}>
          Ver Todos
        </Link>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Agregado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {recentProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>{product.added}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/productos/${product.id}/edit`} className={styles.editButton}>
                      <Edit size={16} />
                    </Link>
                    <button className={styles.deleteButton}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}