'use client'
import styles from "./recent-items.module.css"
import { Edit } from "lucide-react";
import Link from "next/link"
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Producto } from "@/types";

export function RecentItems() {
  const [recentProducts, setRecentProducts] = useState<Producto[]>([]);

  useEffect(() => {
    async function fetchRecentProducts() {
      const { data, error } = await supabase
        .from("productos")
        .select(
          "id, nombre, categoria, precio, stock, created_at, descripcion, marca, precio_oferta, imageUrl, destacado, codigo"
        )
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        const products = data.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria,
          precio: p.precio,
          stock: p.stock,
          description: p.descripcion,
          marca: p.marca,
          imageUrl: p.imageUrl,
          precio_oferta: p.precio_oferta,
          destacado: p.destacado,
          codigo: p.codigo,
        }));
        setRecentProducts(products);
      }
    }

    fetchRecentProducts();
  }, []);

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

              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {recentProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.nombre}</td>
                <td>{product.categoria}</td>
                <td>${product.precio.toFixed(2)}</td>

                <td>
                  <div className={styles.actions}>
                    <Link
                      href={`/admin/productos/${product.id}/edit`}
                      className={styles.editButton}
                    >
                      <Edit size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}